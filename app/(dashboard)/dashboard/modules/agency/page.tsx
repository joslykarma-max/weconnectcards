import { requireAuth }    from '@/lib/session';
import { adminDb }        from '@/lib/firebase-admin';
import AgencyDashboard    from './AgencyDashboard';
import type { ModuleDoc, ProfileDoc, AgentCardDoc, AgentEventDoc } from '@/lib/types';

export default async function AgencyPage() {
  const user = await requireAuth();
  const uid  = user.uid;

  const [moduleSnap, profileSnap, agentsSnap, eventsSnap] = await Promise.all([
    adminDb.collection('modules').doc(`${uid}_agency`).get(),
    adminDb.collection('profiles').doc(uid).get(),
    adminDb.collection('agentCards').where('profileId', '==', uid).get(),
    adminDb.collection('agentEvents').where('profileId', '==', uid).get(),
  ]);

  const config   = moduleSnap.exists ? ((moduleSnap.data() as ModuleDoc).config ?? {}) : {};
  const username = profileSnap.exists ? (profileSnap.data() as ProfileDoc).username ?? '' : '';

  const agents = agentsSnap.docs
    .map(d => d.data() as AgentCardDoc)
    .filter(a => a.isActive)
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  const events = eventsSnap.docs.map(d => {
    const e = d.data() as AgentEventDoc;
    return { agentId: e.agentId, action: e.action };
  });

  return (
    <AgencyDashboard
      username={username}
      initialAgents={agents}
      initialEvents={events}
      initialConfig={{
        agencyName:   String(config.agencyName   ?? 'Inas Travel'),
        appClientUrl: String(config.appClientUrl ?? ''),
        appDriverUrl: String(config.appDriverUrl ?? ''),
        contactPhone: String(config.contactPhone ?? ''),
        contactLabel: String(config.contactLabel ?? 'Allo Inas'),
      }}
    />
  );
}
