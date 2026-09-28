export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const all = [];
    let offset = null, pages = 0;
    do {
      const url = 'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID +
        '/Corporate%20Charges?pageSize=100' + (offset ? '&offset=' + offset : '');
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT },
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.error) return Response.json({ success: false, error: data.error.message }, { status: 500 });
      (data.records || []).forEach(r => {
        all.push({
          airtableId: r.id,
          companyId: Array.isArray(r.fields['Company']) ? r.fields['Company'][0] : (r.fields['Company'] || ''),
          memberRecId: Array.isArray(r.fields['Member']) ? r.fields['Member'][0] : (r.fields['Member'] || ''),
          memberName: r.fields['Member Name'] || '',
          month: r.fields['Month'] || '',
          amount: parseFloat(r.fields['Amount']) || 0,
          status: r.fields['Status'] || 'Owed',
          paidDate: r.fields['Paid Date'] || '',
          paymentMethod: r.fields['Payment Method'] || '',
          notes: r.fields['Notes'] || ''
        });
      });
      offset = data.offset;
      pages++;
    } while (offset && pages < 20);
    return Response.json({ success: true, charges: all });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
