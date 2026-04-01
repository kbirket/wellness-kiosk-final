// app/api/update-member/route.js
import { NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const MEMBERS_TABLE = process.env.AIRTABLE_MEMBERS_TABLE || 'Members';

// Helper function to convert empty strings to null for Airtable
const sanitize = (value) => (value === '' ? null : value);

export async function POST(request) {
  try {
    const body = await request.json();
    const { airtableId, ...fields } = body;

    if (!airtableId) {
      return NextResponse.json({ success: false, error: 'Missing member record ID' }, { status: 400 });
    }

    const airtableFields = {};

    // Apply the sanitize function to safely handle blank fields
    if (fields.firstName !== undefined) airtableFields['First Name'] = sanitize(fields.firstName);
    if (fields.lastName !== undefined) airtableFields['Last Name'] = sanitize(fields.lastName);
    if (fields.email !== undefined) airtableFields['Email'] = sanitize(fields.email);
    if (fields.phone !== undefined) airtableFields['Phone'] = sanitize(fields.phone);
    if (fields.address !== undefined) airtableFields['Street Address'] = sanitize(fields.address);
    if (fields.city !== undefined) airtableFields['City'] = sanitize(fields.city);
    if (fields.state !== undefined) airtableFields['State'] = sanitize(fields.state);
    if (fields.zip !== undefined) airtableFields['Zip'] = sanitize(fields.zip);
    if (fields.billingMethod !== undefined) airtableFields['Billing Method'] = sanitize(fields.billingMethod);
    if (fields.center !== undefined) airtableFields['Home Center'] = sanitize(fields.center);
    if (fields.sponsor !== undefined) airtableFields['Corporate Sponsor'] = sanitize(fields.sponsor);
    if (fields.badgeNumber !== undefined) airtableFields['Badge Number'] = sanitize(fields.badgeNumber);
    if (fields.notes !== undefined) airtableFields['Notes'] = sanitize(fields.notes);
    if (fields.discountCode !== undefined) airtableFields['Discount Code'] = sanitize(fields.discountCode);
    if (fields.discountExpiration !== undefined) airtableFields['Discount Expiration'] = sanitize(fields.discountExpiration);
 if (fields.nextPayment !== undefined) airtableFields['Next Payment Due'] = sanitize(fields.nextPayment);
    if (typeof fields.inactive === 'boolean') airtableFields['Inactive'] = fields.inactive;
    
    // Booleans usually pass properly as true/false, so we can leave this one as is
    if (fields.access247 !== undefined) airtableFields['24/7 Access'] = fields.access247;
    if (fields.monthlyRate !== undefined) airtableFields['Monthly Rate'] = fields.monthlyRate;

    // Membership Type is a linked record to the Pricing Reference table
    // We need to look up the record ID by plan name
    if (fields.plan !== undefined) {
      try {
        const pricingTable = encodeURIComponent('Pricing Reference');
        const pricingRes = await fetch(
          `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${pricingTable}`,
          { headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` } }
        );
        
        if (pricingRes.ok) {
          const pricingData = await pricingRes.json();
          // Find the record whose name matches the plan
          const planRecord = pricingData.records.find(r => {
            const name = r.fields['Membership Type'] || r.fields['Plan Name'] || r.fields['Name'] || '';
            return String(name).toUpperCase().trim() === String(fields.plan).toUpperCase().trim();
          });
          
          if (planRecord) {
            airtableFields['Membership Type'] = [planRecord.id];
          } else {
            console.warn(`Could not find Pricing Reference record for plan: ${fields.plan}`);
          }
        }
      } catch (planErr) {
        console.error('Error looking up Pricing Reference:', planErr);
      }
    }

    const res = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${MEMBERS_TABLE}/${airtableId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields: airtableFields }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      console.error('Airtable error:', errorData);
      return NextResponse.json({ success: false, error: errorData.error?.message || 'Airtable update failed' }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json({ success: true, record: data });

  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
