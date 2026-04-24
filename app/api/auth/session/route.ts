import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const SESSION_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

// POST /api/auth/session — exchange Firebase ID token for session cookie
export async function POST(req: NextRequest) {
  const { idToken } = await req.json() as { idToken: string };
  if (!idToken) return NextResponse.json({ error: 'Missing idToken' }, { status: 400 });

  try {
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    });

    const res = NextResponse.json({ ok: true });
    res.cookies.set('__session', sessionCookie, {
      maxAge:   SESSION_DURATION_MS / 1000,
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
