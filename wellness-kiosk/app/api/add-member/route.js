import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    const body = await request.json();
    
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "First Name": body.firstName,
              "Last Name": body.lastName,
              "Email": body.email,
              "Phone": body.phone,
              "Plan Name": body.plan,
              "Home Center": body.center,
              // NEW: We are sending the Birthday to Airtable!
              "Birthday": body.birthday,
              "Membership Status": "ACTIVE"
            }
          }
        ],
        typecast: true 
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message || "Airtable Error" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
