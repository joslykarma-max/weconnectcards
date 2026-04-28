import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import LogoHorizontal from '@/components/logo/LogoHorizontal';

interface Props { params: Promise<{ type: string }> }

const MODULES: Record<string, {
  emoji:    string;
  name:     string;
  tagline:  string;
  desc:     string;
  features: { icon: string; title: string; body: string }[];
  useCases: { icon: string; label: string }[];
  steps:    string[];
  color:    string;
  bg:       string;
  border:   string;
}> = {
  loyalty: {
    emoji:   '🎯',
    name:    'Carte de fidélité',
    tagline: 'Fidélisez vos clients en un tap',
    desc:    'Remplacez les cartes papier par une expérience digitale sans friction. Vos clients scannent leur carte NFC à chaque visite, collectent des tampons et débloquent leur récompense automatiquement.',
    color:   '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',
    features: [
      { icon: '🔢', title: 'Objectif personnalisable',   body: 'Définissez le nombre de tampons nécessaires (5, 10, 20...) selon votre modèle commercial.' },
      { icon: '🎁', title: 'Récompense sur-mesure',      body: 'Café offert, -20%, produit gratuit — vous décidez de la récompense à chaque palier.' },
      { icon: '⏱️', title: 'Durée de validité',          body: 'Configurez une date d\'expiration pour créer de l\'urgence et booster la fréquence de visite.' },
      { icon: '⭐', title: 'Emoji de tampon',             body: 'Personnalisez l\'icône de tampon pour coller à votre identité visuelle.' },
    ],
    useCases: [
      { icon: '☕', label: 'Cafés & boulangeries' },
      { icon: '💇', label: 'Salons de coiffure' },
      { icon: '🍽️', label: 'Restaurants & maquis' },
      { icon: '🛍️', label: 'Boutiques & commerces' },
    ],
    steps: [
      'Activez le module dans votre dashboard',
      'Définissez l\'objectif, la récompense et l\'emoji',
      'Vos clients scannent votre carte NFC à chaque visite',
    ],
  },

  menu: {
    emoji:   '🍽️',
    name:    'Menu Restaurant',
    tagline: 'Votre menu toujours à jour, en un scan',
    desc:    'Fini les menus plastifiés ou les ardoises à réécrire. Partagez votre menu PDF ou lien en ligne instantanément, et permettez à vos clients de commander directement sur WhatsApp.',
    color:   '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    features: [
      { icon: '📄', title: 'Menu PDF ou lien externe',   body: 'Lien vers votre PDF, Notion, Google Doc ou site de commande en ligne — tout est accepté.' },
      { icon: '💬', title: 'Commande WhatsApp directe',  body: 'Un bouton WhatsApp préconfiguré pour recevoir les commandes sans effort.' },
      { icon: '🕐', title: 'Horaires d\'ouverture',      body: 'Affichez vos heures d\'ouverture directement sur la page pour éviter les appels inutiles.' },
      { icon: '📍', title: 'Adresse intégrée',           body: 'Votre adresse visible en permanence, cliquable pour ouvrir Google Maps.' },
    ],
    useCases: [
      { icon: '🍛', label: 'Restaurants' },
      { icon: '🥘', label: 'Maquis & gargottes' },
      { icon: '🍕', label: 'Fast-foods' },
      { icon: '🍰', label: 'Pâtisseries & cafés' },
    ],
    steps: [
      'Activez le module dans votre dashboard',
      'Renseignez l\'URL de votre menu et votre numéro WhatsApp',
      'Vos clients scannent et accèdent au menu instantanément',
    ],
  },

  review: {
    emoji:   '⭐',
    name:    'Tap to Review',
    tagline: 'Multipliez vos avis Google en un tap',
    desc:    'Chaque client satisfait est une opportunité d\'avis. Redirigez-les directement vers votre page Google en un scan NFC, sans étapes intermédiaires.',
    color:   '#FBBF24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)',
    features: [
      { icon: '🔗', title: 'Lien Google direct',         body: 'Redirigez instantanément vers votre fiche Google Business sans que le client ait à chercher.' },
      { icon: '💬', title: 'Message personnalisé',       body: 'Un texte d\'encouragement pour mettre vos clients dans les meilleures dispositions.' },
      { icon: '⭐', title: 'Note cible configurable',    body: 'Affichez le nombre d\'étoiles que vous visez pour contextualiser la demande.' },
      { icon: '📈', title: 'Moins de friction = plus d\'avis', body: 'Le NFC supprime toutes les étapes — scan et c\'est parti.' },
    ],
    useCases: [
      { icon: '🏪', label: 'Tous commerces locaux' },
      { icon: '🏨', label: 'Hôtels & guesthouses' },
      { icon: '💆', label: 'Spas & centres bien-être' },
      { icon: '🔧', label: 'Prestataires de services' },
    ],
    steps: [
      'Copiez l\'URL de votre fiche Google Business',
      'Collez-la dans la configuration du module',
      'Présentez votre carte NFC aux clients après leur visite',
    ],
  },

  portfolio: {
    emoji:   '🎵',
    name:    'Portfolio Artiste',
    tagline: 'Tout votre univers créatif en un scan',
    desc:    'Une page unique qui centralise tous vos liens : musique en streaming, galerie Instagram, chaîne YouTube, SoundCloud et contact booking. Idéal pour les artistes et créatifs.',
    color:   '#EC4899', bg: 'rgba(236,72,153,0.08)', border: 'rgba(236,72,153,0.2)',
    features: [
      { icon: '📸', title: 'Instagram',       body: 'Lien direct vers votre galerie ou votre profil.' },
      { icon: '🎵', title: 'Spotify',         body: 'Vers votre profil artiste ou votre dernier album.' },
      { icon: '▶️', title: 'YouTube',         body: 'Votre chaîne ou votre dernière vidéo.' },
      { icon: '☁️', title: 'SoundCloud',      body: 'Vos mixes et créations audio.' },
      { icon: '🌐', title: 'Site personnel',  body: 'Votre site vitrine ou EPK.' },
      { icon: '📩', title: 'Email booking',   body: 'Contact direct pour les organisateurs d\'événements.' },
    ],
    useCases: [
      { icon: '🎤', label: 'Chanteurs & rappeurs' },
      { icon: '🎧', label: 'DJs & producteurs' },
      { icon: '📸', label: 'Photographes' },
      { icon: '🎨', label: 'Artistes visuels' },
    ],
    steps: [
      'Activez le module et renseignez vos liens',
      'Distribuez votre carte NFC lors de vos événements',
      'Vos fans accèdent à tout votre univers en un scan',
    ],
  },

  event: {
    emoji:   '🎟️',
    name:    'Pass Événement',
    tagline: 'Votre événement dans la poche de vos invités',
    desc:    'Créez un pass digital pour votre événement : date, lieu, heure, prix, description. Vos invités ont toutes les informations en un scan NFC.',
    color:   '#8B5CF6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)',
    features: [
      { icon: '📅', title: 'Date & heure',         body: 'Informations affichées clairement avec formatage automatique en français.' },
      { icon: '📍', title: 'Lieu de l\'événement', body: 'Adresse ou nom de la salle pour que vos invités arrivent au bon endroit.' },
      { icon: '🎟️', title: 'Prix du billet',       body: 'Tarif affiché en FCFA directement sur la page.' },
      { icon: '📝', title: 'Description libre',    body: 'Décrivez le programme, les artistes, le dress code...' },
      { icon: '👥', title: 'Capacité',             body: 'Affichez le nombre de places pour créer de la rareté.' },
    ],
    useCases: [
      { icon: '🎶', label: 'Concerts & soirées' },
      { icon: '🎓', label: 'Conférences & formations' },
      { icon: '💒', label: 'Mariages & cérémonies' },
      { icon: '🏆', label: 'Compétitions & tournois' },
    ],
    steps: [
      'Renseignez les informations de votre événement',
      'Distribuez des cartes NFC à l\'entrée ou en amont',
      'Vos invités ont le programme complet en un tap',
    ],
  },

  certificate: {
    emoji:   '🦋',
    name:    'Certificat d\'authenticité',
    tagline: 'Prouvez l\'authenticité de vos produits',
    desc:    'Intégrez une puce NFC dans vos produits ou emballages. En un scan, vos clients vérifient l\'authenticité, consultent le numéro de série, l\'origine et la garantie.',
    color:   '#10B981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)',
    features: [
      { icon: '🔢', title: 'Numéro de série unique',    body: 'Chaque produit dispose de son propre numéro traçable.' },
      { icon: '🌍', title: 'Origine & fabrication',     body: 'Pays d\'origine, date de fabrication — la transparence totale.' },
      { icon: '🛡️', title: 'Garantie',                 body: 'Durée et conditions de garantie accessibles instantanément.' },
      { icon: '✅', title: 'Badge d\'authenticité',    body: 'Affichage visuel clair du statut d\'authenticité vérifié.' },
    ],
    useCases: [
      { icon: '💍', label: 'Joaillerie & bijoux' },
      { icon: '👔', label: 'Mode & maroquinerie' },
      { icon: '🎨', label: 'Œuvres d\'art' },
      { icon: '🍷', label: 'Produits premium' },
    ],
    steps: [
      'Configurez les informations du produit',
      'Intégrez la carte NFC dans l\'emballage ou le produit',
      'Vos clients vérifient l\'authenticité en un scan',
    ],
  },

  member: {
    emoji:   '🎫',
    name:    'Carte Membre',
    tagline: 'Des adhésions premium pour vos membres',
    desc:    'Offrez à vos membres une carte digitale avec leur niveau, leurs avantages et leur identifiant. Silver, Gold, Platinum ou VIP — chaque niveau a son propre design.',
    color:   '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)',
    features: [
      { icon: '🥈', title: 'Niveaux Silver / Gold / Platinum / VIP', body: 'Quatre niveaux avec des couleurs distinctives pour valoriser l\'appartenance.' },
      { icon: '✦', title: 'Liste d\'avantages',    body: 'Listez les bénéfices de chaque niveau directement sur la carte.' },
      { icon: '🆔', title: 'ID membre unique',     body: 'Numéro de membre personnalisé pour l\'identification.' },
      { icon: '📅', title: 'Date d\'expiration',   body: 'Gérez les renouvellements avec une date de validité affichée.' },
    ],
    useCases: [
      { icon: '🏋️', label: 'Clubs de sport & gyms' },
      { icon: '🎭', label: 'Associations culturelles' },
      { icon: '🏢', label: 'Espaces de coworking' },
      { icon: '🤝', label: 'Réseaux professionnels' },
    ],
    steps: [
      'Configurez le club, le niveau et les avantages',
      'Remettez la carte NFC à chaque nouveau membre',
      'Le membre présente sa carte à chaque visite',
    ],
  },

  access: {
    emoji:   '🔑',
    name:    'Clé d\'accès',
    tagline: 'Contrôle d\'accès simple et sécurisé',
    desc:    'Sécurisez l\'accès à une zone ou un service avec un code PIN. Définissez les horaires autorisés et les jours d\'accès. Idéal pour les espaces partagés.',
    color:   '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)',
    features: [
      { icon: '🔐', title: 'Code PIN sécurisé',          body: 'Accès protégé par un code que vous partagez uniquement avec les personnes autorisées.' },
      { icon: '🕐', title: 'Plages horaires',            body: 'Définissez les heures d\'accès autorisées (ex : 08h–20h).' },
      { icon: '📅', title: 'Jours autorisés',            body: 'Lundi à vendredi, week-end seulement — vous choisissez.' },
      { icon: '🗺️', title: 'Description de la zone',    body: 'Nom et description de l\'espace pour contextualiser l\'accès.' },
    ],
    useCases: [
      { icon: '💼', label: 'Coworking & bureaux' },
      { icon: '🏋️', label: 'Salles de sport' },
      { icon: '🔒', label: 'Espaces privés' },
      { icon: '🏫', label: 'Salles de formation' },
    ],
    steps: [
      'Configurez la zone, les horaires et le PIN',
      'Donnez le PIN aux personnes autorisées',
      'Ils scannent la carte et saisissent le code pour entrer',
    ],
  },

  medical: {
    emoji:   '🩺',
    name:    'Carte Médicale',
    tagline: 'Vos infos médicales toujours accessibles en urgence',
    desc:    'En cas d\'accident, les secouristes ont immédiatement accès à votre groupe sanguin, allergies et contact d\'urgence — sans code. Les informations sensibles restent protégées par PIN.',
    color:   '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)',
    features: [
      { icon: '🩸', title: 'Infos critiques toujours visibles', body: 'Groupe sanguin, allergies et contact d\'urgence accessibles sans code PIN pour les secouristes.' },
      { icon: '🔒', title: 'Dossier médical protégé',           body: 'Conditions chroniques, médicaments, médecin — protégés par un PIN optionnel.' },
      { icon: '📞', title: 'Contacts d\'urgence',               body: 'Jusqu\'à deux contacts d\'urgence avec appel direct en un tap.' },
      { icon: '📋', title: 'Informations complètes',            body: 'Vaccinations, assurance, hôpital de référence, don d\'organes, DNR...' },
    ],
    useCases: [
      { icon: '🏃', label: 'Sportifs & athlètes' },
      { icon: '✈️', label: 'Voyageurs fréquents' },
      { icon: '👴', label: 'Personnes âgées' },
      { icon: '🏥', label: 'Patients sous traitement' },
    ],
    steps: [
      'Renseignez vos infos médicales dans le dashboard',
      'Définissez un PIN si vous souhaitez protéger le dossier complet',
      'En cas d\'urgence, les secours scannent et accèdent aux infos vitales',
    ],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const mod = MODULES[type];
  if (!mod) return { title: 'Module introuvable — We Connect' };
  return {
    title: `${mod.name} — Modules We Connect`,
    description: mod.desc,
  };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { type } = await params;
  const mod = MODULES[type];
  if (!mod) notFound();

  return (
    <div style={{ minHeight: '100vh', background: '#08090C', color: '#F8F9FC' }}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 40px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: 'rgba(8,9,12,0.9)', backdropFilter: 'blur(12px)', zIndex: 50 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <LogoHorizontal symbolSize="sm" />
        </Link>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <Link href="/#modules" style={{ color: '#9CA3AF', fontSize: 14, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
            ← Tous les modules
          </Link>
          <Link href="/register" style={{ padding: '8px 18px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 6, color: '#fff', fontSize: 14, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
            Démarrer
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '80px 40px 60px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '6px 16px', background: mod.bg, border: `1px solid ${mod.border}`, borderRadius: 20, marginBottom: 28 }}>
          <span style={{ fontSize: 16 }}>{mod.emoji}</span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: mod.color, textTransform: 'uppercase' }}>Module We Connect</span>
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 52px)', letterSpacing: '-1.5px', marginBottom: 20, lineHeight: 1.1 }}>
          {mod.name}
        </h1>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 'clamp(18px, 2.5vw, 24px)', color: mod.color, marginBottom: 20 }}>
          {mod.tagline}
        </p>
        <p style={{ color: '#9CA3AF', fontSize: 17, lineHeight: 1.8, maxWidth: 640, margin: '0 auto 40px' }}>
          {mod.desc}
        </p>
        <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 32px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 8, color: '#fff', fontSize: 16, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
          Activer ce module →
        </Link>
      </div>

      {/* Features */}
      <div style={{ padding: '0 40px 80px', maxWidth: 1000, margin: '0 auto' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: mod.color, textTransform: 'uppercase', marginBottom: 32, textAlign: 'center' }}>
          Ce que vous obtenez
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 80 }}>
          {mod.features.map((f, i) => (
            <div key={i} style={{ background: '#12141C', border: `1px solid ${mod.border}`, borderRadius: 10, padding: 24 }}>
              <span style={{ fontSize: 24, display: 'block', marginBottom: 12 }}>{f.icon}</span>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7 }}>{f.body}</p>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <div style={{ textAlign: 'center', marginBottom: 80 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: mod.color, textTransform: 'uppercase', marginBottom: 24 }}>
            Idéal pour
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            {mod.useCases.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: mod.bg, border: `1px solid ${mod.border}`, borderRadius: 30 }}>
                <span style={{ fontSize: 18 }}>{u.icon}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#F8F9FC' }}>{u.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div style={{ background: '#12141C', border: `1px solid ${mod.border}`, borderRadius: 12, padding: '40px 48px', textAlign: 'center' }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: mod.color, textTransform: 'uppercase', marginBottom: 32 }}>
            Comment ça marche
          </p>
          <div style={{ display: 'flex', gap: 0, justifyContent: 'center', flexWrap: 'wrap' }}>
            {mod.steps.map((step, i) => (
              <div key={i} style={{ flex: 1, minWidth: 200, padding: '0 20px', position: 'relative' }}>
                {i < mod.steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 18, left: '60%', right: '-20%', height: 1, background: `linear-gradient(90deg, ${mod.color}44, transparent)` }} />
                )}
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: mod.bg, border: `1px solid ${mod.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: mod.color }}>
                  {i + 1}
                </div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9CA3AF', lineHeight: 1.6 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div style={{ textAlign: 'center', marginTop: 64 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 16 }}>
            Prêt à activer {mod.name} ?
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 15, marginBottom: 32 }}>
            Créez votre compte gratuitement et configurez ce module en moins de 2 minutes.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" style={{ padding: '14px 32px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 8, color: '#fff', fontSize: 15, textDecoration: 'none', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              Créer mon compte →
            </Link>
            <Link href="/" style={{ padding: '14px 32px', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#9CA3AF', fontSize: 15, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
              Voir tous les modules
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
