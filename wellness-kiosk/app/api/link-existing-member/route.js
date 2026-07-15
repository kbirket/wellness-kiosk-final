// app/api/link-existing-member/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const membersTable = process.env.AIRTABLE_TABLE_NAME || 'Members';
  const familiesTable = 'Families';

  try {
    const body = await request.json();

    if (!body.memberAirtableId || !body.familyRecordId) {
      return NextResponse.json({ success: false, error: 'Member and family are required' }, { status: 400 });
    }

    // 1. Add the member to the family's Members list (without dropping the existing ones)
    const famRes = await fetch(`https://api.airtable.com/v0/${baseId}/${familiesTable}/${body.familyRecordId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const famData = await famRes.json();
    if (famData.error) {
      return NextResponse.json({ success: false, error: famData.error.message || 'Family record not found' }, { status: 400 });
    }
    const existing = (famData.fields && famData.fields.Members) || [];

    // Grab the family's current due date (from the Primary Member) so the newly linked
    // member is immediately current instead of showing blank/unpaid.
    let familyDue = null;
    const primaryLink = (famData.fields && famData.fields['Primary Member']) || [];
    if (primaryLink.length > 0) {
      try {
        const pRes = await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}/${primaryLink[0]}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const pData = await pRes.json();
        familyDue = (pData.fields && pData.fields['Next Payment Due']) || null;
      } catch (e) {}
    }
    if (!existing.includes(body.memberAirtableId)) {
      await fetch(`https://api.airtable.com/v0/${baseId}/${familiesTable}/${body.familyRecordId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: { "Members": [...existing, body.memberAirtableId] } })
      });
    }

    // 2. Update the member: link to the family, clear their billing (become a $0 covered member),
    //    and set their plan to match the family.
    const memberFields = {
      "Family Group": [body.familyRecordId],
      "Billing Method": null
    };
    if (familyDue) { memberFields["Next Payment Due"] = familyDue; memberFields["Membership Status"] = "Active"; }

    if (body.plan) {
      try {
        const pricingTable = encodeURIComponent('Pricing Reference');
        const pr = await fetch(`https://api.airtable.com/v0/${baseId}/${pricingTable}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (pr.ok) {
          const pd = await pr.json();
          const rec = pd.records.find(r => {
            const n = r.fields['Membership Type'] || r.fields['Plan Name'] || r.fields['Name'] || '';
            return String(n).toUpperCase().trim() === String(body.plan).toUpperCase().trim();
          });
          if (rec) memberFields["Membership Type"] = [rec.id];
        }
      } catch (e) {
        // If the plan lookup fails, still link the member; just don't change their plan.
      }
    }

    const memRes = await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}/${body.memberAirtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: memberFields, typecast: true })
    });

    if (!memRes.ok) {
      const e = await memRes.json();
      return NextResponse.json({ success: false, error: (e.error && e.error.message) || 'Could not link member to family' }, { status: 400 });
    }

    return NextResponse.json({ success: true, nextPayment: familyDue });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
