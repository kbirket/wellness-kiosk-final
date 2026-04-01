// /app/api/upload-photo/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    const { airtableId, fileName, fileType, fileData } = await request.json();

    if (!airtableId || !fileData) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Convert base64 data URL to raw base64
    var base64Content = fileData;
    if (base64Content.includes(',')) {
      base64Content = base64Content.split(',')[1];
    }

    // Upload to Airtable using the attachment URL method
    // Airtable accepts attachments as URLs, so we need to use a
    // temporary hosting approach. Instead, we use Airtable's
    // direct content upload via their attachment field.
    
    // Method: Create a temporary upload via Airtable's upload endpoint
    var uploadUrl = 'https://content.airtable.com/v0/' + baseId + '/uploadAttachment';
    
    var uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contentType: fileType,
        file: base64Content,
        filename: fileName,
      }),
    });

    // If the direct upload endpoint isn't available, fall back to
    // using a data URL approach with Airtable's standard API
    if (!uploadRes.ok) {
      // Airtable attachment fields accept URLs - use a data URI workaround
      // by writing the base64 as a URL Airtable can fetch
      // Actually, the simplest approach: write to the field as a URL
      
      // For Airtable, the most reliable method is to use their standard
      // PATCH with a publicly accessible URL. Since we don't have hosting,
      // we'll store the base64 directly and serve it from the app.
      
      // Simplest reliable approach: store base64 in a long text field
      // and use it as a data URL in the app.
      
      // But the BEST approach for Airtable attachments:
      // Use their standard attachment format with a data URL
      var patchRes = await fetch(
        'https://api.airtable.com/v0/' + baseId + '/' + tableName + '/' + airtableId,
        {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: {
              'Photo': [{ url: 'data:' + fileType + ';base64,' + base64Content, filename: fileName }],
            },
          }),
        }
      );

      var patchData = await patchRes.json();

      if (patchData.error) {
        // Airtable doesn't accept data URIs for attachments.
        // Fall back: store in a "Photo URL" text field as base64 data URL
        var fallbackRes = await fetch(
          'https://api.airtable.com/v0/' + baseId + '/' + tableName + '/' + airtableId,
          {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fields: {
                'Photo URL': 'data:' + fileType + ';base64,' + base64Content,
              },
            }),
          }
        );

        var fallbackData = await fallbackRes.json();
        if (fallbackData.error) {
          return NextResponse.json({ success: false, error: fallbackData.error.message }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          photoUrl: 'data:' + fileType + ';base64,' + base64Content,
        });
      }

      // Success with standard attachment
      var photoUrl = patchData.fields && patchData.fields['Photo'] && patchData.fields['Photo'].length > 0
        ? patchData.fields['Photo'][0].url
        : '';

      return NextResponse.json({ success: true, photoUrl: photoUrl });
    }

    var uploadData = await uploadRes.json();
    return NextResponse.json({ success: true, photoUrl: uploadData.url || '' });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
