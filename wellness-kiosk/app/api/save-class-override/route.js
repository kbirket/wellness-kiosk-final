import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { recordId, deleteRecord, classAirtableId, overrideDate, overrideType, reason, overrideTime } = body;
    
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    // Delete path
    if (recordId && deleteRecord) {
      const res = await fetch('https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Class Overrides') + '/' + recordId, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (!res.ok) {
        const errText = await res.text();
        return NextResponse.json({ success: false, error: 'Delete failed: ' + errText }, { status: 500 });
      }
      return NextResponse.json({ success: true, deleted: recordId });
    }
    
    const fields = {};
    if (classAirtableId) fields['Class'] = [classAirtableId];
    if (overrideDate) fields['Override Date'] = overrideDate;
    if (overrideType) fields['Override Type'] = overrideType;
    if (reason !== undefined) fields['Reason'] = reason;
    if (overrideTime !== undefined) fields['Override Time'] = overrideTime;
    
    let res;
    if (recordId) {
      res = await fetch('https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Class Overrides') + '/' + recordId, {
        method: 'PATCH',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields, typecast: true })
      });
    } else {
      res = await fetch('https://api.airtable.com/v0/' + baseId + '/' + encodeURIComponent('Class Overrides'), {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: [{ fields }], typecast: true })
      });
    }
    
    const data = await res.json();
    if (!res.ok || data.error) {
      return NextResponse.json({ success: false, error: data.error?.message || 'Failed to save override' }, { status: 500 });
    }
    
    const savedRecord = recordId ? data : (data.records && data.records[0]);
    return NextResponse.json({ success: true, record: savedRecord });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
