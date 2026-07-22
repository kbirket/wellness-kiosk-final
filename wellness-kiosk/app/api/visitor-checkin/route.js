// app/api/visitor-checkin/route.js
import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

export async function POST(request) {
  try {
    const { visitorAirtableId, center, decrementPass, visitDate } = await request.json();

    if (!visitorAirtableId) {
      return NextResponse.json({ success: false, error: 'Missing visitor ID' });
    }

    // The visit time: either a backdated value from staff, or right now.
    const visitISO = visitDate ? new Date(visitDate).toISOString() : new Date().toISOString();
    const visitMoment = new Date(visitISO);
    const isBackdated = !!visitDate;

    // 1. Get the visitor record
    const getRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Visitors/${visitorAirtableId}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const visitor = await getRes.json();
    if (visitor.error) {
      return NextResponse.json({ success: false, error: 'Visitor not found' });
    }

    // 2. Expiration is checked against the DATE OF THE VISIT, so a pass that has
    //    since lapsed can still have an old visit recorded against it.
    const expDate = visitor.fields['Expiration Date'];
    if (expDate) {
      const exp = new Date(expDate + 'T23:59:59');
      if (exp < visitMoment) {
        return NextResponse.json({
          success: false,
          error: isBackdated
            ? 'That pass had already expired on the date you entered.'
            : 'Pass has expired. Please see front desk.'
        });
      }
    }

    // 3. Orientation must be complete
    if (!visitor.fields['Orientation Complete']) {
      return NextResponse.json({ success: false, error: 'Orientation required. Please see front desk.' });
    }

    // 4. Build the update: visit count, and the pass decrement in the SAME patch.
    const currentVisits = Number(visitor.fields['Total Visits'] || 0);
    const fields = { 'Total Visits': currentVisits + 1 };

    let newPassesRemaining = null;
    const rawPasses = visitor.fields['Passes Remaining'];
    const hasPassCount = rawPasses !== undefined && rawPasses !== null && rawPasses !== '';

    if (decrementPass && hasPassCount) {
      const currentPasses = Number(rawPasses || 0);
      if (currentPasses <= 0) {
        return NextResponse.json({ success: false, error: 'No passes remaining.' });
      }
      newPassesRemaining = Math.max(0, currentPasses - 1);
      fields['Passes Remaining'] = newPassesRemaining;
    } else if (hasPassCount) {
      newPassesRemaining = Number(rawPasses || 0);
    }

    const updateRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Visitors/${visitorAirtableId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      }
    );
    const updateResult = await updateRes.json();
    if (updateResult.error) {
      return NextResponse.json({
        success: false,
        error: updateResult.error.message || 'Failed to update visit count'
      });
    }

    // 5. Log to the Visits table so it shows in the check-in log and reports
    try {
      await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Visits`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'Name': `${visitor.fields['First Name']} ${visitor.fields['Last Name']} (Visitor)`,
              'Center': center || 'Anthony',
              'Time': visitISO,
              'Method': isBackdated ? 'Staff Entry - Backdated' : 'Kiosk - Visitor',
            },
          }),
        }
      );
    } catch (visitLogErr) {
      console.error('Could not log to Visits table:', visitLogErr);
    }

    return NextResponse.json({
      success: true,
      totalVisits: currentVisits + 1,
      passesRemaining: newPassesRemaining,
      visitTime: visitISO
    });
  } catch (err) {
    console.error('Visitor check-in error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Server error' });
  }
}
