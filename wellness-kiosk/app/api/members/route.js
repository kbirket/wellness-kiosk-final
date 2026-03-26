import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members'; 

  // We create an empty array to hold everyone, and a variable for the 'page' marker
  let allRecords = [];
  let offset = null;

  try {
    do {
      // If we have an offset from the previous loop, attach it to the URL
      let url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
      if (offset) {
        url += `?offset=${encodeURIComponent(offset)}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store'
      });

      const data = await response.json();
      
      // If Airtable is mad about the members, send the error to the screen!
      if (data.error) {
        return NextResponse.json({ success: false, error: data.error }, { status: 400 });
      }

      // Add this batch of 100 members to our giant master list
      if (data.records) {
        allRecords = [...allRecords, ...data.records];
      }

      // Airtable gives us an "offset" code if there is another page of records.
      // If they don't give us one, offset becomes undefined and the loop STOPS.
      offset = data.offset;

    } while (offset);

    // Send the massive, complete list back to your frontend!
    return NextResponse.json({ records: allRecords });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
