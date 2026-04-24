'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function CTA() {
  return (
    <section style={{ padding: '120px 40px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600, height: 400,
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
        <p style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: 9, letterSpacing: 4,
          color: '#6366F1', textTransform: 'uppercase',
          marginBottom: 24,
        }}>
          Rejoignez +10 000 professionnels
        </p>

        <h2 style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: 'clamp(48px, 6vw, 80px)',
          letterSpacing: '-2px',
          lineHeight: 1,
          color: '#F8F9FC',
          marginBottom: 32,
        }}>
          Faites le <span className="text-gradient">premier geste.</span>
        </h2>

        <p style={{ color: '#9CA3AF', fontSize: 18, lineHeight: 1.7, marginBottom: 48 }}>
          Zéro papier. Zéro friction. Juste votre profil, sur leur téléphone.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register">
            <Button variant="gradient" size="lg">
              Commander ma carte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="ghost" size="lg">
              J&apos;ai déjà un compte
            </Button>
          </Link>
        </div>

        <div style={{ marginTop: 56, display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[
            { value: 'Cotonou, Bénin', label: 'Siège social' },
            { value: 'Afrique + Monde', label: 'Livraison' },
            { value: 'Support 24/7', label: 'Pour les Pro' },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 4 }}>
                {item.value}
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
