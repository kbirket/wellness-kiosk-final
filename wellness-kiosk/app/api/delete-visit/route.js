import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const body = await request.json();
    const { memberAirtableId, visitTime, visitCenter } = body;

    if (!memberAirtableId || !visitTime) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Find the visit record in Airtable
    // Filter by Member link and time
    const filterFormula = encodeURIComponent(
      `AND({Member}='${memberAirtableId}', {Time}='${visitTime}')`
    );

    const searchRes = await fetch(
      `https://api.airtable.com/v0/${baseId}/Visits?filterByFormula=${filterFormula}&maxRecords=5`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    const searchData = await searchRes.json();

    if (!searchData.records || searchData.records.length === 0) {
      // Try alternate search using Date field instead of Time
      const filterFormula2 = encodeURIComponent(
        `AND({Member}='${memberAirtableId}', {Date}='${visitTime}')`
      );
      const searchRes2 = await fetch(
        `https://api.airtable.com/v0/${baseId}/Visits?filterByFormula=${filterFormula2}&maxRecords=5`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const searchData2 = await searchRes2.json();

      if (!searchData2.records || searchData2.records.length === 0) {
        return NextResponse.json({ success: true, warning: 'Visit removed locally but not found in Airtable' });
      }

      // Delete the first matching record
      const recordId = searchData2.records[0].id;
      await fetch(`https://api.airtable.com/v0/${baseId}/Visits/${recordId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return NextResponse.json({ success: true, deleted: recordId });
    }

    // Delete the first matching record
    const recordId = searchData.records[0].id;
    await fetch(`https://api.airtable.com/v0/${baseId}/Visits/${recordId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Also decrement the member's Total Visits if that field exists
    try {
      const memberRes = await fetch(
        `https://api.airtable.com/v0/${baseId}/Members/${memberAirtableId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const memberData = await memberRes.json();
      const currentVisits = memberData.fields['Total Visits'] || 0;

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

    return NextResponse.json({ success: true, deleted: recordId });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

Now update the delete button in `page.tsx` to call this API. Find the replacement I just gave you and update the onClick. Search for:
```
if (!window.confirm('Delete this check-in from '
```

Replace that entire `onClick` handler (from `onClick={function(e)` to the closing `}}`) with:
```
onClick={async function(e) { e.stopPropagation(); if (!window.confirm('Delete this check-in from ' + new Date(v.time).toLocaleDateString() + ' at ' + new Date(v.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + '?')) return; try { await fetch('/api/delete-visit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberAirtableId: selectedMember.airtableId, visitTime: v.time, visitCenter: v.center }) }); } catch (err) { console.error('Could not delete from Airtable:', err); } setVisits(function(prev) { return prev.filter(function(visit) { return !(visit.name === v.name && visit.time === v.time && visit.center === v.center); }); }); setMembers(function(prev) { return prev.map(function(m) { return m.id === selectedMember.id ? Object.assign({}, m, { visits: Math.max(0, m.visits - 1) }) : m; }); }); setSelectedMember(Object.assign({}, selectedMember, { visits: Math.max(0, selectedMember.visits - 1) })); }
