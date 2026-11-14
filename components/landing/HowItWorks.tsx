'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { MODULES } from './modules-data';
import styles from './howitworks.module.css';

type Audience = 'perso' | 'pro';

interface Usage { slug: string; emoji: string; short: string; desc: string }

const PROFILE: Usage = { slug: 'profile', emoji: '💼', short: 'Carte de visite pro', desc: 'Votre profil professionnel' };
// Short tile labels; emoji and description come from the shared module list
const SHORT: Record<string, string> = {
  portfolio: 'Portfolio', medical: 'Carte médicale', review: 'Tap to Review', loyalty: 'Fidélité', menu: 'Menu restaurant',
  access: 'Clé d’accès', certificate: 'Certificat', member: 'Carte membre', event: 'Pass événement',
};
const usages = (slugs: string[]): Usage[] => slugs.flatMap((slug) => {
  const m = MODULES.find((x) => x.slug === slug);
  return m ? [{ slug, emoji: m.emoji, short: SHORT[slug] ?? m.name, desc: m.desc }] : [];
});

const JOURNEYS: Record<Audience, {
  label: string; intro: string;
  steps: { title: string; detail: string }[];
  usages: Usage[]; modulesLabel: string;
  cta: { href: string; label: string }; note?: string;
}> = {
  perso: {
    label: 'Particulier',
    intro: 'Votre carte, votre profil : vous commandez, vous recevez, vous configurez.',
    steps: [
      { title: 'Commandez votre carte',        detail: 'Achetez en ligne et choisissez votre édition : Midnight, Electric, Glass ou Métal. Votre compte est créé en même temps.' },
      { title: 'Recevez-la chez vous',         detail: 'Livraison partout en Afrique et dans le monde. Suivez le statut depuis votre espace, puis activez la carte en quelques secondes.' },
      { title: 'Configurez profil et modules', detail: 'Photo, liens, thème et modules depuis votre dashboard. Approchez la carte d’un smartphone : votre profil s’ouvre, sans application.' },
    ],
    usages: [PROFILE, ...usages(['portfolio', 'medical', 'review'])],
    modulesLabel: 'Les modules pour vous',
    cta: { href: '/register', label: 'Commander ma carte' },
  },
  pro: {
    label: 'Entreprise',
    intro: 'Des cartes en volume, chacune dédiée au service dont vous avez besoin.',
    steps: [
      { title: 'Choisissez le module',         detail: 'Fidélité, menu, avis, accès, certificat, adhésion ou pass événement : chaque carte est dédiée à un usage.' },
      { title: 'Indiquez le nombre de cartes', detail: 'Pour vos clients, membres, salariés, invités ou produits, avec une personnalisation à vos couleurs.' },
      { title: 'Recevez votre devis',          detail: 'La facturation dépend du module choisi et du nombre de cartes commandées.' },
      { title: 'Recevez et pilotez',           detail: 'Cartes prêtes à l’emploi. Vous mettez à jour le contenu et suivez les scans depuis un seul espace.' },
    ],
    usages: usages(['loyalty', 'menu', 'review', 'access', 'certificate', 'member', 'event']),   // Tap to Review works for both
    modulesLabel: 'Les modules pour votre entreprise',
    cta: { href: '/contact', label: 'Demander un devis' },
    note: 'Facturation selon le module et le nombre de cartes',
  },
};

const chevron = (
  <svg className={styles.chev} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default function HowItWorks() {
  const [audience, setAudience] = useState<Audience>('perso');
  const [open, setOpen]         = useState(0);   // one step unfolded at a time
  const uid = useId();
  const j   = JOURNEYS[audience];

  function choose(a: Audience) { setAudience(a); setOpen(0); }

  return (
    <section id="how-it-works" className={`${styles.section} lp-deferred`}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>Comment ça marche</p>
        <h2 className={styles.title}>Une carte, deux façons de l&apos;utiliser.</h2>
      </div>

      <div className={styles.glass}>
        <div className={styles.toggle} role="group" aria-label="Type de client">
          <span className={`${styles.thumb} ${audience === 'pro' ? styles.thumbRight : ''}`} aria-hidden />
          {(Object.keys(JOURNEYS) as Audience[]).map((a) => (
            <button key={a} type="button" aria-pressed={audience === a} onClick={() => choose(a)}
              className={`${styles.toggleBtn} ${audience === a ? styles.toggleOn : ''}`}>
              {JOURNEYS[a].label}
            </button>
          ))}
        </div>

        <div className={styles.body} aria-live="polite">
          <p className={styles.intro}>{j.intro}</p>

          <ol className={styles.steps}>
            {j.steps.map((s, i) => {
              const isOpen = open === i;
              const id = `${uid}-${audience}-${i}`;
              return (
                <li key={`${audience}-${i}`} className={`${styles.step} ${isOpen ? styles.stepOpen : ''}`}>
                  <button type="button" className={styles.stepBtn} aria-expanded={isOpen} aria-controls={id}
                    onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className={styles.num}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.stepTitle}>{s.title}</span>
                    {chevron}
                  </button>
                  <div id={id} className={styles.detail} inert={!isOpen}>
                    <div className={styles.detailClip}><p className={styles.detailText}>{s.detail}</p></div>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className={styles.side}>
            <div>
              <p className={styles.modulesLabel}>{j.modulesLabel}</p>
              <div className={styles.tiles}>
                {j.usages.map((u) => (
                  <Link key={u.slug} href={`/modules/${u.slug}`} className={styles.tile}>
                    <span className={styles.tileEmoji} aria-hidden>{u.emoji}</span>
                    <span className={styles.tileText}>
                      <span className={styles.tileName}>{u.short}</span>
                      <span className={styles.tileDesc}>{u.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
            <Link href={j.cta.href} className={styles.cta}>
              {j.cta.label}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            {j.note && <p className={styles.note}>{j.note}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
