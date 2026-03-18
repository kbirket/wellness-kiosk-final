// /app/api/update-visitor-orientation/route.js
// Mark a visitor's orientation as complete so they can use the kiosk
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const body = await request.json();

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/Visitors/${body.visitorAirtableId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fields: {
          "Orientation Complete": true,
          "Orientation Date": new Date().toISOString().slice(0, 10),
        }
      })
    });

    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
