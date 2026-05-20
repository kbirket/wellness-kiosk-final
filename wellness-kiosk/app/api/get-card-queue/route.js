export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allRecords = [];
    let offset = null;
    
    do {
      const url = 'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Card%20Print%20Queue?sort%5B0%5D%5Bfield%5D=Requested%20Date&sort%5B0%5D%5Bdirection%5D=desc' + (offset ? '&offset=' + offset : '');
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT }
      });
      const data = await res.json();
      
      if (data.error) {
        return Response.json({ error: data.error }, { status: 500 });
      }
      
      allRecords = allRecords.concat(data.records || []);
      offset = data.offset;
    } while (offset);
    
    return Response.json({ records: allRecords });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
