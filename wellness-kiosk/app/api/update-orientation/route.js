// /app/api/update-orientation/route.js
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const baseId = process.env.AIRTABLE_BASE_ID;
  const token = process.env.AIRTABLE_PAT;
  const tableName = process.env.AIRTABLE_TABLE_NAME || 'Members';

  try {
    const { airtableId, completed } = await request.json();

    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing airtableId' }, { status: 400 });
    }
// In your update-orientation API route:
const { airtableId, completed, center } = req.body;

const fieldsToUpdate = {};
if (center === 'anthony') {
  fieldsToUpdate['Orientation Anthony'] = true;
} else if (center === 'harper') {
  fieldsToUpdate['Orientation Harper'] = true;
} else {
  // Legacy: mark both complete
  fieldsToUpdate['Needs Orientation'] = false;
  fieldsToUpdate['Orientation Anthony'] = true;
  fieldsToUpdate['Orientation Harper'] = true;
}

// Check if both are now done — if so, clear Needs Orientation too
// (You may want to fetch the record first to check the other center)
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Needs Orientation': !completed,
        },
      }),
    });

    const data = await response.json();

    

    if (data.error) {
      return NextResponse.json({ success: false, error: data.error.message || 'Airtable Error' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
