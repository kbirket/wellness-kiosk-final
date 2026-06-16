export async function POST(request) {
  try {
    const { memberAirtableId, requestedBy, note, printType } = await request.json();
    
    if (!memberAirtableId || !requestedBy) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Card%20Print%20Queue',
      {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            'Member': [memberAirtableId],
            'Requested By': requestedBy,
            'Note': note || '',
            'Status': 'Pending',
            'Print Type': printType || 'Card'
          }
        })
      }
    );
    
    const data = await res.json();
    
    if (data.error) {
      return Response.json({ success: false, error: data.error.message || JSON.stringify(data.error) }, { status: 500 });
    }
    
    return Response.json({ success: true, recordId: data.id });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
