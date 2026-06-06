'use client';

import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TABS = [
  { label: 'Profil public', icon: '👤', sub: 'Ce que voit votre contact en scannant votre carte', img: '/slides/slide1.png', accent: '#6366F1', tag: 'Vue client · Instantanée' },
  { label: 'Dashboard',     icon: '📊', sub: 'Pilotez votre carte depuis votre espace personnel',  img: '/slides/slide2.png', accent: '#06B6D4', tag: 'Temps réel · Tout device' },
  { label: 'Analytics',     icon: '📈', sub: 'Qui scanne votre carte, quand, depuis où',            img: '/slides/slide3.png', accent: '#8B5CF6', tag: 'Données détaillées' },
  { label: 'Modules',       icon: '🧩', sub: '9 modules activables pour enrichir votre profil',    img: '/slides/slide4.png', accent: '#F59E0B', tag: '9 modules · Plug & Play' },
];

export default function Showcase() {
  const [active, setActive]   = useState(0);
  const [imgKey, setImgKey]   = useState(0);
  const { ref, visible }      = useScrollReveal(0.1);

  useEffect(() => {
    const t = setInterval(() => { setActive((i) => (i + 1) % TABS.length); setImgKey((k) => k + 1); }, 6000);
    return () => clearInterval(t);
  }, []);

  function switchTo(i: number) { setActive(i); setImgKey((k) => k + 1); }

  const tab = TABS[active];

  return (
    <section style={{ padding: '100px 40px', background: '#F8FAFC', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.23,1,0.32,1)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>La plateforme</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#0F172A', marginBottom: 16 }}>Tout en un. Vraiment.</h2>
          <p style={{ color: '#64748B', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>Du profil public que voit votre contact, aux analytics que vous consultez — tout est pensé pour les pros.</p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={t.label} onClick={() => switchTo(i)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 100, border: i === active ? `1px solid ${t.accent}55` : '1px solid rgba(0,0,0,0.1)', background: i === active ? `${t.accent}12` : 'rgba(255,255,255,0.8)', color: i === active ? t.accent : '#64748B', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: i === active ? 600 : 400, transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)' }}>
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(0,0,0,0.08)', background: '#FFFFFF', boxShadow: '0 40px 80px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04)' }}>
          {/* Browser chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', background: '#F1F5F9', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5F57','#FFBD2E','#28CA41'].map((c) => (<div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />))}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, padding: '4px 16px', minWidth: 280 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#94A3B8', letterSpacing: 0.5 }}>weconnect.cards</span>
              </div>
            </div>
            <div style={{ padding: '3px 10px', background: `${tab.accent}15`, border: `1px solid ${tab.accent}35`, borderRadius: 4 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: tab.accent, letterSpacing: 1 }}>{tab.tag}</span>
            </div>
          </div>

          {/* Screenshot */}
          <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img key={imgKey} src={tab.img} alt={tab.label} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', animation: 'imgFadeIn 0.6s cubic-bezier(0.23,1,0.32,1) both' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, #FFFFFF)', pointerEvents: 'none' }} />

            {/* Description overlay */}
            <div style={{ position: 'absolute', bottom: 24, left: 24, background: 'rgba(255,255,255,0.92)', border: `1px solid ${tab.accent}25`, borderRadius: 12, padding: '14px 18px', backdropFilter: 'blur(12px)', maxWidth: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 4 }}>{tab.label}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#64748B', lineHeight: 1.5 }}>{tab.sub}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 3, background: 'rgba(0,0,0,0.06)' }}>
            <div key={`bar-${imgKey}`} style={{ height: '100%', background: `linear-gradient(90deg, ${tab.accent}, ${tab.accent}88)`, animation: 'tabLine 6s linear both', transformOrigin: 'left' }} />
          </div>
        </div>

        {/* Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {TABS.map((_, i) => (<button key={i} onClick={() => switchTo(i)} style={{ width: i === active ? 28 : 8, height: 8, borderRadius: 4, background: i === active ? tab.accent : 'rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer', transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)', padding: 0 }} />))}
        </div>
      </div>
    </section>
  );
}
