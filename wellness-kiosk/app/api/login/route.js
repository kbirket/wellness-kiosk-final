// /app/api/login/route.js
// Server-side authentication — credentials never sent to the browser
//
// Add these to your .env.local:
//   DIRECTOR_ADMIN_PASS=admin2026
//   DIRECTOR_HARPER_PASS=harper2026
//   DIRECTOR_ANTHONY_PASS=anthony2026
//   CORP_ACME_PASS=acme2026
//   CORP_PATTERSON_PASS=patterson2026
//   AUTH_SECRET=wellness-hub-secret-change-me-to-something-random
//
// Generate a real AUTH_SECRET with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-dev-secret';

// Director accounts — passwords from env vars, never in client code
const DIRECTORS = [
  { username: 'admin', password: process.env.DIRECTOR_ADMIN_PASS, name: 'System Admin', center: 'both', role: 'admin' },
  { username: 'harper', password: process.env.DIRECTOR_HARPER_PASS, name: 'Patrick', center: 'harper', role: 'director' },
  { username: 'anthony', password: process.env.DIRECTOR_ANTHONY_PASS, name: 'Deanna', center: 'anthony', role: 'director' },
];

// Corporate partner accounts
const CORPORATES = [
  { username: 'acme', password: process.env.CORP_ACME_PASS, companyName: 'Acme Corp' },
  { username: 'patterson', password: process.env.CORP_PATTERSON_PASS, companyName: 'Patterson Inc' },
];

// Generate a signed session token (HMAC — not a full JWT, but secure for this use case)
function createToken(payload) {
  const data = JSON.stringify({ ...payload, exp: Date.now() + (8 * 60 * 60 * 1000) }); // 8 hour expiry
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
  // Base64 encode payload + signature
  const token = Buffer.from(JSON.stringify({ data, signature })).toString('base64');
  return token;
}

// Verify and decode a token
 function verifyToken(token) {
  try {
    const { data, signature } = JSON.parse(Buffer.from(token, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
    
    if (signature !== expectedSig) return null; // Tampered
    
    const payload = JSON.parse(data);
    if (payload.exp < Date.now()) return null; // Expired
    
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const { username, password, loginType } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const u = username.toLowerCase().trim();
    const p = password.trim();

    // Director login
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
        user: {
          username: found.username,
          name: found.name,
          center: found.center,
          role: found.role,
        },
      });
    }

    // Corporate login
    if (loginType === 'corporate') {
      const found = CORPORATES.find(c => c.username === u && c.password === p);
      if (!found) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const token = createToken({
        type: 'corporate',
        username: found.username,
        companyName: found.companyName,
      });

      return NextResponse.json({
        success: true,
        token,
        corp: {
          username: found.username,
          companyName: found.companyName,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid login type' }, { status: 400 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
