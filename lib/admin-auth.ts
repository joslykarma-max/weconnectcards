import { redirect } from 'next/navigation';
import { requireAuth, type SessionUser } from './session';
import { adminDb } from './firebase-admin';

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();

  // Bootstrap: allow UIDs listed in ADMIN_UIDS env var
  const envAdmins = (process.env.ADMIN_UIDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  if (envAdmins.includes(user.uid)) return user;

  // Check Firestore admins collection: admins/{uid}
  const snap = await adminDb.collection('admins').doc(user.uid).get();
  if (!snap.exists) redirect('/dashboard');

  return user;
}
