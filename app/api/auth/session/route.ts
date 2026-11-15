import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const REMEMBER_MS = 14 * 24 * 60 * 60 * 1000; // « Se souvenir de moi »: 14 days (Firebase maximum)
const SHORT_MS    = 12 * 60 * 60 * 1000;      // otherwise: ends with the browser, 12 h at most

// POST /api/auth/session — exchange Firebase ID token for session cookie
export async function POST(req: NextRequest) {
  const { idToken, remember } = await req.json() as { idToken: string; remember?: boolean };
  if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });
  const keep = remember !== false;   // callers that don't send it (admin login) keep the 14-day session

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: keep ? REMEMBER_MS : SHORT_MS,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('__session', sessionCookie, {
      // no maxAge → browser-session cookie, cleared when the browser is closed
      ...(keep ? { maxAge: REMEMBER_MS / 1000 } : {}),
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path:     '/',
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

// DELETE /api/auth/session — sign out (clear cookie)
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set('__session', '', { maxAge: 0, path: '/' });
  return res;
}
