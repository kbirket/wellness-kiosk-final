// /app/api/update-pin/route.js
// Next.js App Router API route for updating a member's PIN in Airtable
// 
// Required environment variables in your .env.local:
//   AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx   (Personal Access Token from airtable.com/create/tokens)
//   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX  (Found in Airtable API docs for your base)
//   AIRTABLE_MEMBERS_TABLE=Members       (Your members table name)

import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || 'Members';

export async function POST(request) {
  try {
    const { recordId, newPin } = await request.json();

    // Validate input
    if (!recordId || !newPin) {
      return NextResponse.json(
        { error: 'Missing recordId or newPin' },
        { status: 400 }
      );
    }

    if (!/^\d{4}$/.test(newPin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    if (newPin === '1111' || newPin === '0000') {
      return NextResponse.json(
        { error: 'Please choose a more secure PIN' },
        { status: 400 }
      );
    }

    // Update the record in Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_MEMBERS_TABLE)}/${recordId}`;

    const response = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Password': newPin,
          'Has Custom PIN': true,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json(
        { error: 'Failed to update PIN in database' },
        { status: 500 }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'PIN updated successfully',
      memberId: data.fields?.['Member ID'] || recordId,
    });

  } catch (error) {
    console.error('Update PIN error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
