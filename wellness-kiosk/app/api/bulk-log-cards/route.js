export async function POST(request) {
  try {
    const { memberIds, printType, requestedBy, status } = await request.json();

    if (!Array.isArray(memberIds) || memberIds.length === 0) {
      return Response.json({ success: false, error: 'No members provided' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];
    const st = status === 'Issued' ? 'Issued' : 'Printed';

    const records = memberIds.filter(function (id) { return !!id; }).map(function (id) {
      // Note: 'Requested Date' is a computed field in Airtable, so we do NOT set it here.
      const fields = {
        'Member': [id],
        'Requested By': requestedBy || 'Bulk Print',
        'Status': st,
        'Print Type': printType || 'Fob',
        'Printed Date': today
      };
      if (st === 'Issued') {
        fields['Issued Date'] = today;
      }
      return { fields: fields };
    });

    const base = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    let created = 0;

    // Airtable allows up to 10 records per create request
    for (let i = 0; i < records.length; i += 10) {
      const chunk = records.slice(i, i + 10);
      const res = await fetch(
        'https://api.airtable.com/v0/' + base + '/Card%20Print%20Queue',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ records: chunk, typecast: true })
        }
      );
      const data = await res.json();
      if (data.error) {
        return Response.json({ success: false, error: data.error.message || JSON.stringify(data.error), created: created }, { status: 500 });
      }
      created += (data.records ? data.records.length : 0);
      await new Promise(function (r) { setTimeout(r, 220); });
    }

    return Response.json({ success: true, created: created });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
