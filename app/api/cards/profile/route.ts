import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc, ProfileDoc, LinkDoc } from '@/lib/types';

/**
 * Returns the profile a card points to, creating a dedicated one if needed.
 * The account's first card keeps the main profile (profiles/{uid});
 * every other card gets its own profile, seeded from the main one.
 */
export async function POST(req: NextRequest) {
  const user       = await requireAuth();
  const { cardId } = await req.json() as { cardId: string };
  if (!cardId) return NextResponse.json({ error: 'Carte manquante.' }, { status: 400 });

  const cardRef  = adminDb.collection('cards').doc(cardId);
  const cardSnap = await cardRef.get();
  const card     = cardSnap.exists ? (cardSnap.data() as CardDoc) : null;
  if (!card || card.userId !== user.uid) {
    return NextResponse.json({ error: 'Carte introuvable.' }, { status: 404 });
  }

  if (card.profileId) return NextResponse.json({ profileId: card.profileId, isMain: card.profileId === user.uid });

  // First card of the account → main profile
  const cardsSnap = await adminDb.collection('cards').where('userId', '==', user.uid).get();
  const usesMain  = cardsSnap.docs.some((d) => (d.data() as CardDoc).profileId === user.uid);
  const oldest    = [...cardsSnap.docs].sort((a, b) =>
    ((a.data() as CardDoc).orderedAt ?? (a.data() as CardDoc).activatedAt ?? '')
      .localeCompare((b.data() as CardDoc).orderedAt ?? (b.data() as CardDoc).activatedAt ?? ''),
  )[0];

  if (!usesMain && oldest?.id === cardId) {
    await cardRef.update({ profileId: user.uid });
    return NextResponse.json({ profileId: user.uid, isMain: true });
  }

  // Dedicated profile, seeded from the main one
  const [mainSnap, mainLinksSnap] = await Promise.all([
    adminDb.collection('profiles').doc(user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).collection('links').get(),
  ]);
  const main = mainSnap.exists ? (mainSnap.data() as ProfileDoc) : null;

  const base     = main?.username || 'carte';
  let   username = '';
  for (let i = 2; i < 100; i++) {
    const candidate = `${base}-${i}`;
    if (!(await adminDb.collection('usernames').doc(candidate).get()).exists) { username = candidate; break; }
  }
  if (!username) username = `${base}-${cardId.slice(0, 6).toLowerCase()}`;

  const profileRef = adminDb.collection('profiles').doc();
  const now        = new Date().toISOString();
  const profile: ProfileDoc = {
    uid:          user.uid,
    cardId,
    username,
    displayName:  main?.displayName ?? '',
    theme:        main?.theme ?? 'midnight',
    displayMode:  main?.displayMode ?? 'classic',
    hiddenFields: main?.hiddenFields ?? [],
    isPublic:     true,
    updatedAt:    now,
    ...(main?.title   ? { title:   main.title }   : {}),
    ...(main?.company ? { company: main.company } : {}),
    ...(main?.bio     ? { bio:     main.bio }     : {}),
    ...(main?.avatar  ? { avatar:  main.avatar }  : {}),
  };

  const batch = adminDb.batch();
  batch.set(profileRef, profile);
  batch.set(adminDb.collection('usernames').doc(username), { uid: user.uid, profileId: profileRef.id });
  mainLinksSnap.docs.forEach((d) => {
    const linkRef = profileRef.collection('links').doc();
    batch.set(linkRef, { ...(d.data() as LinkDoc), id: linkRef.id });
  });
  batch.update(cardRef, { profileId: profileRef.id });
  await batch.commit();

  return NextResponse.json({ profileId: profileRef.id, isMain: false, created: true });
}
