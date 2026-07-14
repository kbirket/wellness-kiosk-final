import { NextResponse } from 'next/server';
export async function POST(request) {
  try {
    const { airtableId, method, currentDueDate, amount, paymentDate, note } = await request.json();
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;

    // 1. Look up the member's Home Center + Family Group + Auto-Pay (ACH) settings
    let memberCenter = '';
    let familyGroupId = '';
    let achAutoPay = false;
    let achDraftDay = 3;
    try {
      const lookupRes = await fetch(`https://api.airtable.com/v0/${baseId}/Members/${airtableId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const lookupData = await lookupRes.json();
      memberCenter = (lookupData.fields && lookupData.fields['Home Center']) || '';
      const famField = lookupData.fields && lookupData.fields['Family Group'];
      if (Array.isArray(famField) && famField.length > 0) familyGroupId = famField[0];
      else if (typeof famField === 'string') familyGroupId = famField;
      achAutoPay = !!(lookupData.fields && lookupData.fields['Auto-Pay ACH']);
      const rawDraftDay = lookupData.fields && lookupData.fields['ACH Draft Day'];
      achDraftDay = (rawDraftDay === 3 || rawDraftDay === 18) ? rawDraftDay : 3;
    } catch (e) {
      memberCenter = '';
      familyGroupId = '';
    }
    const isAnthony = memberCenter.toLowerCase().includes('anthony');

    // 2. Calculate the NEW due date
    let nextDate;
    if (paymentDate) {
        nextDate = new Date(paymentDate + 'T00:00:00');
    } else {
        nextDate = new Date();
    }
    if (achAutoPay) {
      // Auto-pay: due date lands on the member's draft day of the following month,
      // so they don't read as unpaid in the gap before the draft posts.
      nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth() + 1, achDraftDay);
    } else if (isAnthony) {
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
      "Payment Date": paymentDate || new Date().toISOString().split('T')[0],
      "Payment Method": payMethod,
      "Status": "Completed",
      "Notes": noteText
    };

    if (checkNum) payFields["Check Number"] = checkNum;
    const payRes = await fetch(`https://api.airtable.com/v0/${baseId}/Payments`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        records: [{ fields: payFields }]
      })
    });

    const payData = await payRes.json();

    if (!payRes.ok || payData.error) {
      console.error('Payment record error:', payData.error || payData);
      return NextResponse.json({ success: false, error: 'Failed to save payment in Airtable' }, { status: 400 });
    }

    // 4. Update the Member record
    const memberFields = {
      "Next Payment Due": nextPaymentDue,
      "Membership Status": "Active",
    };

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

    if (!memRes.ok || memData.error) {
      console.error('Member update error:', memData.error || memData);
      return NextResponse.json({ success: false, error: 'Failed to update member in Airtable' }, { status: 400 });
    }

    // 5. If the payer is part of a family, advance Next Payment Due for all other family members too
    let familyMembersUpdated = 0;
    if (familyGroupId) {
      try {
        const filterFormula = encodeURIComponent(`AND(FIND('${familyGroupId}', ARRAYJOIN({Family Group})), RECORD_ID()!='${airtableId}')`);
        const famRes = await fetch(
          `https://api.airtable.com/v0/${baseId}/Members?filterByFormula=${filterFormula}&maxRecords=20`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const famData = await famRes.json();
        if (famData.records && famData.records.length > 0) {
          const updates = famData.records.map(rec => ({
            id: rec.id,
            fields: {
              "Next Payment Due": nextPaymentDue,
              "Membership Status": "Active"
            }
          }));
          // Airtable batch update — up to 10 records per call
          for (let i = 0; i < updates.length; i += 10) {
            const batch = updates.slice(i, i + 10);
            await fetch(`https://api.airtable.com/v0/${baseId}/Members`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ records: batch })
            });
          }
          familyMembersUpdated = updates.length;
        }
      } catch (famErr) {
        console.error('Family update failed:', famErr);
      }
    }

    return NextResponse.json({
      success: true,
      nextPaymentDue,
      paymentSaved: true,
      memberUpdated: true,
      familyMembersUpdated
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
