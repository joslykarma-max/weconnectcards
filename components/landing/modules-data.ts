// The nine business modules, shared by the hero disclosure and the Modules section.
export interface LandingModule { slug: string; emoji: string; name: string; desc: string; accent: string }

export const MODULES: LandingModule[] = [
  { slug: 'loyalty',     emoji: '🎯', name: 'Carte de fidélité',       desc: 'Tampons digitaux et récompenses clients', accent: '#F59E0B' },
  { slug: 'menu',        emoji: '🍽️', name: 'Menu Restaurant',         desc: 'QR menu interactif et commande directe',  accent: '#EF4444' },
  { slug: 'review',      emoji: '⭐', name: 'Tap to Review',           desc: 'Avis Google en un tap',                   accent: '#FBBF24' },
  { slug: 'event',       emoji: '🎟️', name: 'Pass Événement',          desc: 'Billetterie NFC et check-in instantané',  accent: '#8B5CF6' },
  { slug: 'access',      emoji: '🔑', name: 'Clé d\'accès',            desc: 'Contrôle d\'accès par zones et horaires', accent: '#06B6D4' },
  { slug: 'medical',     emoji: '🩺', name: 'Carte Médicale',          desc: 'Urgences sécurisées, infos vitales',      accent: '#22C55E' },
  { slug: 'certificate', emoji: '🦋', name: 'Certificat Authenticité', desc: 'Vérification produit et propriété',       accent: '#EC4899' },
  { slug: 'member',      emoji: '🎫', name: 'Carte Membre',            desc: 'Adhésions, niveaux et présences',         accent: '#6366F1' },
  { slug: 'portfolio',   emoji: '🎵', name: 'Portfolio Artiste',       desc: 'Galerie média et liens streaming',        accent: '#F97316' },
];
