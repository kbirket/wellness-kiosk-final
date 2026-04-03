import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const { airtableId, method, currentDueDate, amount } = await request.json();
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    // 1. Calculate the NEW due date
    let nextDate = new Date();
    if (currentDueDate && currentDueDate !== 'N/A') {
        nextDate = new Date(currentDueDate);
    }
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextPaymentDue = nextDate.toISOString().split('T')[0];
    
    // 2. Create the Payment Record
    const payAmount = Number(amount) || 0;
    const payRes = await fetch(`https://api.airtable.com/v0/${baseId}/Payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{
          fields: {
            "Member": [airtableId],
            "Amount": payAmount,
            "Payment Date": new Date().toISOString().split('T')[0],
            "Payment Method": method,
            "Status": "Completed",
            "Notes": "Logged by staff via Wellness Hub"
          }
        }]
      })
    });
    const payData = await payRes.json();
    if (payData.error) {
      console.error('Payment record error:', payData.error);
    }
    
    // 3. Update the Member record
    const memRes = await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          "Next Payment Due": nextPaymentDue,
          "Membership Status": "Active",
          "Payment Method": method
        }
      })
    });
    const memData = await memRes.json();
    if (memData.error) {
      console.error('Member update error:', memData.error);
    }
    
    return NextResponse.json({ success: true, nextPaymentDue, paymentSaved: !payData.error, memberUpdated: !memData.error });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
