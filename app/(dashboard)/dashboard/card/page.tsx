import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import CardsClient from './CardsClient';
import type { CardDoc, ProfileDoc } from '@/lib/types';

export default async function CardPage() {
  const user = await requireAuth();

  const [cardsSnap, profileSnap] = await Promise.all([
    adminDb.collection('cards').where('userId', '==', user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const cards = cardsSnap.docs
    .map((d) => {
      const data = d.data() as CardDoc;
      return {
        id:          d.id,
        edition:     data.edition,
        status:      data.status,
        nfcId:       data.nfcId       ?? null,
        orderedAt:   data.orderedAt,
        activatedAt: data.activatedAt ?? null,
      };
    })
    .sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));

  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const profile = profileData ? {
    username:    profileData.username,
    displayName: profileData.displayName,
    title:       profileData.title ?? null,
    theme:       profileData.theme,
  } : null;

  return <CardsClient cards={cards} profile={profile} />;
}
