export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const fields = {
      'Timestamp': new Date().toISOString(),
      'User': String(body.user || 'Unknown'),
      'Center': String(body.center || ''),
      'Record Type': String(body.recordType || 'Member'),
      'Record Name': String(body.recordName || ''),
      'Action': String(body.action || ''),
      'Field': String(body.fields || '').slice(0, 900),
      'Old Value': String(body.oldValue || ''),
      'New Value': String(body.newValue || ''),
      'Notes': String(body.notes || '')
    };
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Change%20Log',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields, typecast: true })
      }
    );
    const data = await res.json();
    if (!res.ok || data.error) {
      return Response.json({ success: false, error: data.error?.message || 'Could not write log entry' }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
