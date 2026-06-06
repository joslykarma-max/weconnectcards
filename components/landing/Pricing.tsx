'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useScrollReveal } from '@/hooks/useScrollReveal';

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

export default function Pricing() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal();
  return (
    <section id="pricing" className="section-responsive" style={{ padding: '100px 40px', background: '#F8FAFC', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 64, opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s cubic-bezier(0.23,1,0.32,1)' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>Tarifs</p>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#0F172A', marginBottom: 20 }}>Choisis ta carte. Construis ton image.</h2>
        <p style={{ color: '#64748B', fontSize: 17, maxWidth: 540, margin: '0 auto' }}>Trois éditions — chacune pensée pour un niveau d&apos;ambition. Abonnement offert dès l&apos;achat.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'stretch' }}>
        {plans.map((plan) => (
          <div
            key={plan.key}
            style={{
              background: plan.badge === 'Le plus populaire'
                ? 'linear-gradient(160deg, #EEF2FF 0%, #FFFFFF 60%)'
                : plan.badge === 'Premium'
                ? 'linear-gradient(160deg, #FFFBEB 0%, #FFFFFF 60%)'
                : '#FFFFFF',
              border: plan.badge === 'Le plus populaire'
                ? '2px solid rgba(99,102,241,0.4)'
                : plan.badge === 'Premium'
                ? '2px solid rgba(245,158,11,0.35)'
                : '1px solid #E2E8F0',
              borderRadius: 16,
              padding: 32,
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              boxShadow: plan.badge === 'Le plus populaire'
                ? '0 20px 60px rgba(99,102,241,0.18), 0 0 0 1px rgba(99,102,241,0.08)'
                : plan.badge === 'Premium'
                ? '0 12px 40px rgba(245,158,11,0.12)'
                : '0 4px 16px rgba(0,0,0,0.06)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            {plan.badge && (
              <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: plan.key === 'pro' ? 'linear-gradient(135deg, #6366F1, #06B6D4)' : 'linear-gradient(135deg, #F59E0B, #FBBF24)', color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, padding: '4px 14px', borderRadius: 4, whiteSpace: 'nowrap', textTransform: 'uppercase' }}>{plan.badge}</div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>{plan.icon}</span>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: plan.color, textTransform: 'uppercase' }}>Carte {plan.name}</p>
            </div>
            <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>{plan.tagline}</p>

            <div style={{ marginBottom: 24 }}>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 44, color: '#0F172A' }}>{plan.price}</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#94A3B8', marginLeft: 6 }}>FCFA</span>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#94A3B8', letterSpacing: 2, marginTop: 4 }}>Achat unique</p>
            </div>

            <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 20, marginBottom: 20, flex: 1 }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" style={{ color: plan.color, flexShrink: 0, marginTop: 3 }}>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#475569', fontSize: 13.5, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            {plan.option && (
              <div style={{ background: `${plan.color}08`, border: `1px solid ${plan.color}20`, borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: plan.color, letterSpacing: 1 }}>💡 {plan.option}</p>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 4 }}>Idéal pour</p>
              <p style={{ color: '#64748B', fontSize: 12, lineHeight: 1.5 }}>{plan.ideal}</p>
            </div>

            <Link href={plan.href} style={{ display: 'block' }}>
              <Button variant={plan.variant} size="md" style={{ width: '100%' }}>{plan.cta}</Button>
            </Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '20px 28px', textAlign: 'center' }}>
        <p style={{ color: '#64748B', fontSize: 13.5, lineHeight: 1.7 }}>
          Après la période d&apos;abonnement offerte (6 ou 12 mois), le réabonnement est de{' '}
          <strong style={{ color: '#0F172A' }}>2 000 FCFA/mois</strong> pour conserver l&apos;accès aux services en ligne.
        </p>
      </div>

      <div style={{ marginTop: 32, background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(6,182,212,0.04))', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 12, padding: '28px 36px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 20 }}>⚡</span>
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#0F172A', marginBottom: 4 }}>Vous avez déjà une carte Standard ?</p>
            <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.5 }}>Passez votre compte en Pro pour débloquer 3 modules simultanés, le QR dynamique avancé et la gestion multi-cartes.</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: '#0F172A', lineHeight: 1 }}>
              5 500<span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#94A3B8', marginLeft: 4 }}>FCFA</span>
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#94A3B8', letterSpacing: 2, marginTop: 4 }}>UNIQUE</p>
          </div>
          <Link href="/dashboard/settings?upgrade=pro">
            <Button variant="gradient" size="md">Passer mon compte en Pro →</Button>
          </Link>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12, fontFamily: 'DM Sans, sans-serif', marginTop: 20, lineHeight: 1.7 }}>
        L&apos;achat d&apos;une carte Pro ou Prestige active automatiquement un compte Pro.
        <br/>L&apos;upgrade à 5 500 FCFA est à usage unique pour les détenteurs de carte Standard.
      </p>
      </div>
    </section>
  );
}
