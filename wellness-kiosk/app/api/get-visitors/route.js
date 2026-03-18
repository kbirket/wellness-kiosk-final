// /app/api/get-visitors/route.js
// Fetch all visitors from the Visitors table
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Visitors?sort%5B0%5D%5Bfield%5D=Purchase%20Date&sort%5B0%5D%5Bdirection%5D=desc`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
