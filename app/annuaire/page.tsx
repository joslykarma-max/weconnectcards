import { adminDb } from '@/lib/firebase-admin';
import type { DirectoryProfile } from '@/app/api/directory/route';
import type { ProfileDoc } from '@/lib/types';
import DirectoryClient from './DirectoryClient';

export const revalidate = 60;

export default async function AnnuairePage() {
  const snap = await adminDb.collection('profiles')
    .where('isPublic',    '==', true)
    .where('inDirectory', '==', true)
    .get();

  const profiles: DirectoryProfile[] = snap.docs.map((d) => {
    const data = d.data() as ProfileDoc;
    return {
      id:          d.id,
      username:    data.username,
      displayName: data.displayName,
      title:       data.title   ?? null,
      company:     data.company ?? null,
      avatar:      data.avatar  ?? null,
      sector:      data.sector  ?? null,
      bio:         data.bio     ?? null,
    };
  });

  return <DirectoryClient initial={profiles} />;
}
