'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './pricing.module.css';

const plans = [
  {
    key: 'standard', name: 'Standard', icon: '💳',
    tagline: 'L\'essentiel pour entrer dans le networking intelligent',
    price: '10 000', badge: null, color: '#64748B', accent: 'rgba(100,116,139,0.15)',
    features: ['Carte à l\'effigie de WeConnect (Recto)', 'QR Code dynamique (Verso)', 'Impression simple face', 'PVC blanc ou noir', '6 mois d\'abonnement offerts', '1 module activé à la fois'],
    option: 'Version métallique : +20%', ideal: 'Jeunes pros, indépendants, premiers utilisateurs',
    cta: 'Commander', href: '/register?plan=standard', variant: 'ghost' as const,
  },
  {
    key: 'pro', name: 'Pro', icon: '💼',
    tagline: 'L\'image professionnelle qui inspire confiance',
    price: '15 000', badge: 'Le plus populaire', color: '#6366F1', accent: 'rgba(99,102,241,0.12)',
    features: ['Carte personnalisée (logo, nom, poste, identité visuelle)', 'QR Code dynamique (Verso)', 'Impression simple face', 'PVC blanc ou noir', '6 mois d\'abonnement offerts', '3 modules activés à la fois', 'Compte Pro inclus'],
    option: 'Version métallique : +14%', ideal: 'Entrepreneurs, consultants, freelances sérieux',
    cta: 'Choisir Pro', href: '/register?plan=pro', variant: 'gradient' as const,
  },
  {
    key: 'prestige', name: 'Prestige', icon: '👑',
    tagline: 'L\'excellence pour une image haut de gamme',
    price: '25 000', badge: 'Premium', color: '#F59E0B', accent: 'rgba(245,158,11,0.1)',
    features: ['Carte entièrement personnalisée', 'Impression double face', 'QR Code dynamique', 'Matière métallique premium', '12 mois d\'abonnement offerts', 'Tous les modules débloqués', 'Compte Pro inclus'],
    option: null, ideal: 'Dirigeants, cadres, entreprises, profils haut niveau',
    cta: 'Choisir Prestige', href: '/register?plan=prestige', variant: 'secondary' as const,
  },
];

type PlanKey = typeof plans[number]['key'];

/** Offers: on phones one plan at a time behind a Standard / Pro / Prestige selector; three columns on desktop. */
export default function Pricing() {
  const [selected, setSelected] = useState<PlanKey>('pro');

  return (
    <section id="pricing" className={`${styles.section} lp-deferred`}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>Tarifs</p>
        <h2 className={styles.title}>Choisis ta carte. Construis ton image.</h2>
        <p className={styles.sub}>Trois offres, achat unique. Abonnement offert dès l&apos;achat.</p>
      </div>

      {/* Phone selector */}
      <div className={styles.selector} role="group" aria-label="Choisir une offre">
        {plans.map((plan) => (
          <button key={plan.key} type="button" aria-pressed={selected === plan.key} onClick={() => setSelected(plan.key)}
            className={`${styles.selBtn} ${selected === plan.key ? styles.selOn : ''}`}
            style={selected === plan.key ? { borderColor: plan.color, color: plan.color } : undefined}>
            <span className={styles.selName}>{plan.name}</span>
            <span className={styles.selPrice}>{plan.price} F</span>
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {plans.map((plan) => (
          <article key={plan.key}
            className={`${styles.card} ${selected === plan.key ? styles.cardSelected : ''}`}
            style={{
              borderColor: plan.key === 'pro' ? 'rgba(99,102,241,0.45)' : plan.key === 'prestige' ? 'rgba(245,158,11,0.4)' : '#E2E8F0',
              background: plan.key === 'pro' ? 'linear-gradient(160deg, #EEF2FF 0%, #FFFFFF 60%)' : plan.key === 'prestige' ? 'linear-gradient(160deg, #FFFBEB 0%, #FFFFFF 60%)' : '#FFFFFF',
            }}>
            {plan.badge && (
              <div className={styles.badge} style={{ background: plan.key === 'pro' ? 'linear-gradient(135deg, #6366F1, #06B6D4)' : 'linear-gradient(135deg, #F59E0B, #FBBF24)' }}>{plan.badge}</div>
            )}
            <div className={styles.cardHead}>
              <span className={styles.planIcon} aria-hidden>{plan.icon}</span>
              <p className={styles.planName} style={{ color: plan.color }}>Carte {plan.name}</p>
            </div>
            <p className={styles.tagline}>{plan.tagline}</p>
            <p className={styles.price}>{plan.price}<span>FCFA</span><small>Achat unique</small></p>
            <ul className={styles.features}>
              {plan.features.map((f) => (
                <li key={f}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" style={{ color: plan.color }} aria-hidden>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            {plan.option && <p className={styles.option} style={{ color: plan.color, background: `${plan.color}0D`, borderColor: `${plan.color}26` }}>💡 {plan.option}</p>}
            <p className={styles.ideal}><span>Idéal pour</span>{plan.ideal}</p>
            <Link href={plan.href} style={{ display: 'block', marginTop: 'auto' }}>
              <Button variant={plan.variant} size="md" style={{ width: '100%' }}>{plan.cta}</Button>
            </Link>
          </article>
        ))}
      </div>

      <div className={styles.terms}>
        <p className={styles.renew}>
          Après la période d&apos;abonnement offerte (6 ou 12 mois), le réabonnement est de{' '}
          <strong>2 000 FCFA/mois</strong> pour conserver l&apos;accès aux services en ligne.
        </p>
        <div className={styles.upgrade}>
          <div className={styles.upgradeText}>
            <p className={styles.upgradeTitle}>⚡ Vous avez déjà une carte Standard ?</p>
            <p>Passez votre compte en Pro pour débloquer 3 modules simultanés, le QR dynamique avancé et la gestion multi-cartes.</p>
          </div>
          <p className={styles.upgradePrice}>5 500<span>FCFA</span><small>Unique</small></p>
          <Link href="/dashboard/settings?upgrade=pro" className={styles.upgradeLink}>
            <Button variant="gradient" size="md" style={{ width: '100%' }}>Passer mon compte en Pro →</Button>
          </Link>
        </div>
        <p className={styles.fine}>
          L&apos;achat d&apos;une carte Pro ou Prestige active automatiquement un compte Pro.
          <br />L&apos;upgrade à 5 500 FCFA est à usage unique pour les détenteurs de carte Standard.
        </p>
      </div>
    </section>
  );
}
