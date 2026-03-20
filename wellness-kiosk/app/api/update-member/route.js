import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Members';

  try {
    const body = await request.json();
    
    // Dynamically build the fields object
    const fields = {};
    if (body.firstName) fields["First Name"] = body.firstName;
    if (body.lastName) fields["Last Name"] = body.lastName;
    if (body.email !== undefined) fields["Email"] = body.email;
    if (body.phone !== undefined) fields["Phone"] = body.phone;
    if (body.plan) fields["Membership Type"] = body.plan;
    if (body.billingMethod) fields["Billing Method"] = body.billingMethod;
    if (body.center) fields["Home Center"] = body.center;
    if (body.sponsor) fields["Corporate Sponsor"] = body.sponsor;
    if (body.access247 !== undefined) fields["24/7 Access"] = body.access247;
    if (body.badgeNumber) fields["Badge Number"] = body.badgeNumber;
    if (body.notes !== undefined) fields["Notes"] = body.notes;

    // We use PATCH to only update the specific fields provided
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${body.airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      // THIS IS THE FIX: Added typecast: true so Airtable auto-matches text to dropdowns/records
      body: JSON.stringify({ fields, typecast: true }) 
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
