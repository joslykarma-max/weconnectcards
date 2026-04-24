import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import ProfileEditor from './ProfileEditor';
import type { ProfileDoc, LinkDoc } from '@/lib/types';

export default async function ProfilePage() {
  const user = await requireAuth();

  const [profileSnap, linksSnap] = await Promise.all([
    adminDb.collection('profiles').doc(user.uid).get(),
    adminDb.collection('profiles').doc(user.uid).collection('links').orderBy('order', 'asc').get(),
  ]);

  const profileData = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const links = linksSnap.docs.map((d) => ({ ...(d.data() as LinkDoc), id: d.id }));

  const profile = profileData ? {
    id:          user.uid,
    username:    profileData.username,
    displayName: profileData.displayName,
    title:       profileData.title   ?? null,
    company:     profileData.company ?? null,
    bio:         profileData.bio     ?? null,
    avatar:      profileData.avatar  ?? null,
    theme:       profileData.theme,
    links,
  } : null;

  return <ProfileEditor profile={profile} />;
}
