// /app/api/renew-visitor/route.js
// Renews an existing visitor's pass — updates expiration date and logs history in Notes
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

function getExpirationDate(passType) {
  const now = new Date();
  switch (passType) {
    case 'Day Pass':
      now.setHours(23, 59, 59, 999);
      return now.toISOString().slice(0, 10);
    case '2-Week Courtesy':
      now.setDate(now.getDate() + 14);
      return now.toISOString().slice(0, 10);
    case 'Month Courtesy':
      now.setMonth(now.getMonth() + 1);
      return now.toISOString().slice(0, 10);
    default:
      return now.toISOString().slice(0, 10);
  }
}

function getAmountPaid(passType) {
  switch (passType) {
    case 'Day Pass': return 5;
    case '2-Week Courtesy': return 0;
    case 'Month Courtesy': return 0;
    default: return 0;
  }
}

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const body = await request.json();
    const { visitorAirtableId, newPassType, previousPassType, previousExpiration, existingNotes } = body;

    const newExpiration = getExpirationDate(newPassType);
    const amountPaid = getAmountPaid(newPassType);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    // Build the history log entry
    const historyEntry = `[${today}] Renewed: ${previousPassType} (exp ${previousExpiration}) → ${newPassType} (exp ${newExpiration})`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${historyEntry}` : historyEntry;

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/Visitors/${visitorAirtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          "Pass Type": newPassType,
          "Amount Paid": amountPaid,
          "Purchase Date": new Date().toISOString().slice(0, 10),
          "Expiration Date": newExpiration,
          "Notes": updatedNotes,
          "Orientation Complete": true,
        }
      })
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      newExpiration,
      newPassType,
      amountPaid,
      updatedNotes,
    });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
