import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc, CardDoc } from '@/lib/types';
import ClientsAdminClient, { type AdminClient } from './ClientsAdminClient';

export default async function AdminClientsPage() {
  const [usersSnap, cardsSnap, scansSnap] = await Promise.all([
    adminDb.collection('users').get(),
    adminDb.collection('cards').get(),
    adminDb.collection('scans').get(),
  ]);

  // Per-user card stats (skip in-stock cards without owner)
  const cardsByUser: Record<string, {
    total: number; active: number; cardTypes: Set<string>;
  }> = {};
  cardsSnap.docs.forEach(d => {
    const c = d.data() as CardDoc;
    if (!c.userId) return;
    if (!cardsByUser[c.userId]) cardsByUser[c.userId] = { total: 0, active: 0, cardTypes: new Set() };
    cardsByUser[c.userId].total++;
    if (c.status === 'active') cardsByUser[c.userId].active++;
    if (c.cardType) cardsByUser[c.userId].cardTypes.add(c.cardType);
  });

  // Last scan date per user
  const lastScanByUser: Record<string, string> = {};
  scansSnap.docs.forEach(d => {
    const s = d.data() as { userId?: string; scannedAt?: string };
    if (!s.userId || !s.scannedAt) return;
    if (!lastScanByUser[s.userId] || s.scannedAt > lastScanByUser[s.userId]) {
      lastScanByUser[s.userId] = s.scannedAt;
    }
  });

  const clients: AdminClient[] = usersSnap.docs
    .map(d => {
      const u = d.data() as UserDoc;
      const stats = cardsByUser[d.id] ?? { total: 0, active: 0, cardTypes: new Set() };
      return {
        uid:               d.id,
        displayName:       u.displayName ?? '',
        email:             u.email ?? '',
        plan:              u.plan ?? 'essentiel',
        cardType:          u.cardType ?? null,
        cardTypesOwned:    Array.from(stats.cardTypes),
        subscriptionUntil: u.subscriptionUntil ?? null,
        createdAt:         u.createdAt ?? new Date(0).toISOString(),
        cardCount:         stats.total,
        activeCards:       stats.active,
        lastScanAt:        lastScanByUser[d.id] ?? null,
      };
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <ClientsAdminClient initialClients={clients} />;
}
