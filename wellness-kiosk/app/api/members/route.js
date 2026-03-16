import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  
  // This safely checks your Vercel settings for your EXACT table name
  // so Airtable doesn't get confused and return an empty list!
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members'; 

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
