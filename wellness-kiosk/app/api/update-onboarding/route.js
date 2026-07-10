import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    const { airtableId, fields } = await request.json();
    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
    }
    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ success: false, error: 'Fields object required' }, { status: 400 });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;

    // Whitelist of allowed field names — protects against arbitrary field updates
    const allowedFields = [
      'Basic Orientation',
      'Basic Orientation Date',
      'Paperwork Completed',
      'Paperwork Completed Date',
      '24/7 Access Orientation',
      '24/7 Access Orientation Date',
      'First Day Free',
      'First Day Free Date',
      'Onboarding Notes',
      'Is Minor',
      'Turns 18 Date',
      'Parent Permission Form',
      'Parent Permission Form Date'
    ];

    const cleanFields = {};
    Object.keys(fields).forEach(key => {
      if (allowedFields.includes(key)) {
        cleanFields[key] = fields[key];
      }
    });

    if (Object.keys(cleanFields).length === 0) {
      return NextResponse.json({ success: false, error: 'No valid fields to update' }, { status: 400 });
    }

    const res = await fetch(
      'https://api.airtable.com/v0/' + baseId + '/Members/' + airtableId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: cleanFields, typecast: true })
      }
    );

    const data = await res.json();

    if (!res.ok || data.error) {
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to update onboarding' }, { status: 500 });
    }

    return NextResponse.json({ success: true, fields: data.fields });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
