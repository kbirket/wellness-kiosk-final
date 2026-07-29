import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
export async function POST(request) {
  try {
    const { recordId, newPin } = await request.json();
    if (!recordId || !newPin) {
      return NextResponse.json({ error: 'Missing recordId or newPin' }, { status: 400 });
    }
    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json({ error: 'PIN must be exactly 4 digits' }, { status: 400 });
    }
    if (newPin === '1111' || newPin === '0000') {
      return NextResponse.json({ error: 'Please choose a more secure PIN' }, { status: 400 });
    }
    const response = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/' + encodeURIComponent(process.env.AIRTABLE_TABLE_NAME || 'Members') + '/' + recordId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: { 'Password': newPin }
        }),
      }
    );
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json({ error: 'Failed to update PIN in database' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update PIN error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
