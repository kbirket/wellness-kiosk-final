import { NextResponse } from 'next/server';

export async function POST(request) {
  // 1. Pull variables INSIDE the function for reliability
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
  const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || 'Members';

  try {
    const body = await request.json();
    const { airtableId, ...fields } = body;

    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing member record ID' }, { status: 400 });
    }

    // 2. Build the fields object
    const airtableFields = {};
    if (fields.firstName !== undefined) airtableFields['First Name'] = fields.firstName;
    if (fields.lastName !== undefined) airtableFields['Last Name'] = fields.lastName;
    if (fields.email !== undefined) airtableFields['Email'] = fields.email;
    if (fields.phone !== undefined) airtableFields['Phone'] = fields.phone;
    if (fields.address !== undefined) airtableFields['Street Address'] = fields.address;
    if (fields.city !== undefined) airtableFields['City'] = fields.city;
    if (fields.state !== undefined) airtableFields['State'] = fields.state;
    if (fields.zip !== undefined) airtableFields['Zip'] = fields.zip;
    if (fields.plan !== undefined) airtableFields['Plan Name'] = [fields.plan];
    if (fields.billingMethod !== undefined) airtableFields['Billing Method'] = fields.billingMethod;
    if (fields.center !== undefined) airtableFields['Home Center'] = fields.center;
    if (fields.sponsor !== undefined) airtableFields['Corporate Sponsor'] = fields.sponsor;
    if (fields.access247 !== undefined) airtableFields['24/7 Access'] = fields.access247;
    if (fields.badgeNumber !== undefined) airtableFields['Badge Number'] = fields.badgeNumber;
    if (fields.notes !== undefined) airtableFields['Notes'] = fields.notes;
    if (fields.discountCode !== undefined) airtableFields['Discount Code'] = fields.discountCode;
    if (fields.discountExpiration !== undefined) airtableFields['Discount Expiration'] = fields.discountExpiration || null;
    if (fields.monthlyRate !== undefined) airtableFields['Monthly Rate'] = fields.monthlyRate;

    // 3. Make the Request (Using Backticks for the Auth header)
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(MEMBERS_TABLE)}/${airtableId}`;
    
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: airtableFields }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Airtable response error:', errorData);
      return NextResponse.json({ 
        success: false, 
        error: errorData.error?.message || 'Airtable update failed' 
      }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, record: data });

  } catch (error) {
    console.error('Update member server error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
