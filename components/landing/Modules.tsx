'use client';

import Link from 'next/link';

const modules = [
  { slug: 'loyalty',     emoji: '🎯', name: 'Carte de fidélité',      desc: 'Tampons digitaux et récompenses clients' },
  { slug: 'menu',        emoji: '🍽️', name: 'Menu Restaurant',        desc: 'QR menu interactif et commande WhatsApp' },
  { slug: 'review',      emoji: '⭐', name: 'Tap to Review',          desc: 'Générez des avis Google en un tap' },
  { slug: 'event',       emoji: '🎟️', name: 'Pass Événement',         desc: 'Billetterie NFC et check-in' },
  { slug: 'access',      emoji: '🔑', name: 'Clé d\'accès',           desc: 'Contrôle d\'accès par zones et horaires' },
  { slug: 'medical',     emoji: '🩺', name: 'Carte Médicale',          desc: 'Urgences sécurisées, infos vitales toujours visibles' },
  { slug: 'certificate', emoji: '🦋', name: 'Certificat Authenticité', desc: 'Vérification produit et transfert propriété' },
  { slug: 'member',      emoji: '🎫', name: 'Carte Membre',            desc: 'Adhésions, niveaux et présences' },
  { slug: 'portfolio',   emoji: '🎵', name: 'Portfolio Artiste',       desc: 'Galerie média et liens streaming' },
];

export default function Modules() {
  return (
    <section id="modules" style={{ padding: '100px 40px', background: '#0D0E14', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#06B6D4', textTransform: 'uppercase', marginBottom: 16 }}>
            Modules disponibles
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 20 }}>
            Une carte. Neuf usages.
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>
            Activez les modules dont vous avez besoin. Désactivez ceux que vous n&apos;utilisez pas. Tout en temps réel.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {modules.map((mod) => (
            <Link
              key={mod.slug}
              href={`/modules/${mod.slug}`}
              style={{
                display: 'block',
                background: '#12141C',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8,
                padding: '24px 20px',
                textDecoration: 'none',
                transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = 'rgba(6,182,212,0.3)';
                el.style.background  = '#181B26';
                el.style.transform   = 'translateY(-4px)';
                el.style.boxShadow   = '0 12px 32px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                el.style.borderColor = 'rgba(255,255,255,0.05)';
                el.style.background  = '#12141C';
                el.style.transform   = 'translateY(0)';
                el.style.boxShadow   = 'none';
              }}
            >
              <span style={{ fontSize: 28, display: 'block', marginBottom: 12 }}>{mod.emoji}</span>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 6 }}>
                {mod.name}
              </h3>
              <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                {mod.desc}
              </p>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#06B6D4', textTransform: 'uppercase' }}>
                En savoir plus →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
