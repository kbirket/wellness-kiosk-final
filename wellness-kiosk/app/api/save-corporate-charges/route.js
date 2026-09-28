export const dynamic = 'force-dynamic';

const BASE = () => 'https://api.airtable.com/v0/' + process.env.AIRTABLE_BASE_ID + '/Corporate%20Charges';
const HEAD = () => ({
  'Authorization': 'Bearer ' + process.env.AIRTABLE_PAT,
  'Content-Type': 'application/json'
});

export async function POST(request) {
  try {
    const body = await request.json();

    // create many at once (monthly generation)
    if (Array.isArray(body.create) && body.create.length) {
      const made = [];
      for (let i = 0; i < body.create.length; i += 10) {
        const batch = body.create.slice(i, i + 10).map(c => ({
          fields: {
            'Company': c.companyId ? [c.companyId] : undefined,
            'Member': c.memberRecId ? [c.memberRecId] : undefined,
            'Member Name': String(c.memberName || ''),
            'Month': String(c.month || ''),
            'Amount': Number(c.amount) || 0,
            'Status': c.status || 'Owed',
            'Notes': String(c.notes || '')
          }
        }));
        const res = await fetch(BASE(), {
          method: 'POST',
          headers: HEAD(),
          body: JSON.stringify({ records: batch, typecast: true })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          return Response.json({ success: false, error: data.error?.message || 'Could not create charges' }, { status: 500 });
        }
        (data.records || []).forEach(r => made.push(r.id));
      }
      return Response.json({ success: true, created: made.length, ids: made });
    }

    // update one
    if (body.recordId) {
      const fields = {};
      if (body.amount !== undefined) fields['Amount'] = Number(body.amount) || 0;
      if (body.status !== undefined) fields['Status'] = String(body.status);
      if (body.paidDate !== undefined) fields['Paid Date'] = body.paidDate || null;
      if (body.paymentMethod !== undefined) fields['Payment Method'] = String(body.paymentMethod || '');
      if (body.notes !== undefined) fields['Notes'] = String(body.notes || '');
      if (!Object.keys(fields).length) {
        return Response.json({ success: false, error: 'Nothing to update' }, { status: 400 });
      }
      const res = await fetch(BASE() + '/' + body.recordId, {
        method: 'PATCH',
        headers: HEAD(),
        body: JSON.stringify({ fields, typecast: true })
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return Response.json({ success: false, error: data.error?.message || 'Could not update charge' }, { status: 500 });
      }
      return Response.json({ success: true });
    }

    // update many (marking a whole month paid)
    if (Array.isArray(body.updates) && body.updates.length) {
      for (let i = 0; i < body.updates.length; i += 10) {
        const batch = body.updates.slice(i, i + 10).map(u => {
          const f = {};
          if (u.status !== undefined) f['Status'] = String(u.status);
          if (u.paidDate !== undefined) f['Paid Date'] = u.paidDate || null;
          if (u.paymentMethod !== undefined) f['Payment Method'] = String(u.paymentMethod || '');
          if (u.amount !== undefined) f['Amount'] = Number(u.amount) || 0;
          if (u.notes !== undefined) f['Notes'] = String(u.notes || '');
          return { id: u.recordId, fields: f };
        });
        const res = await fetch(BASE(), {
          method: 'PATCH',
          headers: HEAD(),
          body: JSON.stringify({ records: batch, typecast: true })
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          return Response.json({ success: false, error: data.error?.message || 'Could not update charges' }, { status: 500 });
        }
      }
      return Response.json({ success: true, updated: body.updates.length });
    }

    return Response.json({ success: false, error: 'Nothing to do' }, { status: 400 });
  } catch (err) {
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
