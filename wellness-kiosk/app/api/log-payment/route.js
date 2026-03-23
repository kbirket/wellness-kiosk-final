import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { airtableId, method, currentDueDate, amount } = await request.json();
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;

    // 1. Calculate the NEW due date (add 1 month to current, or if null, start from today)
    let nextDate = new Date();
    if (currentDueDate && currentDueDate !== 'N/A') {
        nextDate = new Date(currentDueDate);
    }
    nextDate.setMonth(nextDate.getMonth() + 1);
    const nextPaymentDue = nextDate.toISOString().split('T')[0];

    // 2. Create the Payment Record in the "Payments" table
    await fetch(`https://api.airtable.com/v0/${baseId}/Payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{
          fields: {
            "Member": [airtableId],
            "Amount": Number(amount),
            "Payment Date": new Date().toISOString().split('T')[0],
            "Payment Method": method,
            "Status": "Completed",
            "Notes": "Logged by staff via Wellness Hub"
          }
        }]
      })
    });

    // 3. Update the Member's Next Payment Due date in the "Members" table
    await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          "Next Payment Due": nextPaymentDue,
          "Membership Status": "Active"
        }
      })
    });

    return NextResponse.json({ success: true, nextPaymentDue });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
