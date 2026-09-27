import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import CardsClient from './CardsClient';
import type { CardDoc, ProfileDoc, UserDoc } from '@/lib/types';

export default async function CardPage() {
  const user = await requireAuth();

  const [cardsSnap, profileSnap, userSnap, ownProfilesSnap] = await Promise.all([
    adminDb.collection('cards').where('userId', '==', user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).get(),
    adminDb.collection('users').doc(user.uid).get(),
    adminDb.collection('profiles').where('uid', '==', user.uid).get(),
  ]);

  const usernameByProfile = new Map(
    ownProfilesSnap.docs.map((d) => [d.id, (d.data() as ProfileDoc).username]),
  );
  // Older main profiles may lack the uid field
  if (profileSnap.exists) usernameByProfile.set(user.uid, (profileSnap.data() as ProfileDoc).username);

  const cards = cardsSnap.docs
    .map((d) => {
      const data = d.data() as CardDoc;
      return {
        id:             d.id,
        edition:        data.edition,
        status:         data.status,
        nfcId:          data.nfcId          ?? null,
        orderedAt:      data.orderedAt      ?? '',
        activatedAt:    data.activatedAt    ?? null,
        delivery:       data.delivery       ?? null,
        selectedModule: data.selectedModule ?? null,
        profileId:      data.profileId      ?? null,
        profileUsername: data.profileId ? (usernameByProfile.get(data.profileId) ?? null) : null,
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

  const userDoc   = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const userPlan  = userDoc?.plan ?? 'essentiel';

  return <CardsClient cards={cards} profile={profile} userPlan={userPlan} />;
}
