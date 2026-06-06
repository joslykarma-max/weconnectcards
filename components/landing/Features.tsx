'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const HERO_FEATURES = [
  {
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>),
    accent: '#6366F1',
    title:  'Analytics temps réel',
    desc:   'Scans par jour, pays d\'origine, appareils utilisés, modules les plus visités. Sachez exactement comment votre carte performe — et optimisez votre profil en conséquence.',
    points: ['Scans & vues en direct', 'Géolocalisation par ville', 'Historique 30/90 jours', 'Export CSV'],
  },
  {
    icon: (<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6v6H9z"/></svg>),
    accent: '#06B6D4',
    title:  '9 modules métier',
    desc:   'Carte de fidélité, menu restaurant, pass événement, contrôle d\'accès, carte médicale... Activez les modules adaptés à votre activité. Désactivez ce qui ne vous sert pas.',
    points: ['Loyalty · Menu · Review', 'Event · Access · Medical', 'Certificat · Membre · Portfolio', 'Plug & Play — sans code'],
  },
];

const GRID_FEATURES = [
  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12h8M12 8l4 4-4 4"/></svg>), accent: '#8B5CF6', title: 'NFC instantané',    desc: 'Un tap. Compatible iOS & Android. Zéro application.' },
  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>),  accent: '#F59E0B', title: 'Profil dynamique', desc: 'Modifiez vos infos en temps réel. Votre carte, toujours à jour.' },
  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>), accent: '#22C55E', title: 'Multi-liens',       desc: 'Phone, WhatsApp, LinkedIn, Calendly, Portfolio — tous vos réseaux.' },
  { icon: (<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>), accent: '#EC4899', title: 'Mode Équipe',      desc: 'Dashboard centralisé, branding unifié pour toute votre équipe.' },
];

function HeroFeatureCard({ feature, delay }: { feature: typeof HERO_FEATURES[0]; delay: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderTop: `3px solid ${feature.accent}`, borderRadius: 16, padding: 36, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(36px)', transition: `all 0.75s cubic-bezier(0.23,1,0.32,1) ${delay}ms`, position: 'relative', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${feature.accent}35`; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 60px rgba(0,0,0,0.08), 0 0 0 1px ${feature.accent}20`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
    >
      <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: `radial-gradient(circle, ${feature.accent}06 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24, position: 'relative' }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: `${feature.accent}10`, border: `1px solid ${feature.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.accent, flexShrink: 0 }}>{feature.icon}</div>
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#0F172A', marginBottom: 8 }}>{feature.title}</h3>
          <p style={{ color: '#64748B', fontSize: 15, lineHeight: 1.75 }}>{feature.desc}</p>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, position: 'relative' }}>
        {feature.points.map((p) => (
          <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: `${feature.accent}08`, border: `1px solid ${feature.accent}18`, borderRadius: 6 }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: feature.accent, flexShrink: 0 }} />
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: feature.accent, letterSpacing: 0.5 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function GridFeatureCard({ feature, delay }: { feature: typeof GRID_FEATURES[0]; delay: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: 28, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `all 0.7s cubic-bezier(0.23,1,0.32,1) ${delay}ms`, cursor: 'default', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${feature.accent}35`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px rgba(0,0,0,0.08)`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#E2E8F0'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    >
      <div style={{ width: 44, height: 44, background: `${feature.accent}10`, border: `1px solid ${feature.accent}20`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: feature.accent, marginBottom: 16 }}>{feature.icon}</div>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17, color: '#0F172A', marginBottom: 8 }}>{feature.title}</h3>
      <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.7 }}>{feature.desc}</p>
    </div>
  );
}

export default function Features() {
  const { ref: headerRef, visible: headerVisible } = useScrollReveal();
  return (
    <section id="features" className="section-responsive" style={{ padding: '100px 40px', background: '#F5F3FF', position: 'relative' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
      <div ref={headerRef} style={{ textAlign: 'center', marginBottom: 72, opacity: headerVisible ? 1 : 0, transform: headerVisible ? 'translateY(0)' : 'translateY(32px)', transition: 'all 0.7s cubic-bezier(0.23,1,0.32,1)' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>Pourquoi We Connect</p>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#0F172A', marginBottom: 20 }}>Tout ce dont vous avez besoin.</h2>
        <p style={{ color: '#64748B', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>Une solution complète pour gérer et partager votre identité professionnelle.</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 24 }}>
        {HERO_FEATURES.map((f, i) => (<HeroFeatureCard key={f.title} feature={f} delay={i * 120} />))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {GRID_FEATURES.map((f, i) => (<GridFeatureCard key={f.title} feature={f} delay={i * 80} />))}
      </div>
      </div>
    </section>
  );
}
