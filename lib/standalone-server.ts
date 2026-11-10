import type { DocumentSnapshot } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import { isDisplayMode, isStandaloneEdition, linkValueFromUrl, standaloneUid, type StandaloneCardView } from '@/lib/standalone';
import type { CardDoc, LinkDoc, ProfileDoc } from '@/lib/types';

async function toView(doc: DocumentSnapshot): Promise<StandaloneCardView> {
  const card       = doc.data() as CardDoc;
  const profileRef = card.profileId ? adminDb.collection('profiles').doc(card.profileId) : null;

  const [profileSnap, linksSnap, viewsAgg] = await Promise.all([
    profileRef?.get(),
    profileRef?.collection('links').orderBy('order').get(),
    adminDb.collection('scans').where('userId', '==', standaloneUid(doc.id)).count().get(),
  ]);

  const profile = profileSnap?.exists ? (profileSnap.data() as ProfileDoc) : null;

  return {
    id:          doc.id,
    nfcId:       card.nfcId ?? '',
    label:       card.label ?? null,
    edition:     isStandaloneEdition(card.edition) ? card.edition : 'midnight',
    active:      card.status === 'active',
    redirectUrl: card.redirectUrl ?? null,
    createdAt:   card.createdAt ?? card.activatedAt ?? null,
    views:       viewsAgg.data().count,
    profile: profile && profileSnap ? {
      id:          profileSnap.id,
      username:    profile.username,
      displayName: profile.displayName,
      title:       profile.title   ?? '',
      company:     profile.company ?? '',
      bio:         profile.bio     ?? '',
      tagline:     profile.tagline ?? '',
      avatar:      profile.avatar  ?? '',
      displayMode: isDisplayMode(profile.displayMode) ? profile.displayMode : 'classic',
      links: (linksSnap?.docs ?? []).map((d) => {
        const l = d.data() as LinkDoc;
        return { type: l.type, label: l.label, value: linkValueFromUrl(l.type, l.url) };
      }),
    } : null,
  };
}

export async function listStandaloneCards(): Promise<StandaloneCardView[]> {
  const snap  = await adminDb.collection('cards').where('standalone', '==', true).get();
  const views = await Promise.all(snap.docs.map(toView));
  return views.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
}

export async function getStandaloneCard(cardId: string): Promise<StandaloneCardView | null> {
  const doc = await adminDb.collection('cards').doc(cardId).get();
  if (!doc.exists || !(doc.data() as CardDoc).standalone) return null;
  return toView(doc);
}
