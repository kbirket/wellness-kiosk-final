import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
const { airtableId, method, currentDueDate, amount, paymentDate, note } = await request.json();    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    // 1. Look up the member's Home Center for center-specific billing rules
    let memberCenter = '';
    try {
      const lookupRes = await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const lookupData = await lookupRes.json();
      memberCenter = (lookupData.fields && lookupData.fields['Home Center']) || '';
    } catch (e) {
      // If lookup fails, fall back to default behavior
      memberCenter = '';
    }
    const isAnthony = memberCenter.toLowerCase().includes('anthony');
    
    // 2. Calculate the NEW due date
    // Anthony: always the 1st of the next calendar month after payment
    // Harper (and others): one month from the payment date
    let nextDate;
    if (paymentDate) {
        nextDate = new Date(paymentDate + 'T00:00:00');
    } else {
        nextDate = new Date();
    }
    if (isAnthony) {
      // Move to the 1st of the month AFTER the payment month
      nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, 1);
    } else {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    const nextPaymentDue = nextDate.toLocaleDateString('en-CA');
    
    // 3. Create the Payment Record
    const payAmount = Number(amount) || 0;
    const checkNum = method.startsWith('Check #') ? method.replace('Check #', '') : '';
    const payMethod = method.startsWith('Check') ? 'Check' : method;
    const userNote = note && note.trim() ? note.trim() : '';
    const baseNote = checkNum 
        ? 'Check #' + checkNum + ' - Logged by staff via Wellness Hub' 
        : 'Logged by staff via Wellness Hub';
    const noteText = userNote ? userNote + ' | ' + baseNote : baseNote;
    const payFields = {
      "Member": [airtableId],
      "Amount": payAmount,
"Payment Date": paymentDate || new Date().toISOString().split('T')[0],      "Payment Method": payMethod,
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
    
    // 4. Update the Member record
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
