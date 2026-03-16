import { NextResponse } from 'next/server';

// These two lines tell Vercel to NEVER cache this data!
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Members'; // Your exact tab name

  try {
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      // Extra cache-busting instruction
      cache: 'no-store'
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
