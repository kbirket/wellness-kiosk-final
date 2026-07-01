import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { visitorAirtableId, memberAirtableId, conversionNotes } = await request.json();
    
    if (!visitorAirtableId || !memberAirtableId) {
      return NextResponse.json({ success: false, error: 'Visitor and Member IDs required' }, { status: 400 });
    }
    
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    const fields = {
      'Converted to Member': true,
      'Converted Date': new Date().toISOString().slice(0, 10),
      'Member Record ID': memberAirtableId,
      'Conversion Notes': conversionNotes || ''
    };
    
    const res = await fetch(
      'https://api.airtable.com/v0/' + baseId + '/Visitors/' + visitorAirtableId,
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
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to mark visitor as converted' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
