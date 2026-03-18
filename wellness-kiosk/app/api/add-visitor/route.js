// /app/api/add-visitor/route.js
// Add a new visitor (day pass, 2-week courtesy, month courtesy)
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function generatePIN() {
  let pin;
  do {
    pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  } while (pin === '0000' || pin === '1111');
  return pin;
}

function getExpirationDate(passType) {
  const now = new Date();
  switch (passType) {
    case 'Day Pass':
      // Expires end of today
      now.setHours(23, 59, 59, 999);
      return now.toISOString().slice(0, 10);
    case '2-Week Courtesy':
      now.setDate(now.getDate() + 14);
      return now.toISOString().slice(0, 10);
    case 'Month Courtesy':
      now.setMonth(now.getMonth() + 1);
      return now.toISOString().slice(0, 10);
    default:
      return now.toISOString().slice(0, 10);
  }
}

function getAmountPaid(passType) {
  switch (passType) {
    case 'Day Pass': return 5;
    case '2-Week Courtesy': return 0;
    case 'Month Courtesy': return 0;
    default: return 0;
  }
}

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const body = await request.json();
    const newPIN = generatePIN();
    const expirationDate = getExpirationDate(body.passType);
    const amountPaid = getAmountPaid(body.passType);

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/Visitors`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{
          fields: {
            "First Name": body.firstName,
            "Last Name": body.lastName,
            "Email": body.email || '',
            "Phone": body.phone || '',
            "Street Address": body.address || '',
"City": body.city || '',
"State": body.state || 'KS',
"Zip": body.zip || '',
            "Pass Type": body.passType,
            "Amount Paid": amountPaid,
            "Referring Provider": body.referringProvider || '',
            "Purchase Date": new Date().toISOString().slice(0, 10),
            "Expiration Date": expirationDate,
            "Center": body.center,
            "PIN": newPIN,
            "Orientation Complete": false,
            "Notes": body.notes || '',
          }
        }],
        typecast: true
      })
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message || 'Failed to create visitor' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      pin: newPIN,
      visitorId: data.records[0].id,
      expirationDate: expirationDate,
      amountPaid: amountPaid,
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
