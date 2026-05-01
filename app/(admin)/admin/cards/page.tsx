import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc, CardDoc, ProfileDoc } from '@/lib/types';
import CardsAdminClient, { type AdminCard } from './CardsAdminClient';

export default async function AdminCardsPage() {
  const cardsSnap = await adminDb.collection('cards').limit(500).get();
  const cards = cardsSnap.docs
    .map(d => ({ id: d.id, ...(d.data() as CardDoc) }))
    .filter(c => !!c.userId);

  // Fetch users + profiles in parallel
  const userIds  = [...new Set(cards.map(c => c.userId!))];
  const [userDocs, profileDocs] = await Promise.all([
    Promise.all(userIds.map(uid => adminDb.collection('users').doc(uid).get())),
    Promise.all(userIds.map(uid => adminDb.collection('profiles').doc(uid).get())),
  ]);
  const userMap:    Record<string, UserDoc>    = {};
  const profileMap: Record<string, ProfileDoc> = {};
  userDocs.forEach(d    => { if (d.exists) userMap[d.id]    = d.data() as UserDoc; });
  profileDocs.forEach(d => { if (d.exists) profileMap[d.id] = d.data() as ProfileDoc; });

  const enriched: AdminCard[] = cards
    .map(c => ({
      id:            c.id,
      userId:        c.userId!,
      edition:       c.edition ?? 'midnight',
      cardType:      c.cardType ?? null,
      metallic:      c.metallic ?? null,
      pvcColor:      c.pvcColor ?? null,
      customization: c.customization ?? null,
      nfcId:         c.nfcId ?? null,
      status:        c.status,
      orderedAt:     c.orderedAt ?? new Date(0).toISOString(),
      activatedAt:   c.activatedAt ?? null,
      delivery:      c.delivery ?? null,
      user: userMap[c.userId!]
        ? {
            displayName: userMap[c.userId!].displayName,
            email:       userMap[c.userId!].email,
            plan:        userMap[c.userId!].plan,
            username:    profileMap[c.userId!]?.username,
          }
        : null,
    }))
    .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());

  return <CardsAdminClient initialCards={enriched} />;
}
