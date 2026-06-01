import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import TeamClient from './TeamClient';
import type { TeamDoc, TeamMemberDoc, UserDoc, AgentCardDoc, AgentEventDoc } from '@/lib/types';

export default async function TeamPage() {
  const user = await requireAuth();

  const [userSnap, teamSnap, ownerScansSnap, ownerClicksSnap, agentsSnap, eventsSnap] =
    await Promise.all([
      adminDb.collection('users').doc(user.uid).get(),
      adminDb.collection('teams').doc(user.uid).get(),
      adminDb.collection('scans').where('userId', '==', user.uid).get(),
      adminDb.collection('linkClicks').where('profileId', '==', user.uid).get(),
      adminDb.collection('agentCards').where('profileId', '==', user.uid).where('isActive', '==', true).get(),
      adminDb.collection('agentEvents').where('profileId', '==', user.uid).get(),
    ]);

  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const isPro    = userData?.plan === 'pro' || userData?.plan === 'equipe';

  // ── Team members ────────────────────────────────────────────────────────────
  let members: Array<{ id: string } & TeamMemberDoc> = [];
  let teamName = '';

  if (teamSnap.exists) {
    const teamData = teamSnap.data() as TeamDoc;
    teamName = teamData.name;
    const membersSnap = await adminDb.collection('teams').doc(user.uid).collection('members').get();
    members = membersSnap.docs.map((d) => ({ id: d.id, ...(d.data() as TeamMemberDoc) }));
  }

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

  // ── Agents ──────────────────────────────────────────────────────────────────
  const agents = agentsSnap.docs
    .map(d => d.data() as AgentCardDoc)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const agentEvents = eventsSnap.docs.map(d => {
    const e = d.data() as AgentEventDoc;
    return { agentId: e.agentId, action: e.action };
  });

  // ── Profile username (for QR URLs) ──────────────────────────────────────────
  const profileSnap = await adminDb.collection('profiles').doc(user.uid).get();
  const username    = profileSnap.exists
    ? (profileSnap.data() as { username?: string })?.username ?? ''
    : '';

  return (
    <TeamClient
      teamName={teamName || "Mon équipe"}
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
      agents={agents}
      agentEvents={agentEvents}
      username={username}
    />
  );
}
