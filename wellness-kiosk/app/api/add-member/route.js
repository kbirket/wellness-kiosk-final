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
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    const body = await request.json();
    const today = new Date().toISOString().split('T')[0];
    const newPIN = generatePIN();

    // FIX: Properly declare 'fields' as a variable
    const fields = {
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
      "24/7 Access": body.access247 || false,
      "Badge Number": body.badgeNumber || '',
      "Billing Method": body.billingMethod || "Month-to-Month",
      "Password": newPIN,
      "Membership Status": "ACTIVE",
      "Start Date": body.startDate || today,
      "Needs Orientation": body.needsOrientation, 
      if (body.discountCode) fields["Discount Code"] = body.discountCode;
    if (body.discountExpiration) fields["Discount Expiration"] = body.discountExpiration;
      ...(body.corporateSponsor ? { "Corporate Sponsor": body.corporateSponsor } : {}),
    };

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{ fields }],
        typecast: true
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message || "Airtable Error" }, { status: 400 });
    }

    return NextResponse.json({ success: true, pin: newPIN, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
