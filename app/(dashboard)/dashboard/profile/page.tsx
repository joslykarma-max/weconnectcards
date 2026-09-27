import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { getOwnedProfileId } from '@/lib/profiles';
import ProfileEditor from './ProfileEditor';
import type { ProfileDoc, LinkDoc, CardDoc } from '@/lib/types';

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ profile?: string }> }) {
  const user = await requireAuth();
  const { profile: requested } = await searchParams;

  const profileId = await getOwnedProfileId(user.uid, requested);
  if (!profileId) redirect('/dashboard/profile');

  const [profileSnap, linksSnap, cardsSnap, cardProfilesSnap] = await Promise.all([
    adminDb.collection('profiles').doc(profileId).get(),
    adminDb.collection('profiles').doc(profileId).collection('links').orderBy('order', 'asc').get(),
    adminDb.collection('cards').where('userId', '==', user.uid).get(),
    adminDb.collection('profiles').where('uid', '==', user.uid).get(),
  ]);

  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const links = linksSnap.docs.map((d) => ({ ...(d.data() as LinkDoc), id: d.id }));

  const profile = profileData ? {
    id:          profileId,
    username:    profileData.username,
    displayName: profileData.displayName,
    title:       profileData.title       ?? null,
    company:     profileData.company     ?? null,
    bio:         profileData.bio         ?? null,
    avatar:      profileData.avatar      ?? null,
    theme:       profileData.theme,
    displayMode: profileData.displayMode ?? 'classic',
    hiddenFields: profileData.hiddenFields ?? [],
    isPublic:    profileData.isPublic,
    links,
  } : null;

  // Profiles switcher: main profile + one entry per card-specific profile
  const cards = cardsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as CardDoc) }));
  const cardLabel = (cardId?: string) => {
    const c = cards.find((x) => x.id === cardId);
    return c?.nfcId ? `Carte ${c.nfcId}` : 'Carte en attente';
  };
  const mainSnap = cardProfilesSnap.docs.find((d) => d.id === user.uid);
  const profiles = [
    { id: user.uid, label: 'Profil principal', username: (mainSnap?.data() as ProfileDoc | undefined)?.username ?? '' },
    ...cardProfilesSnap.docs
      .filter((d) => d.id !== user.uid)
      .map((d) => {
        const p = d.data() as ProfileDoc;
        return { id: d.id, label: cardLabel(p.cardId), username: p.username };
      }),
  ];

  return <ProfileEditor key={profileId} profile={profile} profileId={profileId} isMain={profileId === user.uid} profiles={profiles} />;
}
