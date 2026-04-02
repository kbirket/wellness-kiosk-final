import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Visits';

  try {
    let allRecords = [];
    let offset = null;

    do {
      const params = new URLSearchParams();
      params.set('pageSize', '100');
      params.set('sort[0][field]', 'Check-in Time');
      params.set('sort[0][direction]', 'desc');
      if (offset) params.set('offset', offset);

      const response = await fetch(
        `https://api.airtable.com/v0/${baseId}/${tableName}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.error) {
        return NextResponse.json(
          { success: false, error: data.error.message },
          { status: 400 }
        );
      }

      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    return NextResponse.json({ success: true, records: allRecords });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
