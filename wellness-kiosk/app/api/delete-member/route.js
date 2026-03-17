import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    const body = await request.json();
    const { airtableId } = body;

    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
