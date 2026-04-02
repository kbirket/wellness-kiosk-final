import { NextResponse } from 'next/server';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;

  try {
    const { className, center, date, attendees, createdBy } = await request.json();

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/Class Rosters`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        records: [{
          fields: {
            "Class Name": className,
            "Center": center,
            "Date": date,
            "Attendees": JSON.stringify(attendees),
            "Attendee Count": attendees.length,
            "Created By": createdBy || "Director"
          }
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message }, { status: 400 });
    }

    const record = data.records[0];
    return NextResponse.json({
      success: true,
      rosterId: record.id,
      className: record.fields['Class Name'],
      date: record.fields['Date']
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
