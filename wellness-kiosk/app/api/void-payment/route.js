import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { paymentId, reason, undo } = await request.json();
    if (!paymentId) {
      return NextResponse.json({ success: false, error: 'Payment ID required' }, { status: 400 });
    }
    const baseId = process.env.AIRTABLE_BASE_ID;
    const token = process.env.AIRTABLE_PAT;

    let existingNotes = '';
    try {
      const look = await fetch('https://api.airtable.com/v0/' + baseId + '/Payments/' + paymentId, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      const ld = await look.json();
      existingNotes = (ld.fields && ld.fields['Notes']) || '';
    } catch (e) {}

    const cleaned = existingNotes.replace(/^CANCELLED[^|]*\|\s*/, '');
    const fields = undo
      ? { 'Status': 'Completed', 'Notes': cleaned }
      : {
          'Status': 'Cancelled',
          'Notes': 'CANCELLED ' + new Date().toISOString().split('T')[0] +
                   (reason ? ' - ' + String(reason).trim() : '') + ' | ' + cleaned
        };

    const res = await fetch('https://api.airtable.com/v0/' + baseId + '/Payments/' + paymentId, {
      method: 'PATCH',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, typecast: true })
    });
    const data = await res.json();
    if (!res.ok || data.error) {
      const detail = (data.error && (data.error.message || data.error.type)) || 'Could not update the payment';
      return NextResponse.json({ success: false, error: detail }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
