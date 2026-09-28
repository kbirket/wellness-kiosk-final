export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = [];
    let offset = null;
    let pages = 0;
    do {
      const url = 'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID +
        '/Change%20Log?pageSize=100&sort%5B0%5D%5Bfield%5D=Timestamp&sort%5B0%5D%5Bdirection%5D=desc' +
        (offset ? '&offset=' + offset : '');
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.error) {
        return Response.json({ success: false, error: data.error.message }, { status: 500 });
      }
      (data.records || []).forEach(r => {
        all.push({
          airtableId: r.id,
          timestamp: r.fields['Timestamp'] || '',
          user: r.fields['User'] || '',
          center: r.fields['Center'] || '',
          recordType: r.fields['Record Type'] || '',
          recordName: r.fields['Record Name'] || '',
          action: r.fields['Action'] || '',
          fields: r.fields['Field'] || '',
          notes: r.fields['Notes'] || ''
        });
      });
      offset = data.offset;
      pages++;
    } while (offset && pages < 12);
    return Response.json({ success: true, entries: all });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
