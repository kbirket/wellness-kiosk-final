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
    const checkNum = method.startsWith('Check #') ? method.replace('Check #', '') : '';
    const payMethod = method.startsWith('Check') ? 'Check' : method;
    const noteText = checkNum 
        ? 'Check #' + checkNum + ' - Logged by staff via Wellness Hub' 
        : 'Logged by staff via Wellness Hub';

    const payFields = {
      "Member": [airtableId],
      "Amount": payAmount,
      "Payment Date": new Date().toISOString().split('T')[0],
      "Payment Method": payMethod,
      "Status": "Completed",
      "Notes": noteText
    };
    
    // Only append Check Number if it exists
    if (checkNum) payFields["Check Number"] = checkNum;

    const payRes = await fetch(`https://api.airtable.com/v0/${baseId}/Payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ fields: payFields }]
      })
    });
    
    const payData = await payRes.json();
    
    // Trap HTTP errors from Airtable immediately
    if (!payRes.ok || payData.error) {
      console.error('Payment record error:', payData.error || payData);
      return NextResponse.json({ success: false, error: 'Failed to save payment in Airtable' }, { status: 400 });
    }
    
    // 3. Update the Member record
    const memberFields = {
      "Next Payment Due": nextPaymentDue,
      "Membership Status": "Active",
    };
    
    // Safely apply or clear the Check Number in Airtable (use null, not "")
    if (checkNum) {
      memberFields["Check Number"] = checkNum;
    } else {
      memberFields["Check Number"] = null; 
    }

    const memRes = await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: memberFields
      })
    });
    
    const memData = await memRes.json();
    
    // Trap HTTP errors from Airtable immediately
    if (!memRes.ok || memData.error) {
      console.error('Member update error:', memData.error || memData);
      return NextResponse.json({ success: false, error: 'Failed to update member in Airtable' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, nextPaymentDue, paymentSaved: true, memberUpdated: true });
    
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
