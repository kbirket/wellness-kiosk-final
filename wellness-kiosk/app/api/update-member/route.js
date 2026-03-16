import { NextResponse } from 'next/server';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Members'; // Make sure this matches your main Airtable tab name!

  try {
    const body = await request.json();
    
    // We use PATCH to only update the specific fields provided
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${body.airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Email": body.email,
          "Phone": body.phone
        }
      })
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
