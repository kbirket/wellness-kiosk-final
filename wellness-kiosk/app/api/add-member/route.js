// /app/api/add-member/route.js
// REPLACE your existing add-member route with this version
// Adds support for: corporate sponsor, needs orientation
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
    const newPIN = generatePIN();

    const fields = {
      "First Name": body.firstName,
      "Last Name": body.lastName,
      "Email": body.email || '',
      "Phone": body.phone || '',
      "Membership Type": body.plan,
      "Home Center": body.center,
      "Password": newPIN,
      "Membership Status": "ACTIVE",
    };

    // Add corporate sponsor if provided
    if (body.corporateSponsor) {
      fields["Corporate Sponsor"] = body.corporateSponsor;
    }

    // Add needs orientation (defaults to true for new members)
    if (body.needsOrientation !== undefined) {
      fields["Needs Orientation"] = body.needsOrientation;
    }

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
