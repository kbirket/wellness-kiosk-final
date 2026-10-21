export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { familyGroupId, familyName } = await request.json();
    if (!familyGroupId || !familyName || !String(familyName).trim()) {
      return Response.json({ success: false, error: 'Family group ID and a name are required' }, { status: 400 });
    }
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Family%20Groups/' + familyGroupId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields: { 'Family Name': String(familyName).trim() }, typecast: true })
      }
    );
    const data = await res.json();
    if (!res.ok || data.error) {
      return Response.json({ success: false, error: data.error?.message || 'Could not rename the family group' }, { status: 500 });
    }
    return Response.json({ success: true, familyName: String(familyName).trim() });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
