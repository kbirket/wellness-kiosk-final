// /app/api/log-payment/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const membersTable = process.env.AIRTABLE_TABLE_NAME || 'Members';
  const paymentsTable = 'Payments';

  try {
    const { airtableId, memberName, method, amount, currentDueDate } = await request.json();

    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing member ID' }, { status: 400 });
    }

    // Calculate the new Next Payment Due date (1 month from current due date, or 1 month from today)
    let nextDate;
    if (currentDueDate) {
      const d = new Date(currentDueDate);
      d.setMonth(d.getMonth() + 1);
      nextDate = d.toISOString().split('T')[0]; // YYYY-MM-DD
    } else {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      nextDate = d.toISOString().split('T')[0];
    }

    // Step 1: Update the member's status and next payment date
    const memberRes = await fetch(`https://api.airtable.com/v0/${baseId}/${membersTable}/${airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Membership Status': 'Active',
          'Next Payment Due': nextDate,
        },
      }),
    });

    const memberData = await memberRes.json();
    if (memberData.error) {
      return NextResponse.json({ success: false, error: memberData.error.message || 'Failed to update member' }, { status: 400 });
    }

    // Step 2: Create a payment record
    const paymentRes = await fetch(`https://api.airtable.com/v0/${baseId}/${paymentsTable}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [{
          fields: {
            'Member': [airtableId],
            'Amount': amount ? parseFloat(amount) : 0,
            'Payment Date': new Date().toISOString().split('T')[0],
            'Payment Method': method || 'Cash',
            'Status': 'Completed',
            'Notes': `Logged by staff via Wellness Hub`,
          },
        }],
        typecast: true,
      }),
    });

    const paymentData = await paymentRes.json();

    return NextResponse.json({
      success: true,
      nextPaymentDue: nextDate,
      paymentError: paymentData.error ? paymentData.error.message : null,
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
