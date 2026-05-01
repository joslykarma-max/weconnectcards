import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc, CardDoc } from '@/lib/types';
import CardsAdminClient, { type AdminCard } from './CardsAdminClient';

export default async function AdminCardsPage() {
  const cardsSnap = await adminDb.collection('cards').limit(500).get();
  const cards = cardsSnap.docs
    .map(d => ({ id: d.id, ...(d.data() as CardDoc) }))
    .filter(c => !!c.userId);

  // Fetch all referenced users in parallel
  const userIds  = [...new Set(cards.map(c => c.userId!))];
  const userDocs = await Promise.all(userIds.map(uid => adminDb.collection('users').doc(uid).get()));
  const userMap: Record<string, UserDoc> = {};
  userDocs.forEach(d => { if (d.exists) userMap[d.id] = d.data() as UserDoc; });

  const enriched: AdminCard[] = cards
    .map(c => ({
      id:          c.id,
      userId:      c.userId!,
      edition:     c.edition ?? 'midnight',
      nfcId:       c.nfcId ?? null,
      status:      c.status,
      orderedAt:   c.orderedAt ?? new Date(0).toISOString(),
      activatedAt: c.activatedAt ?? null,
      delivery:    c.delivery ?? null,
      user: userMap[c.userId!]
        ? { displayName: userMap[c.userId!].displayName, email: userMap[c.userId!].email, plan: userMap[c.userId!].plan }
        : null,
    }))
    .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

  return <CardsAdminClient initialCards={enriched} />;
}
