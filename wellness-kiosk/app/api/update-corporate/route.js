import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { recordId, paidMonths, contactName, contactEmail, address, city, state, zip } = body;

    const fields = {};
    if (paidMonths !== undefined) fields['Paid Months'] = paidMonths;
    if (contactName !== undefined) fields['Contact Name'] = contactName;
    if (contactEmail !== undefined) fields['Contact Email'] = contactEmail;
    if (address !== undefined) fields['Street Address'] = address;
    if (city !== undefined) fields['City'] = city;
    if (state !== undefined) fields['State'] = state;
    if (zip !== undefined) fields['Zip'] = zip;

    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Corporate%20Partners/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields })
    });

    if (!res.ok) throw new Error('Airtable update failed');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
