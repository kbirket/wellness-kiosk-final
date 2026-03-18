// /app/api/add-family-member/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function generatePIN() {
  let pin;
  do {
    pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  } while (pin === '0000' || pin === '1111');
  return pin;
}

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const membersTable = process.env.AIRTABLE_TABLE_NAME || 'Members';
  const familiesTable = 'Families';

  try {
    const body = await request.json();
    const newPIN = generatePIN();

    // Step 1: Create the new member record
    const memberRes = await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{
          fields: {
            "First Name": body.firstName,
            "Last Name": body.lastName,
            "Email": body.email || '',
            "Phone": body.phone || '',
            "Membership Type": body.plan,
            "Home Center": body.center,
            "Street Address": body.address || '',
"City": body.city || '',
"State": body.state || 'KS',
"Zip": body.zip || '',
...(body.familyRecordId ? {} : { "Billing Method": body.billingMethod || "Month-to-Month" }),
            "Password": newPIN,
           "Membership Status": "ACTIVE",
            ...(body.corporateSponsor ? { "Corporate Sponsor": body.corporateSponsor } : {}),
            ...(body.familyRecordId ? {} : { "Billing Method": "Month-to-Month" }),
          }
        }],
        typecast: true
      })
    });
    const memberData = await memberRes.json();

    if (memberData.error) {
      return NextResponse.json({ success: false, error: memberData.error.message || 'Failed to create member' }, { status: 400 });
    }

    const newMemberId = memberData.records[0].id;
    const newMemberDisplayId = memberData.records[0].fields['Member ID'] || newMemberId;

    // If this is a PRIMARY member (no familyRecordId provided), create the Family record
    if (!body.familyRecordId) {
      const familyName = `The ${body.lastName}s`;

      const familyRes = await fetch(`https://api.airtable.com/v0/${baseId}/${familiesTable}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: [{
            fields: {
              "Family Name": familyName,
              "Primary Member": [newMemberId],
              "Members": [newMemberId],
              "Plan Type": body.plan,
              "Monthly Rate": body.monthlyRate || 0,
            }
          }],
          typecast: true
        })
      });
      const familyData = await familyRes.json();

      if (familyData.error) {
        // Member was created but family linking failed — still return success with a warning
        return NextResponse.json({
          success: true,
          pin: newPIN,
          memberId: newMemberDisplayId,
          memberAirtableId: newMemberId,
          familyRecordId: null,
          familyError: familyData.error.message || 'Could not create family record',
        });
      }

      const familyRecordId = familyData.records[0].id;

      // Link the member to the family
      await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}/${newMemberId}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: { "Family Group": [familyRecordId] }
        })
      });

      return NextResponse.json({
        success: true,
        pin: newPIN,
        memberId: newMemberDisplayId,
        memberAirtableId: newMemberId,
        familyRecordId: familyRecordId,
        familyName: familyName,
        isPrimary: true,
      });
    }

    // If this is a SECONDARY member (familyRecordId provided), link to existing family
    // First, get the current family record to see existing members
    const existingFamilyRes = await fetch(`https://api.airtable.com/v0/${baseId}/${familiesTable}/${body.familyRecordId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const existingFamily = await existingFamilyRes.json();
    const existingMembers = existingFamily.fields?.Members || [];

    // Add the new member to the family's Members list
    await fetch(`https://api.airtable.com/v0/${baseId}/${familiesTable}/${body.familyRecordId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: { "Members": [...existingMembers, newMemberId] }
      })
    });

    // Link the member to the family
    await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}/${newMemberId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: { "Family Group": [body.familyRecordId] }
      })
    });

    return NextResponse.json({
      success: true,
      pin: newPIN,
      memberId: newMemberDisplayId,
      memberAirtableId: newMemberId,
      familyRecordId: body.familyRecordId,
      isPrimary: false,
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
