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
    
    return Response.json({ success: true, recordId: data.records && data.records[0] ? data.records[0].id : null });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
