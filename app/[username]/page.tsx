import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import ProfilePublic from '@/components/profile/ProfilePublic';
import { getDeviceFromUA } from '@/lib/utils';
import { headers } from 'next/headers';
import type { ProfileDoc, LinkDoc, ModuleDoc } from '@/lib/types';

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
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;

  const usernameSnap = await adminDb.collection('usernames').doc(username).get();
  if (!usernameSnap.exists) return { title: 'Profil introuvable — We Connect' };

  const { uid } = usernameSnap.data() as { uid: string };
  const profileSnap = await adminDb.collection('profiles').doc(uid).get();
  if (!profileSnap.exists) return { title: 'Profil introuvable — We Connect' };

  const profile = profileSnap.data() as ProfileDoc;

  return {
    title:       `${profile.displayName} — We Connect`,
    description: profile.bio ?? `${profile.title ?? ''} ${profile.company ? `@ ${profile.company}` : ''}`.trim(),
    openGraph: {
      title:       profile.displayName,
      description: profile.bio ?? undefined,
      images:      profile.avatar ? [profile.avatar] : undefined,
    },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  const usernameSnap = await adminDb.collection('usernames').doc(username).get();
  if (!usernameSnap.exists) notFound();

  const { uid } = usernameSnap.data() as { uid: string };

  const [profileSnap, userSnap, linksSnap, modulesSnap] = await Promise.all([
    adminDb.collection('profiles').doc(uid).get(),
    adminDb.collection('users').doc(uid).get(),
    adminDb.collection('profiles').doc(uid).collection('links').get(),
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

  // Log the visit (fire-and-forget)
  const headersList = await headers();
  const ua     = headersList.get('user-agent') ?? '';
  const device = getDeviceFromUA(ua);

  adminDb.collection('scans').add({
    userId:    uid,
    device,
    userAgent: ua.slice(0, 512),
    scannedAt: new Date().toISOString(),
  }).catch(() => {});

  const profile = {
    id:          uid,
    username:    profileData.username,
    displayName: profileData.displayName,
    title:       profileData.title   ?? null,
    company:     profileData.company ?? null,
    bio:         profileData.bio     ?? null,
    avatar:      profileData.avatar  ?? null,
    theme:       profileData.theme,
    links,
    modules,
    user:        { name: profileData.displayName },
  };

  return <ProfilePublic profile={profile} />;
}
