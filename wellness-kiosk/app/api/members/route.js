import { NextResponse } from 'next/server';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableId = 'tblEXRQUp2wzs5jhz'; // Your exact Table ID

  // Safety check to ensure Vercel is actually passing the keys
  if (!baseId || !token) {
    return NextResponse.json({ 
      error: "Missing Environment Variables",
      details: "Check Vercel Settings -> Environment Variables" 
    }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.trim()}`,
          'Content-Type': 'application/json',
        },
        // This ensures Vercel doesn't show you "old" data
        cache: 'no-store'
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        error: `Airtable responded with ${response.status}`,
        details: data
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ 
      error: "Bridge Connection Failed", 
      details: error.message 
    }, { status: 500 });
  }
}
