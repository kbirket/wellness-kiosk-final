import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { airtableId, amount, method, quantity, pricePer, passesRemaining, paymentCenter } = await request.json();
    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Member ID required' }, { status: 400 });
    }
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;

    const qty = parseInt(quantity) || 1;
    const per = Number(pricePer) || 0;
    const checkNum = String(method || '').startsWith('Check #') ? String(method).replace('Check #', '') : '';
    const payMethod = String(method || '').startsWith('Check') ? 'Check' : String(method || 'Cash');

    const payFields = {
      "Member": [airtableId],
      "Amount": Number(amount) || 0,
      "Payment Date": new Date().toISOString().split('T')[0],
      "Payment Method": payMethod,
      "Status": "Completed",
      "Notes": qty + ' day pass' + (qty === 1 ? '' : 'es') + (per ? ' at $' + per.toFixed(2) + ' each' : '') + ' | Logged by staff via Wellness Hub'
    };
    if (checkNum) payFields["Check Number"] = checkNum;
    if (paymentCenter) payFields["Center"] = paymentCenter;

    const payRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Payments', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ records: [{ fields: payFields }], typecast: true })
    });
    const payData = await payRes.json();
    if (!payRes.ok || payData.error) {
      const detail = (payData.error && (payData.error.message || payData.error.type)) || 'Failed to save the payment';
      return NextResponse.json({ success: false, error: detail }, { status: 400 });
    }

    // passes balance only — the renewal date and membership status are deliberately left alone
    const memRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + airtableId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { "Passes Remaining": Number(passesRemaining) || 0 }, typecast: true })
    });
    const memData = await memRes.json();
    if (!memRes.ok || memData.error) {
      const mdetail = (memData.error && (memData.error.message || memData.error.type)) || 'Payment saved, but the passes balance did not update';
      return NextResponse.json({ success: false, error: mdetail }, { status: 400 });
    }

    return NextResponse.json({ success: true, passesRemaining: Number(passesRemaining) || 0 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
