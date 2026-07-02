import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  try {
    const body = await request.json();
    const { visitAirtableId, memberAirtableId, visitTime } = body;

    let recordIdToDelete = visitAirtableId;

    // Fallback: if no direct record ID, try to find one by member + time (for older frontend paths)
    if (!recordIdToDelete && memberAirtableId && visitTime) {
      // Search by RECORD_ID on the linked Member field
      const filter1 = encodeURIComponent(`AND(FIND('${memberAirtableId}', ARRAYJOIN({Member})), IS_SAME({Check-in Time}, '${visitTime}'))`);
      const searchRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/Visits?filterByFormula=${filter1}&maxRecords=5`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const searchData = await searchRes.json();
      if (searchData.records && searchData.records.length > 0) {
        recordIdToDelete = searchData.records[0].id;
      }
    }

    if (!recordIdToDelete) {
      return NextResponse.json({ success: false, error: 'Could not identify visit to delete. Please refresh and try again.' }, { status: 404 });
    }

    // Delete the record
    const delRes = await fetch(`https://api.airtable.com/v0/${baseId}/Visits/${recordIdToDelete}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!delRes.ok) {
      const errText = await delRes.text();
      return NextResponse.json({ success: false, error: 'Airtable delete failed: ' + errText }, { status: 500 });
    }

    // Decrement Total Visits on the member (best effort)
    if (memberAirtableId) {
      try {
        const memberRes = await fetch(
          `https://api.airtable.com/v0/${baseId}/Members/${memberAirtableId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const memberData = await memberRes.json();
        const currentVisits = (memberData.fields && memberData.fields['Total Visits']) || 0;
        if (currentVisits > 0) {
          await fetch(`https://api.airtable.com/v0/${baseId}/Members/${memberAirtableId}`, {
            method: 'PATCH',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ fields: { 'Total Visits': currentVisits - 1 } })
          });
        }
      } catch (visitErr) {
        console.error('Could not decrement visit count:', visitErr);
      }
    }

    return NextResponse.json({ success: true, deleted: recordIdToDelete });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
