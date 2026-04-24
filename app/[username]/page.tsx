import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import ProfilePublic from '@/components/profile/ProfilePublic';
import { getDeviceFromUA } from '@/lib/utils';
import { headers } from 'next/headers';
import type { ProfileDoc, LinkDoc } from '@/lib/types';

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

  const [profileSnap, linksSnap] = await Promise.all([
    adminDb.collection('profiles').doc(uid).get(),
    adminDb.collection('profiles').doc(uid).collection('links')
      .where('isActive', '==', true)
      .orderBy('order', 'asc')
      .get(),
  ]);

  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  if (!profileData?.isPublic) notFound();

  const links = linksSnap.docs.map((d) => ({ ...(d.data() as LinkDoc), id: d.id }));

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
    user:        { name: profileData.displayName },
  };

  return <ProfilePublic profile={profile} />;
}
