import { adminDb } from '@/lib/firebase-admin';
import type { ProfileDoc } from '@/lib/types';

// Collection: usernames/{username} → { uid, profileId? }
// profileId is absent for an account's main profile (profiles/{uid}).
export interface UsernameDoc {
  uid:        string;
  profileId?: string;
}

/** Resolve a public username to its owner uid and the profile document id. */
export async function resolveUsername(username: string): Promise<{ uid: string; profileId: string } | null> {
  const snap = await adminDb.collection('usernames').doc(username).get();
  if (!snap.exists) return null;
  const data = snap.data() as UsernameDoc;
  return { uid: data.uid, profileId: data.profileId ?? data.uid };
}

/**
 * Returns the profile id the user is allowed to edit.
 * No id (or the uid itself) → main profile. Otherwise the profile must belong to the user.
 */
export async function getOwnedProfileId(uid: string, profileId?: string | null): Promise<string | null> {
  if (!profileId || profileId === uid) return uid;
  const snap = await adminDb.collection('profiles').doc(profileId).get();
  if (!snap.exists || (snap.data() as ProfileDoc).uid !== uid) return null;
  return profileId;
}
