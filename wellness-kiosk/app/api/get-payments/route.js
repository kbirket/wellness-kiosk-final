import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Payments';
  try {
    var allRecords = [];
    var offset = null;
    do {
      var url = 'https://api.airtable.com/v0/' + baseId + '/' + tableName + '?sort[0][field]=Payment Date&sort[0][direction]=desc';
      if (offset) url += '&offset=' + offset;
      var response = await fetch(url, {
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
      });
      var data = await response.json();
      if (data.records) allRecords = allRecords.concat(data.records);
      offset = data.offset || null;
    } while (offset);
    return NextResponse.json({ records: allRecords });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
