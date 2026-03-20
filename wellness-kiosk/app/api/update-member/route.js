import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Members'; // Make sure this matches your main Airtable tab name!

  try {
    const body = await request.json();
    
    // We use PATCH to only update the specific fields provided
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${body.airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          "First Name": body.firstName,
          "Last Name": body.lastName,
          "Email": body.email,
          "Phone": body.phone, // <--- The missing comma was here!
          "Membership Type": body.plan,
          "Billing Method": body.billingMethod,
          "Home Center": body.center,
          "Corporate Sponsor": body.sponsor || '',
          "24/7 Access": body.access247,
          "Badge Number": body.badgeNumber,
          "Notes": body.notes
        }
      })
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
