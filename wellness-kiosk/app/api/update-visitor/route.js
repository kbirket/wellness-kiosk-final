// app/api/update-visitor/route.js
import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const VISITORS_TABLE = process.env.AIRTABLE_VISITORS_TABLE || 'Visitors';

export async function POST(request) {
  try {
    const body = await request.json();
    const { visitorAirtableId, ...fields } = body;

    if (!visitorAirtableId) {
      return NextResponse.json({ success: false, error: 'Missing visitor record ID' }, { status: 400 });
    }

    // Build the Airtable fields object, mapping frontend keys to Airtable field names
    const airtableFields = {};

    if (fields.firstName !== undefined) airtableFields['First Name'] = fields.firstName;
    if (fields.lastName !== undefined) airtableFields['Last Name'] = fields.lastName;
    if (fields.email !== undefined) airtableFields['Email'] = fields.email;
    if (fields.phone !== undefined) airtableFields['Phone'] = fields.phone;
    if (fields.address !== undefined) airtableFields['Street Address'] = fields.address;
    if (fields.city !== undefined) airtableFields['City'] = fields.city;
    if (fields.state !== undefined) airtableFields['State'] = fields.state;
    if (fields.zip !== undefined) airtableFields['Zip'] = fields.zip;
    if (fields.passType !== undefined) airtableFields['Pass Type'] = fields.passType;
    if (fields.center !== undefined) airtableFields['Center'] = fields.center;
    if (fields.referringProvider !== undefined) airtableFields['Referring Provider'] = fields.referringProvider;
    if (fields.notes !== undefined) airtableFields['Notes'] = fields.notes;
    if (fields.passActivated !== undefined) airtableFields['Pass Activated'] = fields.passActivated;

    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${VISITORS_TABLE}/${visitorAirtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: airtableFields }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json({ success: false, error: errorData.error?.message || 'Airtable update failed' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, record: data });

  } catch (error) {
    console.error('Update visitor error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
