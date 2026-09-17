export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { recordId } = await request.json();
    if (!recordId) {
      return Response.json({ success: false, error: 'Record ID required' }, { status: 400 });
    }
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Card%20Print%20Queue/' + recordId,
      {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT }
      }
    );
    const data = await res.json();
    if (!res.ok || data.error) {
      return Response.json({ success: false, error: data.error?.message || 'Could not delete request' }, { status: 500 });
    }
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
