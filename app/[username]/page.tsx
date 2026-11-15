import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import { resolveUsername } from '@/lib/profiles';
import ProfilePublic from '@/components/profile/ProfilePublic';
import { getDeviceFromUA } from '@/lib/utils';
import { isBotUA, scanSource } from '@/lib/scans';
import { getSession } from '@/lib/session';
import { headers } from 'next/headers';
import type { ProfileDoc, LinkDoc, ModuleDoc } from '@/lib/types';
import { isDisplayMode, resolveDisplayMode } from '@/lib/display-mode';

const MODULE_META: Record<string, { emoji: string; name: string }> = {
  loyalty:     { emoji: '🎯', name: 'Carte de fidélité'       },
  menu:        { emoji: '🍽️', name: 'Menu'                    },
  review:      { emoji: '⭐', name: 'Laisser un avis'         },
  portfolio:   { emoji: '🎵', name: 'Portfolio'               },
  event:       { emoji: '🎟️', name: 'Événement'              },
  certificate: { emoji: '🦋', name: "Certificat d'authenticité" },
  member:      { emoji: '🎫', name: 'Carte Membre'            },
  access:      { emoji: '🔑', name: "Clé d'accès"             },
  medical:     { emoji: '🩺', name: 'Carte Médicale'          },
};

interface Props {
  params:       Promise<{ username: string }>;
  searchParams: Promise<{ mode?: string; src?: string; preview?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const resolved = await resolveUsername(username);
  if (!resolved) return { title: 'Profil introuvable — We Connect' };

  const profileSnap = await adminDb.collection('profiles').doc(resolved.profileId).get();
  if (!profileSnap.exists) return { title: 'Profil introuvable — We Connect' };

  const profile = profileSnap.data() as ProfileDoc;
  const role    = [profile.title, profile.company].filter(Boolean).join(' · ');
  const description = (profile.tagline || profile.bio || role || `Carte de visite digitale de ${profile.displayName} sur We Connect.`).slice(0, 200);

  // The share picture comes from ./opengraph-image.tsx (name, role, edition colours)
  return {
    title: `${profile.displayName} — We Connect`,
    description,
    alternates: { canonical: `/${profile.username}` },
    openGraph: {
      type: 'profile', siteName: 'We Connect', locale: 'fr_FR',
      url: `/${profile.username}`,
      title: role ? `${profile.displayName} — ${role}` : profile.displayName,
      description,
    },
    twitter: { card: 'summary_large_image', title: profile.displayName, description },
  };
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const { username } = await params;
  const { mode, src, preview } = await searchParams;
  const previewMode = isDisplayMode(mode) ? mode : null;

  const resolved = await resolveUsername(username);
  if (!resolved) notFound();

  const { uid, profileId } = resolved;

  const [profileSnap, userSnap, linksSnap, modulesSnap] = await Promise.all([
    adminDb.collection('profiles').doc(profileId).get(),
    adminDb.collection('users').doc(uid).get(),
    adminDb.collection('profiles').doc(profileId).collection('links').get(),
    adminDb.collection('modules').where('profileId', '==', uid).where('isActive', '==', true).get(),
  ]);

  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  if (!profileData?.isPublic) notFound();

  // Check subscription — expired users get a limited view (links only, no modules)
  const userData           = userSnap.exists ? (userSnap.data() as { subscriptionUntil?: string; plan?: string }) : null;
  const subscriptionUntil  = userData?.subscriptionUntil;
  const subscriptionActive = !subscriptionUntil || new Date(subscriptionUntil) > new Date();

  const links = linksSnap.docs
    .map((d) => ({ ...(d.data() as LinkDoc), id: d.id }))
    .filter((l) => l.isActive)
    .sort((a, b) => a.order - b.order);

  // Modules hidden when subscription expired
  const modules = subscriptionActive
    ? modulesSnap.docs
        .map((d) => (d.data() as ModuleDoc).type)
        .filter((t) => MODULE_META[t])
        .map((t) => ({ type: t, ...MODULE_META[t] }))
    : [];

  // Count the visit (fire-and-forget) — not the dashboard preview, bots / link previews, or the owner
  if (!previewMode && preview !== '1') {
    const ua = (await headers()).get('user-agent') ?? '';
    if (!isBotUA(ua) && (await getSession())?.uid !== uid) {
      adminDb.collection('scans').add({
        userId:    uid,
        ...(profileId !== uid ? { profileId } : {}),
        device:    getDeviceFromUA(ua),
        source:    scanSource(src),
        userAgent: ua.slice(0, 512),
        scannedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  const profile = {
    id:              uid,
    username:        profileData.username,
    displayName:     profileData.displayName,
    title:           profileData.title           ?? null,
    company:         profileData.company         ?? null,
    bio:             profileData.bio             ?? null,
    tagline:         profileData.tagline         ?? null,
    avatar:          profileData.avatar          ?? null,
    backgroundImage: profileData.backgroundImage ?? null,
    theme:           profileData.theme,
    displayMode:     previewMode ?? resolveDisplayMode(profileData.displayMode),
    hiddenFields:    profileData.hiddenFields ?? [],
    links,
    modules,
    user:            { name: profileData.displayName },
  };

  return <ProfilePublic profile={profile} />;
}
