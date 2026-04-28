import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import ModulePublicClient from './ModulePublicClient';
import type { ModuleDoc } from '@/lib/types';

interface Props {
  params: Promise<{ username: string; type: string }>;
}

const MODULE_TITLES: Record<string, string> = {
  loyalty:     'Carte de fidélité',
  menu:        'Menu',
  review:      'Avis',
  portfolio:   'Portfolio',
  event:       'Événement',
  certificate: "Certificat d'authenticité",
  member:      'Carte Membre',
  access:      "Clé d'accès",
  medical:     'Carte Médicale',
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, type } = await params;
  return {
    title: `${MODULE_TITLES[type] ?? 'Module'} — ${username} · We Connect`,
  };
}

export default async function ModulePublicPage({ params }: Props) {
  const { username, type } = await params;

  const usernameSnap = await adminDb.collection('usernames').doc(username).get();
  if (!usernameSnap.exists) notFound();

  const { uid } = usernameSnap.data() as { uid: string };

  const moduleSnap = await adminDb.collection('modules').doc(`${uid}_${type}`).get();
  if (!moduleSnap.exists) notFound();

  const moduleData = moduleSnap.data() as ModuleDoc;
  if (!moduleData.isActive) notFound();

  return (
    <ModulePublicClient
      type={type}
      username={username}
      profileId={uid}
      config={moduleData.config ?? {}}
    />
  );
}
