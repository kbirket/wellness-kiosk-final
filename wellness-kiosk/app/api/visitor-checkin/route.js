// /app/api/visitor-checkin/route.js
// Check in a visitor — verifies PIN and expiration
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const body = await request.json();
    const { visitorAirtableId, pin, center } = body;

    // Fetch the visitor record
    const visitorRes = await fetch(`https://api.airtable.com/v0/${baseId}/Visitors/${visitorAirtableId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const visitor = await visitorRes.json();

    if (visitor.error) {
      return NextResponse.json({ success: false, error: 'Visitor not found' }, { status: 404 });
    }

    // Check PIN
    if (visitor.fields['PIN'] !== pin) {
      return NextResponse.json({ success: false, error: 'Incorrect PIN' }, { status: 401 });
    }

    // Check orientation
    if (!visitor.fields['Orientation Complete']) {
      return NextResponse.json({ success: false, error: 'orientation_required', message: 'Please see front desk to complete your orientation.' }, { status: 403 });
    }

    // Check expiration
    const expDate = new Date(visitor.fields['Expiration Date'] + 'T23:59:59');
    if (new Date() > expDate) {
      return NextResponse.json({ success: false, error: 'pass_expired', message: 'Your pass has expired. Please see the front desk.' }, { status: 403 });
    }

    // Log the visit in the Visits table
    const currentTime = new Date().toISOString();
    await fetch(`https://api.airtable.com/v0/${baseId}/Visits`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{
          fields: {
            "Center": center || 'Both',
            "Time": currentTime,
            "Check-in Method": "Kiosk (Visitor)",
            "Notes": `Visitor: ${visitor.fields['First Name']} ${visitor.fields['Last Name']} (${visitor.fields['Pass Type']})`,
          }
        }],
        typecast: true
      })
    });

    // Update visitor's visit count (increment Total Visits)
    const currentVisits = visitor.fields['Total Visits'] || 0;
    await fetch(`https://api.airtable.com/v0/${baseId}/Visitors/${visitorAirtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: { "Total Visits": currentVisits + 1 }
      })
    });

    return NextResponse.json({
      success: true,
      visitorName: `${visitor.fields['First Name']} ${visitor.fields['Last Name']}`,
      passType: visitor.fields['Pass Type'],
      expirationDate: visitor.fields['Expiration Date'],
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
