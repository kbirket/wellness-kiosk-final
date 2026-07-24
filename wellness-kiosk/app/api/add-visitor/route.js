import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function generatePIN() {
  let pin;
  do {
    pin = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  } while (pin === '0000' || pin === '1111');
  return pin;
}

function getExpirationDate(passType, purchaseDate, passesRemaining) {
  const start = purchaseDate ? new Date(purchaseDate + 'T12:00:00') : new Date();
  switch (passType) {
    case 'Day Pass':
      // A single walk-in is good for that day only. If they prepaid several
      // day visits, give them a year to use them up.
      if (Number(passesRemaining) > 1) {
        start.setFullYear(start.getFullYear() + 1);
        return start.toISOString().slice(0, 10);
      }
      start.setHours(23, 59, 59, 999);
      return start.toISOString().slice(0, 10);
    case 'Week Pass':
      start.setDate(start.getDate() + 7);
      return start.toISOString().slice(0, 10);
    case '2-Week Courtesy':
      start.setDate(start.getDate() + 14);
      return start.toISOString().slice(0, 10);
    case 'Month Pass':
    case 'Month Courtesy':
      start.setMonth(start.getMonth() + 1);
      return start.toISOString().slice(0, 10);
    case 'Prepaid Passes':
      start.setFullYear(start.getFullYear() + 1);
      return start.toISOString().slice(0, 10);
    case 'Converted Member':
      start.setFullYear(start.getFullYear() + 5);
      return start.toISOString().slice(0, 10);
    default:
      return start.toISOString().slice(0, 10);
  }
}

function getAmountPaid(passType) {
  switch (passType) {
    case 'Day Pass': return 5;
    case 'Week Pass': return 0;
    case 'Month Pass': return 0;
    case '2-Week Courtesy': return 0;
    case 'Month Courtesy': return 0;
    case 'Prepaid Passes': return 0;
    case 'Converted Member': return 0;
    default: return 0;
  }
}

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT || process.env.AIRTABLE_API_KEY;

  try {
    const body = await request.json();
    const newPIN = body.pin || generatePIN();
    const purchaseDate = body.purchaseDate || new Date().toISOString().slice(0, 10);
    const expirationDate = getExpirationDate(body.passType, body.purchaseDate, body.passesRemaining);

    // A prepaid stack of day passes is priced by the desk, so trust the amount sent.
    const usesEnteredAmount =
      body.passType === 'Prepaid Passes' ||
      (body.passType === 'Day Pass' && Number(body.passesRemaining) > 1);
    const amountPaid = usesEnteredAmount
      ? (body.amountPaid || 0)
      : (body.amountPaid !== undefined && body.amountPaid !== null && body.amountPaid !== ''
          ? Number(body.amountPaid)
          : getAmountPaid(body.passType));

    const fields = {
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
      "Pass Source": body.passSource || 'Paid at Desk',
      "Purchase Date": purchaseDate,
      "Expiration Date": expirationDate,
      "Center": body.center,
      "PIN": newPIN,
      "Orientation Complete": body.passType === 'Converted Member' ? true : false,
      "Notes": body.notes || ''
    };

    if (body.passesRemaining !== null && body.passesRemaining !== undefined) {
      fields["Passes Remaining"] = Number(body.passesRemaining);
    }
    if (body.legacyMemberId) {
      fields["Legacy Member ID"] = body.legacyMemberId;
    }
    if (body.passActivated === false) {
      fields["Pass Activated"] = false;
    }

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/Visitors`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ fields }],
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
