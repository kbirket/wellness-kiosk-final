import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  // 1. Grab the date from the URL (e.g., /api/classes?date=2024-04-08)
  const { searchParams } = new URL(request.url);
  const targetDate = searchParams.get('date');

  try {
    let allRecords = [];
    let offset = null;

    do {
      const params = new URLSearchParams();
      params.set('pageSize', '100');
      params.set('sort[0][field]', 'Date');
      params.set('sort[0][direction]', 'desc');
      
      // 2. If a date is provided, filter Airtable records before downloading
      if (targetDate) {
         // This assumes your Airtable column is exactly named "Date"
         params.set('filterByFormula', `IS_SAME({Date}, '${targetDate}', 'day')`);
      }

      if (offset) params.set('offset', offset);

      const response = await fetch(
        `https://api.airtable.com/v0/${baseId}/Class Rosters?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();

      if (data.error) {
        return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
      }

      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);

    return NextResponse.json({ success: true, records: allRecords });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
