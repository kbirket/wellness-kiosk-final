import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Visits'; 

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
              "Check-in Time": body.time,
              "Center": body.center,
              "Check-in Method": body.method,
              // Only sending to the correct 'Members' column!
              "Members": [body.airtableId] 
            }
          }
        ],
        typecast: true 
      })
    });

    const data = await response.json();
    
    if (data.error) {
      const errorMessage = data.error.type || data.error.message || JSON.stringify(data.error);
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
