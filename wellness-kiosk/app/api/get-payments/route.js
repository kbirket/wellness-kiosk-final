import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  // This matches your screenshot exactly!
  const tableName = 'Payments';

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?sort[0][field]=Payment Date&sort[0][direction]=desc`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json();
    return NextResponse.json({ records: data.records });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
