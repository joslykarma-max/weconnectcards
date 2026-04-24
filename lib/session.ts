// Server-side session management via Firebase session cookies
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './firebase-admin';

export interface SessionUser {
  uid:   string;
  email: string | null;
  name:  string | null;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return {
      uid:   decoded.uid,
      email: decoded.email ?? null,
      name:  decoded.name ?? null,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}
