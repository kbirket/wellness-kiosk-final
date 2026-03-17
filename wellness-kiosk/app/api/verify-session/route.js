// /app/api/verify-session/route.js
// Verifies a stored session token is still valid and not expired
// Called on page load to restore sessions

import { NextResponse } from 'next/server';
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'fallback-dev-secret';

function verifyToken(token) {
  try {
    const { data, signature } = JSON.parse(Buffer.from(token, 'base64').toString());
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex');
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(data);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token' }, { status: 401 });
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json({ valid: false, error: 'Token expired or invalid' }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      type: payload.type,
      user: payload.type === 'director' ? {
        username: payload.username,
        name: payload.name,
        center: payload.center,
        role: payload.role,
      } : null,
      corp: payload.type === 'corporate' ? {
        username: payload.username,
        companyName: payload.companyName,
      } : null,
    });

  } catch (error) {
    return NextResponse.json({ valid: false, error: 'Server error' }, { status: 500 });
  }
}
