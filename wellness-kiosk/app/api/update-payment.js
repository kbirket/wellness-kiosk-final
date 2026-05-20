export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request) {
  try {
    const { paymentId, date, amount, method, checkNumber, notes } = await request.json();
    
    if (!paymentId) {
      return Response.json({ success: false, error: 'Payment ID required' }, { status: 400 });
    }
    
    const fields = {};
    if (date) fields['Payment Date'] = date;
    if (amount !== undefined) fields['Amount'] = amount;
    if (method) fields['Payment Method'] = method;
    if (checkNumber !== undefined) fields['Check Number'] = checkNumber;
    if (notes !== undefined) fields['Notes'] = notes;
    
    const res = await fetch(
      'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Payments/' + paymentId,
      {
        method: 'PATCH',
        headers: {
          'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields, typecast: true })
      }
    );
    
    const data = await res.json();
    
    if (data.error) {
      return Response.json({ success: false, error: data.error.message || JSON.stringify(data.error) }, { status: 500 });
    }
    
    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
