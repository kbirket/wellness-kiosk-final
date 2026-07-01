import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { recordId, outcome, notes } = await request.json();
    if (!recordId) {
      return NextResponse.json({ success: false, error: 'Record ID required' }, { status: 400 });
    }
    
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    const fields = {};
    if (outcome) fields['Outcome'] = outcome;
    if (notes !== undefined) fields['Notes'] = notes;
    
    const res = await fetch(
      'https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Blocked Check-Ins') + '/' + recordId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields, typecast: true })
      }
    );
    
    const data = await res.json();
    
    if (!res.ok || data.error) {
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to update' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
