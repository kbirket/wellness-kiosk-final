// app/api/create-family-group/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const membersTable = process.env.AIRTABLE_TABLE_NAME || 'Members';
  const familiesTable = 'Families';

  try {
    const body = await request.json();

    if (!body.airtableId) {
      return NextResponse.json({ success: false, error: 'Member record ID required' }, { status: 400 });
    }

    const familyName = body.familyName || 'Family';

    // Create the Family record with this member as the primary
    const familyRes = await fetch(`https://api.airtable.com/v0/${baseId}/${familiesTable}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{
          fields: {
            "Family Name": familyName,
            "Primary Member": [body.airtableId],
            "Members": [body.airtableId],
            "Plan Type": body.plan || '',
            "Monthly Rate": body.monthlyRate || 0
          }
        }],
        typecast: true
      })
    });
    const familyData = await familyRes.json();

    if (familyData.error) {
      return NextResponse.json({ success: false, error: familyData.error.message || 'Could not create family record' }, { status: 400 });
    }

    const familyRecordId = familyData.records[0].id;

    // Link the member to the new family
    const linkRes = await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}/${body.airtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { "Family Group": [familyRecordId] } })
    });

    if (!linkRes.ok) {
      const linkErr = await linkRes.json();
      return NextResponse.json({
        success: false,
        error: (linkErr.error && linkErr.error.message) || 'Family created but could not link member',
        familyRecordId
      }, { status: 400 });
    }

    return NextResponse.json({ success: true, familyRecordId, familyName });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
