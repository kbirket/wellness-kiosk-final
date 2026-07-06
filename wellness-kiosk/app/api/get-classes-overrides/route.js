import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    let allRecords = [];
    let offset = null;
    do {
      const url = 'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Class Overrides') + (offset ? '?offset=' + offset : '');
      const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + token } });
      const data = await res.json();
      if (!res.ok || data.error) {
        return NextResponse.json({ success: false, error: data.error?.message || 'Failed to fetch overrides' }, { status: 500 });
      }
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset || null;
    } while (offset);
    
    return NextResponse.json({ records: allRecords });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
