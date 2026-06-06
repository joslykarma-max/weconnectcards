'use client';

import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const MODULES = [
  { slug: 'loyalty',     emoji: '🎯', name: 'Carte de fidélité',       desc: 'Tampons digitaux et récompenses clients', accent: '#F59E0B' },
  { slug: 'menu',        emoji: '🍽️', name: 'Menu Restaurant',         desc: 'QR menu interactif et commande directe',  accent: '#EF4444' },
  { slug: 'review',      emoji: '⭐', name: 'Tap to Review',           desc: 'Avis Google en un tap',                   accent: '#FBBF24' },
  { slug: 'event',       emoji: '🎟️', name: 'Pass Événement',          desc: 'Billetterie NFC et check-in instantané',  accent: '#8B5CF6' },
  { slug: 'access',      emoji: '🔑', name: 'Clé d\'accès',            desc: 'Contrôle d\'accès par zones et horaires', accent: '#06B6D4' },
  { slug: 'medical',     emoji: '🩺', name: 'Carte Médicale',          desc: 'Urgences sécurisées, infos vitales',      accent: '#22C55E' },
  { slug: 'certificate', emoji: '🦋', name: 'Certificat Authenticité', desc: 'Vérification produit et propriété',       accent: '#EC4899' },
  { slug: 'member',      emoji: '🎫', name: 'Carte Membre',            desc: 'Adhésions, niveaux et présences',         accent: '#6366F1' },
  { slug: 'portfolio',   emoji: '🎵', name: 'Portfolio Artiste',       desc: 'Galerie média et liens streaming',        accent: '#F97316' },
];

function ModuleCard({ mod, delay }: { mod: typeof MODULES[0]; delay: number }) {
  const { ref, visible } = useScrollReveal(0.08);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.96)', transition: `all 0.65s cubic-bezier(0.23,1,0.32,1) ${delay}ms` }}>
      <Link
        href={`/modules/${mod.slug}`}
        style={{ display: 'block', background: `${mod.accent}07`, border: `1px solid ${mod.accent}22`, borderRadius: 12, padding: '24px 20px', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)', position: 'relative', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = `${mod.accent}55`; el.style.background = `${mod.accent}12`; el.style.transform = 'translateY(-5px)'; el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.1), 0 0 0 1px ${mod.accent}30`; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = `${mod.accent}22`; el.style.background = `${mod.accent}07`; el.style.transform = 'translateY(0)'; el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; }}
      >
        <div style={{ position: 'absolute', top: 14, right: 14, width: 6, height: 6, borderRadius: '50%', background: mod.accent, opacity: 0.4 }} />
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${mod.accent}10`, border: `1px solid ${mod.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, fontSize: 22 }}>{mod.emoji}</div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 6 }}>{mod.name}</h3>
        <p style={{ color: '#64748B', fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>{mod.desc}</p>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: mod.accent, textTransform: 'uppercase' }}>En savoir plus →</span>
      </Link>
    </div>
  );
}

export default function Modules() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal(0.1);
  return (
    <section id="modules" style={{ padding: '100px 40px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />
      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 64, opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s cubic-bezier(0.23,1,0.32,1)' }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#06B6D4', textTransform: 'uppercase', marginBottom: 16 }}>Modules disponibles</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#0F172A', marginBottom: 20 }}>Une carte. Neuf usages.</h2>
          <p style={{ color: '#64748B', fontSize: 17, maxWidth: 520, margin: '0 auto' }}>Activez les modules dont vous avez besoin. Désactivez ceux que vous n&apos;utilisez pas. Tout en temps réel.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {MODULES.map((mod, i) => (<ModuleCard key={mod.slug} mod={mod} delay={i * 60} />))}
        </div>
      </div>
    </section>
  );
}
