import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = 'Workouts'; // Dropping it into your new table!

  try {
    const body = await request.json();
    
    // Make sure we actually got a member and a workout
    if (!body.memberId || !body.routine) {
        return NextResponse.json({ success: false, error: "Missing Member ID or Routine data." }, { status: 400 });
    }

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            fields: {
              "Member ID": body.memberId,
              "Routine": body.routine
              // Airtable will automatically fill in the Date and Autonumber!
            }
          }
        ],
        typecast: true 
      })
    });

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: data });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
