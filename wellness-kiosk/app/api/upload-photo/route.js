// /app/api/upload-photo/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  var baseId = process.env.AIRTABLE_BASE_ID;
  var token = process.env.AIRTABLE_PAT;
  var tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    var body = await request.json();
    var airtableId = body.airtableId;
    var fileData = body.fileData;

    if (!airtableId || !fileData) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // fileData is already a base64 data URL like "data:image/jpeg;base64,..."
    // Store it directly in the Photo URL text field
    var res = await fetch(
      'https://api.airtable.com/v0/' + baseId + '/' + tableName + '/' + airtableId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'Photo URL': fileData,
          },
        }),
      }
    );

    var data = await res.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, photoUrl: fileData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
