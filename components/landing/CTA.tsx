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
    <section style={{ padding: '120px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center', background: 'linear-gradient(135deg, #1e1b4b 0%, #0F172A 40%, #0c1a2e 100%)' }}>
      {/* Grid */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      {/* Glows */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', animation: 'orb1 18s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.14) 0%, transparent 70%)', filter: 'blur(55px)', pointerEvents: 'none', animation: 'orb2 22s ease-in-out infinite' }} />
      <div style={{ position: 'absolute', top: '50%', right: '30%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(50px)', pointerEvents: 'none', animation: 'orb3 15s ease-in-out infinite' }} />

      <div ref={ref} style={{ position: 'relative', zIndex: 1, maxWidth: 720, margin: '0 auto', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.9s cubic-bezier(0.23,1,0.32,1)' }}>
        {/* Social proof */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, marginBottom: 40 }}>
          {PROOF.map((p, i) => (
            <div key={p.city} title={p.city} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, marginLeft: i === 0 ? 0 : -10, zIndex: PROOF.length - i, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
              {p.emoji}
            </div>
          ))}
          <span style={{ marginLeft: 16, fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9CA3AF' }}>+10 000 professionnels nous font confiance</span>
        </div>

        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#818CF8', textTransform: 'uppercase', marginBottom: 24 }}>
          Rejoignez-les maintenant
        </p>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(48px, 6vw, 80px)', letterSpacing: '-2px', lineHeight: 1, color: '#F8F9FC', marginBottom: 28 }}>
          Faites le{' '}
          <span className="text-gradient">premier geste.</span>
        </h2>

        <p style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 1.7, marginBottom: 52, maxWidth: 560, margin: '0 auto 52px' }}>
          Zéro papier. Zéro friction. Juste votre profil, sur leur téléphone. La carte qui évolue avec vous.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
          <Link href="/register">
            <Button variant="gradient" size="lg">
              Commander ma carte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
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
            <div key={item.label} style={{ textAlign: 'center', padding: '0 24px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
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
