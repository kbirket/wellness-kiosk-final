// /app/api/update-orientation/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';
  try {
    const { airtableId, completed, center } = await request.json();
    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing airtableId' }, { status: 400 });
    }

    const fieldsToUpdate = {};

    if (center === 'anthony') {
      fieldsToUpdate['Orientation Anthony'] = true;
      // Fetch the record to check if Harper is also done
      const checkRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const checkData = await checkRes.json();
      if (checkData.fields && checkData.fields['Orientation Harper']) {
        fieldsToUpdate['Needs Orientation'] = false;
      }
    } else if (center === 'harper') {
      fieldsToUpdate['Orientation Harper'] = true;
      // Fetch the record to check if Anthony is also done
      const checkRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const checkData = await checkRes.json();
      if (checkData.fields && checkData.fields['Orientation Anthony']) {
        fieldsToUpdate['Needs Orientation'] = false;
      }
    } else {
      // Legacy path: mark everything complete
      fieldsToUpdate['Needs Orientation'] = false;
      fieldsToUpdate['Orientation Anthony'] = true;
      fieldsToUpdate['Orientation Harper'] = true;
    }

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: fieldsToUpdate }),
    });
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message || 'Airtable Error' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
