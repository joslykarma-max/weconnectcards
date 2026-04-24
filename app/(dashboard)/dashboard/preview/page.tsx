import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import PreviewClient from './PreviewClient';
import type { ProfileDoc } from '@/lib/types';

export default async function PreviewPage() {
  const user = await requireAuth();
  const snap = await adminDb.collection('profiles').doc(user.uid).get();
  const profile = snap.exists ? (snap.data() as ProfileDoc) : null;

  return (
    <PreviewClient
      username={profile?.username ?? ''}
      isPublic={profile?.isPublic ?? false}
    />
  );
}
