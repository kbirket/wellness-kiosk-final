import { NextResponse } from 'next/server';

// Force Vercel to never cache this route so it always fires immediately
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
              "Members": [body.airtableId] 
            }
          }
        ],
        // This magic bullet forces Airtable to accept the data even if dropdown options are new!
        typecast: true 
      })
    });

    const data = await response.json();
    
    // If Airtable somehow still rejects it, this will tell Vercel exactly why!
    if (data.error) {
      console.error("Airtable Error:", data.error);
      return NextResponse.json({ success: false, error: data.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
