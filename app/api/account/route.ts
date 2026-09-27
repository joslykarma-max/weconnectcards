import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb, adminAuth } from '@/lib/firebase-admin';

export async function DELETE() {
  const user = await requireAuth();
  const uid  = user.uid;

  const batch = adminDb.batch();

  // Profile + links sub-collection
  const linksSnap = await adminDb.collection('profiles').doc(uid).collection('links').get();
  linksSnap.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(adminDb.collection('profiles').doc(uid));

  // Username reservation
  const profileSnap = await adminDb.collection('profiles').doc(uid).get();
  const username    = profileSnap.exists ? (profileSnap.data() as { username?: string }).username : null;
  if (username) batch.delete(adminDb.collection('usernames').doc(username));

  // Card-specific profiles (+ their links and usernames)
  const cardProfilesSnap = await adminDb.collection('profiles').where('uid', '==', uid).get();
  for (const d of cardProfilesSnap.docs) {
    if (d.id === uid) continue;
    const cardLinksSnap = await d.ref.collection('links').get();
    cardLinksSnap.docs.forEach((l) => batch.delete(l.ref));
    const cardUsername = (d.data() as { username?: string }).username;
    if (cardUsername) batch.delete(adminDb.collection('usernames').doc(cardUsername));
    batch.delete(d.ref);
  }

  // User doc
  batch.delete(adminDb.collection('users').doc(uid));

  await batch.commit();

  // Scans and clicks (fire-and-forget, large collections)
  adminDb.collection('scans').where('userId', '==', uid).get()
    .then((snap) => {
      const b = adminDb.batch();
      snap.docs.forEach((d) => b.delete(d.ref));
      return b.commit();
    }).catch(() => {});

  adminDb.collection('linkClicks').where('profileId', '==', uid).get()
    .then((snap) => {
      const b = adminDb.batch();
      snap.docs.forEach((d) => b.delete(d.ref));
      return b.commit();
    }).catch(() => {});

  // Delete Firebase Auth user
  await adminAuth.deleteUser(uid);

  return NextResponse.json({ ok: true });
}
