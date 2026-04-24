import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import ModulesClient from './ModulesClient';
import type { ModuleDoc, UserDoc } from '@/lib/types';

const MODULES = [
  { type: 'loyalty',     name: 'Carte de fidélité',       emoji: '🎯', desc: 'Tampons digitaux et récompenses clients', pro: false },
  { type: 'menu',        name: 'Menu Restaurant',          emoji: '🍽️', desc: 'QR menu interactif multilingue', pro: false },
  { type: 'review',      name: 'Tap to Review',            emoji: '⭐', desc: 'Générez des avis Google en un tap', pro: false },
  { type: 'event',       name: 'Pass Événement',           emoji: '🎟️', desc: 'Billetterie NFC et check-in', pro: true },
  { type: 'access',      name: 'Clé d\'accès',             emoji: '🔑', desc: 'Contrôle d\'accès par zones', pro: true },
  { type: 'medical',     name: 'Carte Médicale',           emoji: '🩺', desc: 'Urgences sécurisées par PIN', pro: true },
  { type: 'certificate', name: 'Certificat Authenticité',  emoji: '🦋', desc: 'Vérification produit', pro: true },
  { type: 'member',      name: 'Carte Membre',             emoji: '🎫', desc: 'Adhésions et niveaux', pro: true },
  { type: 'portfolio',   name: 'Portfolio Artiste',        emoji: '🎵', desc: 'Galerie média et streaming', pro: false },
] as const;

export default async function ModulesPage() {
  const user = await requireAuth();

  const [modulesSnap, userSnap] = await Promise.all([
    adminDb.collection('modules').where('profileId', '==', user.uid).get(),
    adminDb.collection('users').doc(user.uid).get(),
  ]);

  const activeModules = modulesSnap.docs.map((d) => {
    const data = d.data() as ModuleDoc;
    return { id: d.id, type: data.type, isActive: data.isActive };
  });

  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;
  const isPro    = userData?.plan === 'pro' || userData?.plan === 'equipe';

  return (
    <ModulesClient
      modules={MODULES}
      activeModules={activeModules}
      profileId={user.uid}
      isPro={isPro}
    />
  );
}
