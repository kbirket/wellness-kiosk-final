export async function POST(request) {
  try {
    const { recordId, status } = await request.json();
    
    if (!recordId || !status) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const fields = { 'Status': status };
    if (status === 'Printed') {
      fields['Printed Date'] = new Date().toISOString().split('T')[0];
    }
    
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Card%20Print%20Queue/' + recordId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );
    
    const data = await res.json();
    
    if (data.error) {
      return Response.json({ success: false, error: data.error.message || JSON.stringify(data.error) }, { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
