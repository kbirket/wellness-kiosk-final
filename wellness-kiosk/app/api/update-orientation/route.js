import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';
  try {
    const { airtableId, center, status, clearNeedsOrientation } = await request.json();
    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing airtableId' }, { status: 400 });
    }
    const fieldsToUpdate = {};
    if (center === 'anthony') {
      fieldsToUpdate['Orientation Anthony'] = status !== false;
      if (status !== false) {
        const checkRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const checkData = await checkRes.json();
        if (checkData.fields && checkData.fields['Orientation Harper']) {
          fieldsToUpdate['Needs Orientation'] = false;
        }
      } else {
        fieldsToUpdate['Needs Orientation'] = true;
      }
    } else if (center === 'harper') {
      fieldsToUpdate['Orientation Harper'] = status !== false;
      if (status !== false) {
        const checkRes = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const checkData = await checkRes.json();
        if (checkData.fields && checkData.fields['Orientation Anthony']) {
          fieldsToUpdate['Needs Orientation'] = false;
        }
      } else {
        fieldsToUpdate['Needs Orientation'] = true;
      }
    } else {
      fieldsToUpdate['Needs Orientation'] = false;
      fieldsToUpdate['Orientation Anthony'] = true;
      fieldsToUpdate['Orientation Harper'] = true;
    }
    if (clearNeedsOrientation) {
      fieldsToUpdate['Needs Orientation'] = false;
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
