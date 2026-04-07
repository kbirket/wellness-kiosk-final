import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Visits'; 
  try {
    const body = await request.json();
    
    var fields = {
      "Center": body.center,
      "Check-in Method": body.method,
      "Members": [body.airtableId]
    };
    
    if (body.time) {
      fields["Check-in Time"] = body.time;
    }
    
    const response = await fetch('https://api.airtable.com/v0/' + baseId + '/' + tableName, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields: fields }],
        typecast: true 
      })
    });
    const data = await response.json();
    
    if (data.error) {
      var errorMessage = data.error.message || data.error.type || JSON.stringify(data.error);
      return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
    }
    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
