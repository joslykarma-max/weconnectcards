'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const PROOF = [
  { emoji: '🇧🇯', city: 'Cotonou' },
  { emoji: '🇨🇮', city: 'Abidjan' },
  { emoji: '🇨🇲', city: 'Douala' },
  { emoji: '🇸🇳', city: 'Dakar' },
  { emoji: '🇫🇷', city: 'Paris' },
];

export default function CTA() {
  const { ref, visible } = useScrollReveal(0.1);

  return (
    <section style={{ padding: '120px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>

      {/* Animated gradient mesh background */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 50%, rgba(139,92,246,0.08) 100%)',
        backgroundSize: '400% 400%',
        animation: 'gradMove 12s ease-in-out infinite',
        pointerEvents: 'none',
      }} />

      {/* Radial glows */}
      <div style={{ position: 'absolute', top: '30%', left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'orb1 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 70%)', filter: 'blur(55px)', pointerEvents: 'none', animation: 'orb2 22s ease-in-out infinite' }} />

      <div
        ref={ref}
        style={{
          position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(40px)',
          transition: 'all 0.9s cubic-bezier(0.23,1,0.32,1)',
        }}
      >
        {/* Social proof avatars */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 32 }}>
          {PROOF.map((p, i) => (
            <div
              key={p.city}
              title={p.city}
              style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #181B26, #0D0E14)',
                border: '2px solid #0D0E14',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
                marginLeft: i === 0 ? 0 : -10,
                zIndex: PROOF.length - i,
                boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
              }}
            >
              {p.emoji}
            </div>
          ))}
          <span style={{ marginLeft: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9CA3AF' }}>
            +10 000 professionnels nous font confiance
          </span>
        </div>

        {/* Overline */}
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 28 }}>
          Rejoignez-les maintenant
        </p>

        {/* Headline */}
        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(48px, 6vw, 80px)',
          letterSpacing: '-2px',
          lineHeight: 1,
          color: '#F8F9FC',
          marginBottom: 28,
        }}>
          Faites le{' '}
          <span className="text-gradient">premier geste.</span>
        </h2>

        <p style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 1.7, marginBottom: 48, maxWidth: 560, margin: '0 auto 48px' }}>
          Zéro papier. Zéro friction. Juste votre profil, sur leur téléphone.
          La carte qui évolue avec vous.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href="/register">
            <Button variant="gradient" size="lg">
              Commander ma carte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="lg">J&apos;ai déjà un compte</Button>
          </Link>
        </div>

        {/* Trust indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 0, flexWrap: 'wrap' }}>
          {[
            { icon: '📍', value: 'Cotonou, Bénin',  label: 'Siège social' },
            { icon: '🌍', value: 'Afrique + Monde', label: 'Livraison' },
            { icon: '🔒', value: 'SSL + Firebase',  label: 'Données sécurisées' },
            { icon: '💬', value: 'Support 24/7',    label: 'Pour les Pro' },
          ].map((item, i) => (
            <div
              key={item.label}
              style={{
                textAlign: 'center',
                padding: '0 24px',
                borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', marginBottom: 4 }}>{item.value}</div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
