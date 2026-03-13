import { NextResponse } from 'next/server';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableId = 'tblEXRQUp2wzs5jhz';

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

    // If Airtable rejects us, grab the exact reason why!
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: `Airtable said NO: ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({
      error: 'Bridge crashed',
      details: error.message,
    });
  }
}
