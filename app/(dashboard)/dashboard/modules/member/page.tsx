import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import MemberDashboard from './MemberDashboard';
import type { ModuleDoc, MemberCardDoc, ProfileDoc } from '@/lib/types';

export default async function MemberPage() {
  const user = await requireAuth();

  const [snap, cardsSnap, profileSnap] = await Promise.all([
    adminDb.collection('modules').doc(`${user.uid}_member`).get(),
    adminDb.collection('memberCards').where('profileId', '==', user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const config = snap.exists ? ((snap.data() as ModuleDoc).config ?? {}) : {};
  const cards: MemberCardDoc[] = cardsSnap.docs
    .map(d => d.data() as MemberCardDoc)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const username = profileSnap.exists ? (profileSnap.data() as ProfileDoc).username : '';

  return (
    <MemberDashboard
      initialConfig={{
        clubName:  String(config.clubName  ?? ''),
        clubPhoto: String(config.clubPhoto  ?? ''),
        website:   String(config.website    ?? ''),
        benefits:  String(config.benefits   ?? ''),
      }}
      initialCards={cards}
      username={username}
    />
  );
}
