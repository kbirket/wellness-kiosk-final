import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { recordId, fields } = body;
    
    if (!fields || typeof fields !== 'object') {
      return NextResponse.json({ success: false, error: 'Fields required' }, { status: 400 });
    }
    
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    const allowed = ['Name', 'Center', 'Days', 'Start Time', 'Start Date', 'End Date', 'Instructor', 'Color Accent', 'Archived', 'Notes'];
    const cleanFields = {};
    Object.keys(fields).forEach(k => { if (allowed.includes(k)) cleanFields[k] = fields[k]; });
    
    let res;
    if (recordId) {
      res = await fetch('https://api.airtable.com/v0/' + baseId + '/Classes/' + recordId, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: cleanFields, typecast: true })
      });
    } else {
      res = await fetch('https://api.airtable.com/v0/' + baseId + '/Classes', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [{ fields: cleanFields }], typecast: true })
      });
    }
    
    const data = await res.json();
    if (!res.ok || data.error) {
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to save class' }, { status: 500 });
    }
    
    const savedRecord = recordId ? data : (data.records && data.records[0]);
    return NextResponse.json({ success: true, record: savedRecord });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
