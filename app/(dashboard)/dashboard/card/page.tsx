import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import CardPreview from '@/components/nfc-card/CardPreview';
import type { CardDoc, ProfileDoc } from '@/lib/types';

export default async function CardPage() {
  const user = await requireAuth();

  const [cardsSnap, profileSnap] = await Promise.all([
    adminDb.collection('cards').where('userId', '==', user.uid).limit(1).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
  ]);

  const cardRaw     = cardsSnap.empty ? null : cardsSnap.docs[0].data() as CardDoc;
  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;

  const card = cardRaw ? {
    id:          cardsSnap.docs[0].id,
    edition:     cardRaw.edition,
    status:      cardRaw.status,
    nfcId:       cardRaw.nfcId        ?? null,
    activatedAt: cardRaw.activatedAt  ? new Date(cardRaw.activatedAt) : null,
  } : null;

  const profile = profileData ? {
    username:    profileData.username,
    displayName: profileData.displayName,
    title:       profileData.title ?? null,
    theme:       profileData.theme,
  } : null;

  return <CardPreview card={card} profile={profile} />;
}
