import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  // NOTE: If your table in Airtable is named something else, change 'Corporate Partners' below!
  const tableName = 'Corporate Partners';

  try {
    const body = await request.json();
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${body.recordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Paid Months": body.paidMonths
        }
      })
    });

    const data = await response.json();
    if (data.error) return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
