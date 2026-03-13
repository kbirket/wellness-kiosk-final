import { NextResponse } from 'next/server';

export async function GET() {
  // These MUST match the names you typed into the Vercel "Environment Variables" section
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableId = 'tblEXRQUp2wzs5jhz';

  // Defensive check: If Vercel didn't load the keys, we'll know immediately
  if (!baseId || !token) {
    return NextResponse.json({ 
      error: 'Environment Variables are missing in Vercel!',
      check: { hasBase: !!baseId, hasToken: !!token }
    }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: `Airtable Error: ${response.status}`,
        details: errorText,
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      error: 'Bridge connection failed',
      details: error.message,
    }, { status: 500 });
  }
}
