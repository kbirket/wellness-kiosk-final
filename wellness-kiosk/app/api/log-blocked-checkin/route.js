import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { memberAirtableId, memberId, memberName, reason, center } = await request.json();
    
    if (!memberName || !reason || !center) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    const fields = {
      'Member Name': memberName,
      'Member ID': memberId || '',
      'Timestamp': new Date().toISOString(),
      'Reason': reason,
      'Center': center,
      'Outcome': 'Pending'
    };
    
    if (memberAirtableId) {
      fields['Member'] = [memberAirtableId];
    }
    
    const res = await fetch(
      'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Blocked Check-Ins'),
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields, typecast: true })
      }
    );
    
    const data = await res.json();
    
    if (!res.ok || data.error) {
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to log blocked check-in' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, recordId: data.id });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
