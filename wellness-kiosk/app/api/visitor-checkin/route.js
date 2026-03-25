// app/api/visitor-checkin/route.js

import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

export async function POST(request) {
  try {
    const { visitorAirtableId, center } = await request.json();

    if (!visitorAirtableId) {
      return NextResponse.json({ success: false, error: 'Missing visitor ID' });
    }

    // 1. Get the visitor record to check expiration and get current visit count
    const getRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Visitors/${visitorAirtableId}`,
      { headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` } }
    );
    const visitor = await getRes.json();

    if (visitor.error) {
      return NextResponse.json({ success: false, error: 'Visitor not found' });
    }

    // 2. Check if pass is expired
    const expDate = visitor.fields['Expiration Date'];
    if (expDate) {
      const exp = new Date(expDate + 'T23:59:59');
      if (exp < new Date()) {
        return NextResponse.json({ success: false, error: 'Pass has expired. Please see front desk.' });
      }
    }

    // 3. Check orientation
    if (!visitor.fields['Orientation Complete']) {
      return NextResponse.json({ success: false, error: 'Orientation required. Please see front desk.' });
    }

    // 4. Increment Total Visits
    const currentVisits = Number(visitor.fields['Total Visits'] || 0);
    const updateRes = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Visitors/${visitorAirtableId}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Total Visits': currentVisits + 1,
          },
        }),
      }
    );
    const updateResult = await updateRes.json();

    if (updateResult.error) {
      return NextResponse.json({ success: false, error: 'Failed to update visit count' });
    }

    // 5. Also log to the Visits table (same as member check-ins) so it shows in the dashboard
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
              'Time': new Date().toISOString(),
              'Method': 'Kiosk - Visitor',
            },
          }),
        }
      );
    } catch (visitLogErr) {
      // Non-critical — visitor count was already updated
      console.error('Could not log to Visits table:', visitLogErr);
    }

    return NextResponse.json({ success: true, totalVisits: currentVisits + 1 });
  } catch (err) {
    console.error('Visitor check-in error:', err);
    return NextResponse.json({ success: false, error: 'Server error' });
  }
}
