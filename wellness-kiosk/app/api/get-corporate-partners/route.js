// /app/api/get-corporate-partners/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Corporate%20Partners`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
