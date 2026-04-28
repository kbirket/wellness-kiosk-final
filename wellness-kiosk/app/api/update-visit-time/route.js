export async function POST(request) {
  try {
    const { memberAirtableId, oldTime, oldCenter, newTime } = await request.json();

    if (!memberAirtableId || !oldTime || !newTime) {
      return Response.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
    const BASE_ID = process.env.AIRTABLE_BASE_ID;
    const VISITS_TABLE = 'Visits';

    if (!AIRTABLE_PAT || !BASE_ID) {
      return Response.json({ success: false, error: 'Server configuration error' }, { status: 500 });
    }

    // Find the visit record by member + old time (with pagination)
    let allRecords = [];
    let offset = null;
    do {
      const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${VISITS_TABLE}`);
      if (offset) url.searchParams.set('offset', offset);
      const findRes = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
      });
      const findData = await findRes.json();
      if (findData.records) allRecords = allRecords.concat(findData.records);
      offset = findData.offset;
    } while (offset);

    // Match by member link + check-in time (within 1 second tolerance)
    const oldTimeMs = new Date(oldTime).getTime();
    const matchingVisit = allRecords.find(r => {
      const memberLink = r.fields['Member'] || r.fields['Members'] || [];
      const linkedId = Array.isArray(memberLink) ? memberLink[0] : memberLink;
      if (linkedId !== memberAirtableId) return false;
      const recordTime = r.fields['Check-in Time'] || r.fields['Time'] || r.fields['Date'];
      if (!recordTime) return false;
      const diff = Math.abs(new Date(recordTime).getTime() - oldTimeMs);
      return diff < 1000;
    });

    if (!matchingVisit) {
      return Response.json({ success: false, error: 'Visit not found' }, { status: 404 });
    }

    // Update the Check-in Time field
    const updateRes = await fetch(`https://api.airtable.com/v0/${BASE_ID}/${VISITS_TABLE}/${matchingVisit.id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_PAT}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: { 'Check-in Time': newTime }
      })
    });

    const updateData = await updateRes.json();
    if (updateData.error) {
      return Response.json({ success: false, error: updateData.error.message || 'Update failed' }, { status: 500 });
    }

    return Response.json({ success: true, recordId: matchingVisit.id });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
