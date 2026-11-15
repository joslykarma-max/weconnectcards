import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { getUserSnap } from '@/lib/user-doc';
import Launcher, { type LauncherStats } from '@/components/dashboard/shell/Launcher';
import type { ProfileDoc } from '@/lib/types';

// Home: one round of cheap queries (counts, not full collections)
async function loadStats(user: { uid: string; name: string | null }): Promise<LauncherStats> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [profileSnap, userSnap, scans, contacts, modules, cards, events] = await Promise.all([
    adminDb.collection('profiles').doc(user.uid).get(),
    getUserSnap(user.uid),
    adminDb.collection('scans').where('userId', '==', user.uid).where('scannedAt', '>=', since).count().get().catch(() => null),
    adminDb.collection('savedContacts').where('profileId', '==', user.uid).count().get().catch(() => null),
    adminDb.collection('modules').where('profileId', '==', user.uid).where('isActive', '==', true).count().get().catch(() => null),
    adminDb.collection('cards').where('userId', '==', user.uid).where('status', '==', 'active').count().get().catch(() => null),
    adminDb.collection('events').where('organizerUid', '==', user.uid).count().get().catch(() => null),
  ]);

  const profile = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  return {
    name:          profile?.displayName || user.name || '',
    avatar:        profile?.avatar ?? null,
    username:      profile?.username ?? null,
    scans30:       scans?.data().count ?? 0,
    contacts:      contacts?.data().count ?? 0,
    activeModules: modules?.data().count ?? 0,
    activeCards:   cards?.data().count ?? 0,
    events:        events?.data().count ?? 0,
    isPro:         (userSnap.data() as { plan?: string } | undefined)?.plan === 'pro',
  };
}

export default async function DashboardHome() {
  const user = await requireAuth();
  return <Launcher s={await loadStats(user)} />;
}
