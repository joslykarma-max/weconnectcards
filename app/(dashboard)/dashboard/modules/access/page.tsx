import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import AccessDashboard from './AccessDashboard';
import type { ModuleDoc, AccessZone, AccessLog, AccessCardDoc, ProfileDoc } from '@/lib/types';

export default async function AccessPage() {
  const user = await requireAuth();

  const [snap, logSnap, cardsSnap, profileSnap] = await Promise.all([
    adminDb.collection('modules').doc(`${user.uid}_access`).get(),
    adminDb.collection('accessLogs').where('profileId', '==', user.uid).get(),
    adminDb.collection('accessCards').where('profileId', '==', user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const config = snap.exists ? ((snap.data() as ModuleDoc).config ?? {}) : {};
  const logs: AccessLog[] = logSnap.docs.map(d => d.data() as AccessLog);
  const cards: AccessCardDoc[] = cardsSnap.docs
    .map(d => d.data() as AccessCardDoc)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const username = profileSnap.exists ? (profileSnap.data() as ProfileDoc).username : '';

  return (
    <AccessDashboard
      initialZones={(config.zones as AccessZone[] | undefined) ?? []}
      initialLogs={logs}
      initialCards={cards}
      username={username}
    />
  );
}
