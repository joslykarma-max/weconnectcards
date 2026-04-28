import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import TeamClient from './TeamClient';
import type { TeamDoc, TeamMemberDoc, UserDoc } from '@/lib/types';

export default async function TeamPage() {
  const user = await requireAuth();

  const [userSnap, teamSnap, ownerScansSnap, ownerClicksSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('teams').doc(user.uid).get(),
    adminDb.collection('scans').where('userId', '==', user.uid).get(),
    adminDb.collection('linkClicks').where('profileId', '==', user.uid).get(),
  ]);

  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const isPro    = userData?.plan === 'pro';

  let members: Array<{ id: string } & TeamMemberDoc> = [];
  let teamName = '';

  if (isPro && teamSnap.exists) {
    const teamData = teamSnap.data() as TeamDoc;
    teamName = teamData.name;
    const membersSnap = await adminDb.collection('teams').doc(user.uid).collection('members').get();
    members = membersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as TeamMemberDoc) }));
  }

  // Per-member stats
  const memberStats: Record<string, { scans: number; clicks: number }> = {};
  const activeMembers = members.filter((m) => m.uid);

  if (activeMembers.length > 0) {
    await Promise.all(
      activeMembers.map(async (m) => {
        const [s, c] = await Promise.all([
          adminDb.collection('scans').where('userId', '==', m.uid!).get(),
          adminDb.collection('linkClicks').where('profileId', '==', m.uid!).get(),
        ]);
        memberStats[m.id] = { scans: s.size, clicks: c.size };
      }),
    );
  }

  const totalScans  = ownerScansSnap.size  + Object.values(memberStats).reduce((a, s) => a + s.scans, 0);
  const totalClicks = ownerClicksSnap.size + Object.values(memberStats).reduce((a, s) => a + s.clicks, 0);

  return (
    <TeamClient
      teamName={teamName || 'Mon équipe'}
      members={members.map((m) => ({
        id:          m.id,
        email:       m.email,
        displayName: m.displayName,
        role:        m.role,
        status:      m.status,
        invitedAt:   m.invitedAt,
        joinedAt:    m.joinedAt,
        stats:       memberStats[m.id] ?? null,
      }))}
      ownerStats={{ scans: ownerScansSnap.size, clicks: ownerClicksSnap.size }}
      totalStats={{ scans: totalScans, clicks: totalClicks }}
      ownerEmail={user.email ?? ''}
      isPro={isPro}
    />
  );
}
