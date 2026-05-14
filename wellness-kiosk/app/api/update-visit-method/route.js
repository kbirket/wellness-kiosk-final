export async function POST(request) {
  try {
    const { memberAirtableId, visitTime, visitCenter, newMethod } = await request.json();

    if (!memberAirtableId || !visitTime || !newMethod) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const baseId = process.env.AIRTABLE_BASE_ID;
    const apiKey = process.env.AIRTABLE_PAT;
    const tableName = 'Visits';

    // Find the matching visit by paginating through all visits
    let foundRecordId = null;
    let offset = null;
    const targetTime = new Date(visitTime).getTime();

    do {
      const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}${offset ? `?offset=${offset}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      const data = await res.json();
      
      if (data.records) {
        for (const r of data.records) {
          const linkedArray = r.fields['Member'] || r.fields['Members'] || [];
          const linkId = linkedArray[0];
          if (linkId !== memberAirtableId) continue;
          
          const recordTime = r.fields['Check-in Time'] || r.fields['Time'] || r.fields['Date'] || r.createdTime;
          const recordTimeMs = new Date(recordTime).getTime();
          
          // Match within 1 second tolerance
          if (Math.abs(recordTimeMs - targetTime) < 1000) {
            foundRecordId = r.id;
            break;
          }
        }
      }
      
      if (foundRecordId) break;
      offset = data.offset;
    } while (offset);

    if (!foundRecordId) {
      return Response.json({ success: false, error: 'Visit not found' }, { status: 404 });
    }

    // PATCH the Check-in Method field
    const patchRes = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}/${foundRecordId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: { 'Check-in Method': newMethod }
      })
    });

    if (!patchRes.ok) {
      const err = await patchRes.json();
      return Response.json({ success: false, error: err.error?.message || 'Airtable update failed' }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
