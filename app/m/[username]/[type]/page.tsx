import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { adminDb } from '@/lib/firebase-admin';
import ModulePublicClient from './ModulePublicClient';
import type { ModuleDoc, AccessCardDoc } from '@/lib/types';

interface Props {
  params:      Promise<{ username: string; type: string }>;
  searchParams: Promise<{ card?: string }>;
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

export default async function ModulePublicPage({ params, searchParams }: Props) {
  const { username, type } = await params;
  const { card: cardId }   = await searchParams;

  const usernameSnap = await adminDb.collection('usernames').doc(username).get();
  if (!usernameSnap.exists) notFound();

  const { uid } = usernameSnap.data() as { uid: string };

  const moduleSnap = await adminDb.collection('modules').doc(`${uid}_${type}`).get();
  if (!moduleSnap.exists) notFound();

  const moduleData = moduleSnap.data() as ModuleDoc;
  if (!moduleData.isActive) notFound();

  // For access module, load the specific card if ?card= is provided
  let holderCard: AccessCardDoc | null = null;
  if (type === 'access' && cardId) {
    const cardSnap = await adminDb.collection('accessCards').doc(`${uid}_${cardId}`).get();
    if (cardSnap.exists) {
      holderCard = cardSnap.data() as AccessCardDoc;
    }
  }

  return (
    <ModulePublicClient
      type={type}
      username={username}
      profileId={uid}
      config={moduleData.config ?? {}}
      holderCard={holderCard}
    />
  );
}
