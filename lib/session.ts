// Server-side session management via Firebase session cookies
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from './firebase-admin';

export interface SessionUser {
  uid:   string;
  email: string | null;
  name:  string | null;
}

// One verification per request (layout + page + nested calls share it).
// The cookie's signature and expiry are always checked; the extra revocation lookup
// (a network call to Firebase Auth on every navigation) is skipped because sessions
// are never revoked in this app — logout simply clears the cookie.
export const getSession = cache(async (): Promise<SessionUser | null> => {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;
    if (!sessionCookie) return null;

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, false);
    return {
      uid:   decoded.uid,
      email: decoded.email ?? null,
      name:  decoded.name ?? null,
    };
  } catch {
    return null;
  }
});

export async function requireAuth(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}
