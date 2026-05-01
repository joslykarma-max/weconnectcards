import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc, CardDoc } from '@/lib/types';
import ClientsAdminClient, { type AdminClient } from './ClientsAdminClient';

export default async function AdminClientsPage() {
  const [usersSnap, cardsSnap] = await Promise.all([
    adminDb.collection('users').get(),
    adminDb.collection('cards').get(),
  ]);

  // Build card counts per user (skip in-stock cards without an owner)
  const cardsByUser: Record<string, { total: number; active: number }> = {};
  cardsSnap.docs.forEach(d => {
    const c = d.data() as CardDoc;
    if (!c.userId) return;
    if (!cardsByUser[c.userId]) cardsByUser[c.userId] = { total: 0, active: 0 };
    cardsByUser[c.userId].total++;
    if (c.status === 'active') cardsByUser[c.userId].active++;
  });

  const clients: AdminClient[] = usersSnap.docs
    .map(d => {
      const u = d.data() as UserDoc;
      const stats = cardsByUser[d.id] ?? { total: 0, active: 0 };
      return {
        uid:         d.id,
        displayName: u.displayName ?? '',
        email:       u.email ?? '',
        plan:        u.plan ?? 'essentiel',
        createdAt:   u.createdAt ?? new Date(0).toISOString(),
        cardCount:   stats.total,
        activeCards: stats.active,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <ClientsAdminClient initialClients={clients} />;
}
