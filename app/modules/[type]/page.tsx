import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import LightBubbles from '@/components/ui/LightBubbles';
import styles from './module.module.css';

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
  profile: {
    emoji:   '💼',
    name:    'Carte de visite pro',
    tagline: 'Votre carte de visite, toujours à jour',
    desc:    'Un contact de votre carte NFC avec un smartphone ouvre votre profil professionnel : photo, poste, entreprise, coordonnées et liens. Vous le modifiez quand vous voulez, sans jamais réimprimer de carte.',
    color:   '#6366F1', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)',
    features: [
      { icon: '🔗', title: 'Tous vos liens',             body: 'Téléphone, WhatsApp, email, LinkedIn, Instagram, site web, localisation, Calendly, portfolio et liens personnalisés.' },
      { icon: '🎨', title: 'Quatre styles d\'affichage',  body: 'Clair, Classique, Grille ou Carte Pro : choisissez la présentation qui vous ressemble.' },
      { icon: '📇', title: 'Contact enregistré en un tap', body: 'Votre interlocuteur ajoute vos coordonnées à son répertoire et peut vous laisser les siennes.' },
      { icon: '📊', title: 'Statistiques de scans',       body: 'Suivez combien de fois votre profil est consulté et quels liens sont ouverts.' },
    ],
    useCases: [
      { icon: '🧑‍💼', label: 'Entrepreneurs & dirigeants' },
      { icon: '💻', label: 'Freelances & consultants' },
      { icon: '🏠', label: 'Agents & commerciaux' },
      { icon: '🎓', label: 'Jeunes professionnels' },
    ],
    steps: [
      'Commandez et activez votre carte',
      'Renseignez photo, poste et liens dans votre dashboard',
      'Approchez votre carte d\'un smartphone : votre profil s\'ouvre',
    ],
  },

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
    tagline: 'Badge digital multi-zones, accès sécurisé en un tap',
    desc:    'Transformez votre carte NFC en badge d\'accès professionnel. Créez jusqu\'à 5 zones avec des types d\'accès différents — libre, code PIN chiffré ou WhatsApp — chacune avec ses propres horaires. Un journal d\'accès complet vous permet de savoir qui est entré, quand, et depuis quel appareil.',
    color:   '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)',
    features: [
      { icon: '🏢', title: 'Multi-zones (jusqu\'à 5)',     body: 'Gérez plusieurs espaces sur une seule carte : bureau, salle de réunion, entrepôt, parking — chacun avec ses propres règles.' },
      { icon: '🔐', title: 'PIN chiffré SHA-256',          body: 'Le code PIN n\'est jamais stocké en clair. Il est haché côté client avant enregistrement — même l\'administrateur ne peut pas le lire.' },
      { icon: '🆓', title: 'Accès libre ou WhatsApp',      body: 'Certaines zones n\'ont pas besoin de PIN. Configurez-les en accès libre ou redirigez vers un contact WhatsApp pour validation humaine.' },
      { icon: '🕐', title: 'Horaires par zone',            body: 'Chaque zone a ses propres plages horaires et jours autorisés. En dehors des heures, l\'accès est automatiquement refusé.' },
      { icon: '📋', title: 'Journal d\'accès',             body: 'Chaque tentative — accordée ou refusée — est enregistrée avec la date, l\'heure et l\'appareil. Exportable en CSV.' },
      { icon: '🛡️', title: 'Anti-bruteforce intégré',     body: 'Après 5 tentatives incorrectes, l\'accès est bloqué 10 minutes automatiquement pour protéger contre les attaques.' },
    ],
    useCases: [
      { icon: '💼', label: 'Bureaux & coworking' },
      { icon: '🏘️', label: 'Résidences & immeubles' },
      { icon: '🏨', label: 'Hôtels & chambres privées' },
      { icon: '🏋️', label: 'Clubs & salles de sport' },
      { icon: '📦', label: 'Entrepôts & stockage' },
      { icon: '🚗', label: 'Parkings privatifs' },
    ],
    steps: [
      'Créez vos zones, choisissez le type d\'accès et définissez les horaires',
      'Partagez le PIN uniquement avec les personnes autorisées',
      'Ils scannent votre carte NFC, saisissent le code et entrent — vous voyez tout dans le journal',
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

// « Clair » palette derived from the module colour (same family as the light profile pages)
function mix(hex: string, target: string, amount: number): string {
  const n = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [n(hex), n(target)];
  return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, '0')).join('');
}
function lightPalette(color: string) {
  return {
    accent: color,
    panel:  mix(color, '#FFFFFF', 0.78),   // pastel hero panel
    soft:   mix(color, '#FFFFFF', 0.9),    // icon circles, pills
    ink:    mix(color, '#0B1220', 0.72),   // headings on pastel
    bubble: mix(color, '#FFFFFF', 0.25),
  };
}

export default async function ModuleDetailPage({ params }: Props) {
  const { type } = await params;
  const mod = MODULES[type];
  if (!mod) notFound();
  const pal = lightPalette(mod.color);
  const vars = { '--accent': pal.accent, '--panel': pal.panel, '--soft': pal.soft, '--ink': pal.ink } as React.CSSProperties;

  return (
    <div className={styles.page} style={vars}>
      <LightBubbles tints={[pal.bubble, '#9FA8F7']} />
      <Nav />

      <main className={styles.main}>
        <Link href="/#how-it-works" className={styles.back}>← Tous les modules</Link>

        {/* Hero: pastel panel with the module emblem, like the light profile header */}
        <section className={styles.hero}>
          <div className={styles.emblem} aria-hidden><span>{mod.emoji}</span></div>
          <div className={styles.panel}>
            <p className={styles.kicker}>Module We Connect</p>
            <h1 className={styles.h1}>{mod.name}</h1>
            <p className={styles.tagline}>{mod.tagline}</p>
            <p className={styles.desc}>{mod.desc}</p>
            <Link href="/register" className={styles.primary}>Activer ce module →</Link>
          </div>
        </section>

        {/* Features */}
        <section className={styles.card} aria-labelledby="features">
          <h2 id="features" className={styles.cardTitle}>Ce que vous obtenez</h2>
          <ul className={styles.features}>
            {mod.features.map((f) => (
              <li key={f.title} className={styles.feature}>
                <span className={styles.icon} aria-hidden>{f.icon}</span>
                <span>
                  <span className={styles.featureTitle}>{f.title}</span>
                  <span className={styles.featureBody}>{f.body}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* Use cases */}
        <section className={styles.card} aria-labelledby="usecases">
          <h2 id="usecases" className={styles.cardTitle}>Idéal pour</h2>
          <ul className={styles.pills}>
            {mod.useCases.map((u) => (
              <li key={u.label}><span aria-hidden>{u.icon}</span>{u.label}</li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className={styles.steps} aria-labelledby="steps">
          <h2 id="steps" className={styles.cardTitle}>Comment ça marche</h2>
          <ol>
            {mod.steps.map((step, i) => (
              <li key={step}><span className={styles.stepNum}>{i + 1}</span>{step}</li>
            ))}
          </ol>
        </section>

        {/* Bottom CTA */}
        <section className={styles.cta}>
          <h2>Prêt à activer {mod.name}{'\u00A0'}?</h2>
          <p>Créez votre compte gratuitement et configurez ce module en moins de 2 minutes.</p>
          <div className={styles.ctaActions}>
            <Link href="/register" className={styles.primary}>Créer mon compte →</Link>
            <Link href="/#how-it-works" className={styles.secondary}>Voir tous les modules</Link>
          </div>
        </section>
      </main>

      <div className={styles.above}><Footer /></div>
    </div>
  );
}
