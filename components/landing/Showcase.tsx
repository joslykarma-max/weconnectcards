'use client';

import { useState, useEffect } from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TABS = [
  {
    label:   'Profil public',
    icon:    '👤',
    sub:     'Ce que voit votre contact en scannant votre carte',
    img:     '/slides/slide1.png',
    accent:  '#6366F1',
    tag:     'Vue client · Instantanée',
  },
  {
    label:   'Dashboard',
    icon:    '📊',
    sub:     'Pilotez votre carte depuis votre espace personnel',
    img:     '/slides/slide2.png',
    accent:  '#06B6D4',
    tag:     'Temps réel · Tout device',
  },
  {
    label:   'Analytics',
    icon:    '📈',
    sub:     'Qui scanne votre carte, quand, depuis où',
    img:     '/slides/slide3.png',
    accent:  '#8B5CF6',
    tag:     'Données détaillées',
  },
  {
    label:   'Modules',
    icon:    '🧩',
    sub:     '9 modules activables pour enrichir votre profil',
    img:     '/slides/slide4.png',
    accent:  '#F59E0B',
    tag:     '9 modules · Plug & Play',
  },
];

export default function Showcase() {
  const [active, setActive]     = useState(0);
  const [imgKey, setImgKey]     = useState(0);
  const { ref, visible }        = useScrollReveal(0.1);

  /* Auto-cycle every 6s */
  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % TABS.length);
      setImgKey((k) => k + 1);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  function switchTo(i: number) {
    setActive(i);
    setImgKey((k) => k + 1);
  }

  const tab = TABS[active];

  return (
    <section style={{ padding: '100px 40px', background: '#0D0E14', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      <div
        ref={ref}
        style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1, opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(40px)', transition: 'all 0.8s cubic-bezier(0.23,1,0.32,1)' }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>
            La plateforme
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 16 }}>
            Tout en un. Vraiment.
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>
            Du profil public que voit votre contact, aux analytics que vous consultez — tout est pensé pour les pros.
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => switchTo(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px',
                borderRadius: 100,
                border: i === active ? `1px solid ${t.accent}55` : '1px solid rgba(255,255,255,0.08)',
                background: i === active ? `${t.accent}15` : 'rgba(255,255,255,0.03)',
                color: i === active ? t.accent : '#9CA3AF',
                cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                fontWeight: i === active ? 600 : 400,
                transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Main preview area */}
        <div style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: '#12141C', boxShadow: '0 40px 100px rgba(0,0,0,0.6)' }}>
          {/* Browser chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px', background: '#0D0E14', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#FF5F57','#FFBD2E','#28CA41'].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '4px 16px', minWidth: 280 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', letterSpacing: 0.5 }}>weconnect.cards</span>
              </div>
            </div>
            {/* Tag chip */}
            <div style={{ padding: '3px 10px', background: `${tab.accent}20`, border: `1px solid ${tab.accent}40`, borderRadius: 4 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: tab.accent, letterSpacing: 1 }}>{tab.tag}</span>
            </div>
          </div>

          {/* Screenshot */}
          <div style={{ position: 'relative', height: 480, overflow: 'hidden' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgKey}
              src={tab.img}
              alt={tab.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                animation: 'imgFadeIn 0.6s cubic-bezier(0.23,1,0.32,1) both',
              }}
            />
            {/* Bottom gradient fade */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, #12141C)', pointerEvents: 'none' }} />

            {/* Floating description card */}
            <div style={{
              position: 'absolute', bottom: 24, left: 24,
              background: 'rgba(13,14,20,0.85)',
              border: `1px solid ${tab.accent}33`,
              borderRadius: 12,
              padding: '14px 18px',
              backdropFilter: 'blur(12px)',
              maxWidth: 360,
            }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 4 }}>{tab.label}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', lineHeight: 1.5 }}>{tab.sub}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 2, background: 'rgba(255,255,255,0.05)' }}>
            <div
              key={`bar-${imgKey}`}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${tab.accent}, ${tab.accent}88)`,
                animation: 'tabLine 6s linear both',
                transformOrigin: 'left',
              }}
            />
          </div>
        </div>

        {/* Bottom indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          {TABS.map((_, i) => (
            <button
              key={i}
              onClick={() => switchTo(i)}
              style={{
                width: i === active ? 28 : 8, height: 8, borderRadius: 4,
                background: i === active ? tab.accent : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
