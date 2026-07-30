import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/' + encodeURIComponent(process.env.AIRTABLE_TABLE_NAME || 'Members') + '/' + id,
      { headers: { 'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT } }
    );
    const data = await res.json();
    if (data.error) return NextResponse.json({ error: data.error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
