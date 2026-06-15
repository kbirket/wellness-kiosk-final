export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function POST(request) {
  try {
    const { airtableId, memberName, method, amount, refundDate, originalPaymentId, reason } = await request.json();
    
    if (!airtableId || !amount) {
      return Response.json({ success: false, error: 'Member ID and amount are required' }, { status: 400 });
    }
    
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;
    
    const refundAmount = Number(amount) || 0;
    const checkNum = method && method.startsWith('Check #') ? method.replace('Check #', '') : '';
    const payMethod = method && method.startsWith('Check') ? 'Check' : (method || 'Cash');
    
    const noteText = (reason && reason.trim() ? reason.trim() + ' | ' : '') + 'REFUND - Issued by staff via Wellness Hub';
    
    const payFields = {
      "Member": [airtableId],
      "Amount": refundAmount,
      "Payment Date": refundDate || new Date().toISOString().split('T')[0],
      "Payment Method": payMethod,
      "Status": "Completed",
      "Notes": noteText,
      "Is Refund": true
    };
    
    if (checkNum) payFields["Check Number"] = checkNum;
    if (originalPaymentId) payFields["Refund Of"] = [originalPaymentId];
    
    const res = await fetch('https://api.airtable.com/v0/' + baseId + '/Payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{ fields: payFields }],
        typecast: true
      })
    });
    
    const data = await res.json();
    
    if (!res.ok || data.error) {
      return Response.json({ success: false, error: data.error ? (data.error.message || JSON.stringify(data.error)) : 'Failed to save refund' }, { status: 400 });
    }
    
    // If this refund is linked to an original payment, roll back the member's Next Payment Due by one month
    let dueDateRolledBack = false;
    let newDueDate = null;
    if (originalPaymentId) {
      try {
        const memRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + airtableId, {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const memData = await memRes.json();
        if (memRes.ok && !memData.error && memData.fields && memData.fields['Next Payment Due']) {
          const currentDue = new Date(memData.fields['Next Payment Due'] + 'T00:00:00');
          currentDue.setMonth(currentDue.getMonth() - 1);
          newDueDate = currentDue.toISOString().split('T')[0];
          
          const updateRes = await fetch('https://api.airtable.com/v0/' + baseId + '/Members/' + airtableId, {
            method: 'PATCH',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              fields: { 'Next Payment Due': newDueDate }
            })
          });
          if (updateRes.ok) dueDateRolledBack = true;
        }
      } catch (rollbackErr) {
        // Refund record was created successfully; due-date rollback is best-effort
        console.error('Could not roll back due date:', rollbackErr);
      }
    }
    
    return Response.json({ 
      success: true, 
      recordId: data.records && data.records[0] ? data.records[0].id : null,
      dueDateRolledBack,
      newDueDate
    });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
