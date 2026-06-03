import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
const body = await request.json();
    const { recordId } = body;
    
    // Map known JS-style field names to Airtable field names
    const fieldMap = {
      paidMonths: 'Paid Months',
      contactName: 'Contact Name',
      contactEmail: 'Contact Email',
      address: 'Street Address',
      city: 'City',
      state: 'State',
      zip: 'Zip'
    };
    
    const fields = {};
    
    // Process known JS-style keys
    Object.keys(fieldMap).forEach(jsKey => {
      if (body[jsKey] !== undefined) {
        fields[fieldMap[jsKey]] = body[jsKey];
      }
    });
    
    // Also accept fields passed with their Airtable name directly (for new fields like 'Paid Months Harper')
    Object.keys(body).forEach(key => {
      if (key !== 'recordId' && !Object.keys(fieldMap).includes(key) && key.includes(' ')) {
        fields[key] = body[key];
      }
    });

    const res = await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Corporate%20Partners/${recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${process.env.AIRTABLE_PAT}`,
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
