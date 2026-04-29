'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

const plans = [
  {
    name:    'Essentiel',
    price:   '10 500',
    suffix:  'one-time',
    sub:     '+ 0 FCFA/mois',
    subNote: null,
    badge:   null,
    proMonths: null,
    color:   '#9CA3AF',
    features: [
      '1 carte NFC standard (PVC)',
      'Profil digital inclus',
      'Liens illimités',
      'Analytics de base (30 jours)',
      'QR Code inclus',
      '1 module au choix',
    ],
    cta:     'Commander',
    href:    '/register?plan=essentiel',
    variant: 'ghost' as const,
  },
  {
    name:    'Pro',
    price:   '20 000',
    suffix:  'one-time',
    sub:     '+ 2 000 FCFA/mois',
    subNote: 'après les 3 premiers mois',
    badge:   'Le plus populaire',
    proMonths: 3,
    color:   '#6366F1',
    features: [
      '1 carte NFC Premium',
      'Profil personnalisé avancé',
      'Analytics complets (illimité)',
      'Domaine personnalisé',
      'Tous les modules inclus',
      'CRM contacts',
      'Support prioritaire',
    ],
    cta:     'Commencer avec Pro',
    href:    '/register?plan=pro',
    variant: 'gradient' as const,
  },
  {
    name:    'Équipe',
    price:   'Sur devis',
    suffix:  '',
    sub:     'Contactez-nous',
    subNote: null,
    badge:   null,
    proMonths: null,
    color:   '#06B6D4',
    features: [
      'Cartes pour toute l\'équipe',
      'Dashboard centralisé admin',
      'Branding entreprise forcé',
      'Intégration CRM/SIRH',
      'Facturation unifiée',
      'Account manager dédié',
      'API access',
    ],
    cta:     'Nous contacter',
    href:    '/contact',
    variant: 'secondary' as const,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="section-responsive" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
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

      {/* ── Plan cards ── */}
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
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                color: '#fff', fontFamily: 'Space Mono, monospace', fontSize: 9,
                letterSpacing: 2, padding: '4px 16px', borderRadius: 4, whiteSpace: 'nowrap',
              }}>
                {plan.badge}
              </div>
            )}

            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: plan.color, textTransform: 'uppercase', marginBottom: 16 }}>
              {plan.name}
            </p>

            {/* Price */}
            <div style={{ marginBottom: 4 }}>
              {plan.suffix ? (
                <>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 44, color: '#F8F9FC' }}>{plan.price}</span>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#6B7280', marginLeft: 6 }}>FCFA</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', marginLeft: 8, letterSpacing: 2 }}>{plan.suffix}</span>
                </>
              ) : (
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#F8F9FC' }}>{plan.price}</span>
              )}
            </div>

            {/* Monthly sub */}
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginBottom: plan.subNote ? 4 : 28 }}>
              {plan.sub}
            </p>
            {plan.subNote && (
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#4B5563', marginBottom: 28 }}>
                {plan.subNote}
              </p>
            )}

            {/* 3 months Pro included badge */}
            {plan.proMonths && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                borderRadius: 6, padding: '8px 12px', marginBottom: 24,
              }}>
                <span style={{ fontSize: 14 }}>🎁</span>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#10B981', fontWeight: 600 }}>
                  {plan.proMonths} mois de service Pro inclus — sans renouvellement requis
                </p>
              </div>
            )}

            {/* Features */}
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

      {/* ── Callout: existing Essentiel holders ── */}
      <div style={{
        marginTop: 40,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(6,182,212,0.05))',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 12,
        padding: '28px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#F8F9FC', marginBottom: 4 }}>
              Vous avez déjà une carte Essentiel ?
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.5 }}>
              Débloquez tous les services Pro — modules avancés, analytics complets, QR tracking — sans racheter de carte.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 30, color: '#F8F9FC', lineHeight: 1 }}>
              9 900
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 15, color: '#6B7280', marginLeft: 4 }}>FCFA</span>
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2, marginTop: 4 }}>/MOIS</p>
          </div>
          <Link href="/dashboard/settings">
            <Button variant="gradient" size="md">
              Activer l&apos;abonnement Pro →
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Fine print ── */}
      <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, fontFamily: 'DM Sans, sans-serif', marginTop: 24, lineHeight: 1.7 }}>
        L&apos;abonnement Pro à 9 900 FCFA/mois est le même quel que soit votre carte — il débloque l&apos;ensemble des services Pro sur votre compte.
        <br/>La carte Pro inclut 3 mois offerts dès l&apos;achat, sans renouvellement automatique.
      </p>
    </section>
  );
}
