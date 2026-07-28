export async function POST(request) {
  try {
    const body = await request.json();
    const { recordId, status, printType } = body;
    if (!recordId || (!status && !printType)) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    const fields = {};
    if (status) {
      fields['Status'] = status;
      if (status === 'Printed') {
        fields['Printed Date'] = new Date().toISOString().split('T')[0];
      }
      if (status === 'Issued') {
        fields['Issued Date'] = new Date().toISOString().split('T')[0];
      }
      if (status === 'Pending') {
        fields['Printed Date'] = null;
        fields['Issued Date'] = null;
      }
    }
    if (printType) {
      fields['Print Type'] = printType;
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
