'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

const plans = [
  {
    name: 'Essentiel',
    price: '10 500',
    suffix: 'one-time',
    sub: '+ 0 FCFA/mois',
    badge: null,
    color: '#9CA3AF',
    features: [
      '1 carte NFC standard (PVC)',
      'Profil digital inclus',
      'Liens illimités',
      'Analytics de base (30 jours)',
      'QR Code inclus',
      '1 module au choix',
    ],
    cta: 'Commander',
    href: '/register?plan=essentiel',
    variant: 'ghost' as const,
  },
  {
    name: 'Pro',
    price: '20 000',
    suffix: 'one-time',
    sub: '+ 2 000 FCFA/mois',
    badge: 'Le plus populaire',
    color: '#6366F1',
    features: [
      '1 carte NFC Premium (métal)',
      'Profil personnalisé avancé',
      'Analytics complets (illimité)',
      'Domaine personnalisé',
      'Tous les modules inclus',
      'CRM contacts',
      'Support prioritaire',
    ],
    cta: 'Commencer avec Pro',
    href: '/register?plan=pro',
    variant: 'gradient' as const,
  },
  {
    name: 'Équipe',
    price: 'Sur devis',
    suffix: '',
    sub: 'Contactez-nous',
    badge: null,
    color: '#06B6D4',
    features: [
      'Cartes pour toute l\'équipe',
      'Dashboard centralisé admin',
      'Branding entreprise forcé',
      'Intégration CRM/SIRH',
      'Facturation unifiée',
      'Account manager dédié',
      'API access',
    ],
    cta: 'Nous contacter',
    href: '/contact',
    variant: 'secondary' as const,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>
          Tarifs
        </p>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 20 }}>
          Simple. Transparent. Juste.
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 480, margin: '0 auto' }}>
          Pas de frais cachés. Payez une fois, utilisez à vie pour l&apos;essentiel.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
        {plans.map((plan, i) => (
          <div
            key={i}
            style={{
              background: plan.badge ? 'linear-gradient(180deg, #181B26, #12141C)' : '#181B26',
              border: plan.badge ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: 36,
              position: 'relative',
              transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              ...(plan.badge && { boxShadow: '0 0 40px rgba(99,102,241,0.15)' }),
            }}
          >
            {plan.badge && (
              <div style={{
                position: 'absolute',
                top: -12,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                color: '#fff',
                fontFamily: 'Space Mono, monospace',
                fontSize: 9,
                letterSpacing: 2,
                padding: '4px 16px',
                borderRadius: 4,
                whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: plan.color, textTransform: 'uppercase', marginBottom: 16 }}>
              {plan.name}
            </p>

            <div style={{ marginBottom: 8 }}>
              {plan.suffix ? (
                <>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 48, color: '#F8F9FC' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#6B7280', marginLeft: 6 }}>
                    FCFA
                  </span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', marginLeft: 8, letterSpacing: 2 }}>
                    {plan.suffix}
                  </span>
                </>
              ) : (
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#F8F9FC' }}>
                  {plan.price}
                </span>
              )}
            </div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: 32 }}>
              {plan.sub}
            </p>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 28, marginBottom: 32 }}>
              {plan.features.map((f, j) => (
                <div key={j} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" style={{ color: plan.color, flexShrink: 0, marginTop: 3 }}>
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <Link href={plan.href} style={{ display: 'block' }}>
              <Button variant={plan.variant} size="md" style={{ width: '100%' }}>
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
