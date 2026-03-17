import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function generatePIN() {
  let pin;
  do {
    pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  } while (pin === '0000' || pin === '1111');
  return pin;
}

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    const { airtableId } = await request.json();

    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing member ID' }, { status: 400 });
    }

    const newPIN = generatePIN();

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "Password": newPIN,
          "Has Custom PIN": false
        }
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message || "Airtable Error" }, { status: 400 });
    }

    return NextResponse.json({ success: true, pin: newPIN });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
