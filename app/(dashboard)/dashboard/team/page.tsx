import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import TeamClient from './TeamClient';
import type { TeamDoc, TeamMemberDoc, UserDoc } from '@/lib/types';

export default async function TeamPage() {
  const user = await requireAuth();

  const [userSnap, teamSnap, scansSnap, clicksSnap] = await Promise.all([
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('teams').doc(user.uid).get(),
    adminDb.collection('scans').where('userId', '==', user.uid).get(),
    adminDb.collection('linkClicks').where('profileId', '==', user.uid).get(),
  ]);

  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const isPro    = userData?.plan === 'pro';

  // Fetch team members
  let members: Array<{ id: string } & TeamMemberDoc> = [];
  let teamName = '';
  let memberUids: string[] = [];

  if (isPro && teamSnap.exists) {
    const teamData = teamSnap.data() as TeamDoc;
    teamName = teamData.name;

    const membersSnap = await adminDb.collection('teams').doc(user.uid).collection('members').get();
    members = membersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as TeamMemberDoc) }));
    memberUids = members.filter((m) => m.uid).map((m) => m.uid!);
  }

  // Aggregate scans + clicks for all team members
  let totalScans  = scansSnap.size;
  let totalClicks = clicksSnap.size;

  if (memberUids.length > 0) {
    await Promise.all(
      memberUids.map(async (uid) => {
        const [s, c] = await Promise.all([
          adminDb.collection('scans').where('userId', '==', uid).get(),
          adminDb.collection('linkClicks').where('profileId', '==', uid).get(),
        ]);
        totalScans  += s.size;
        totalClicks += c.size;
      }),
    );
  }

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
      }))}
      stats={{ totalScans, totalClicks, activeMembers: members.filter((m) => m.status === 'active').length }}
      ownerEmail={user.email ?? ''}
      isPro={isPro}
    />
  );
}
