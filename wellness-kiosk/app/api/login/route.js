// /app/api/login/route.js
// Server-side authentication
// - Director accounts: credentials from env vars
// - Corporate accounts: pulled from Airtable "Corporate Partners" table
//
// Required env vars:
//   AIRTABLE_API_KEY=pat_xxxxxxxxxxxxx
//   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
//   DIRECTOR_ADMIN_PASS=admin2026
//   DIRECTOR_HARPER_PASS=harper2026
//   DIRECTOR_ANTHONY_PASS=anthony2026
//   AUTH_SECRET=<random string>

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-dev-secret';
const AIRTABLE_API_KEY = process.env.AIRTABLE_PAT;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

const DIRECTORS = [
  { username: 'admin', password: process.env.DIRECTOR_ADMIN_PASS, name: 'System Admin', center: 'both', role: 'admin' },
  { username: 'harper', password: process.env.DIRECTOR_HARPER_PASS, name: 'Harper Director', center: 'harper', role: 'director' },
  { username: 'anthony', password: process.env.DIRECTOR_ANTHONY_PASS, name: 'Anthony Director', center: 'anthony', role: 'director' },
];

function createToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + (8 * 60 * 60 * 1000) });
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
  return Buffer.from(JSON.stringify({ data, signature })).toString('base64');
}

export async function POST(request) {
  try {
    const { username, password, loginType } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const u = username.toLowerCase().trim();
    const p = password.trim();

    // ---- DIRECTOR LOGIN ----
    if (loginType === 'director') {
      const found = DIRECTORS.find(d => d.username === u && d.password === p);
      if (!found) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = createToken({
        type: 'director',
        username: found.username,
        name: found.name,
        center: found.center,
        role: found.role,
      });

      return NextResponse.json({
        success: true,
        token,
        user: { username: found.username, name: found.name, center: found.center, role: found.role },
      });
    }

    // ---- CORPORATE LOGIN (from Airtable) ----
    if (loginType === 'corporate') {
      const tableName = encodeURIComponent('Corporate Partners');
      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;

      const res = await fetch(airtableUrl, {
        headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` },
      });

      if (!res.ok) {
        console.error('Airtable fetch failed:', await res.text());
        return NextResponse.json({ error: 'Could not verify corporate credentials' }, { status: 500 });
      }

      const airtableData = await res.json();
      const partners = (airtableData.records || []).map(r => ({
        username: String(r.fields['Username'] || '').toLowerCase().trim(),
        password: String(r.fields['Password'] || '').trim(),
        companyName: String(r.fields['Company Name'] || '').trim(),
        sponsorFieldName: String(r.fields['Sponsor Match'] || r.fields['Company Name'] || '').trim(),
        contactName: r.fields['Contact Name'] || '',
        contactEmail: r.fields['Contact Email'] || '',
        active: r.fields['Active'] !== false,
      }));

      const found = partners.find(c => c.username === u && c.password === p && c.active);

      if (!found) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = createToken({
        type: 'corporate',
        username: found.username,
        companyName: found.companyName,
        sponsorFieldName: found.sponsorFieldName,
      });

      return NextResponse.json({
        success: true,
        token,
        corp: {
          username: found.username,
          companyName: found.companyName,
          sponsorFieldName: found.sponsorFieldName,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid login type' }, { status: 400 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
