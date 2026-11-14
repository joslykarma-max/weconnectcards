'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useScrollReveal } from '@/hooks/useScrollReveal';

const TABS = [
  { label: 'Profil public', icon: '👤', sub: 'Ce que voit votre contact en scannant votre carte', img: '/slides/slide1.png', accent: '#6366F1', tag: 'Vue client · Instantanée' },
  { label: 'Dashboard',     icon: '📊', sub: 'Pilotez votre carte depuis votre espace personnel',  img: '/slides/slide2.png', accent: '#06B6D4', tag: 'Temps réel · Tout device' },
  { label: 'Analytics',     icon: '📈', sub: 'Qui scanne votre carte, quand, depuis où',            img: '/slides/slide3.png', accent: '#8B5CF6', tag: 'Données détaillées' },
  { label: 'Modules',       icon: '🧩', sub: '9 modules activables pour enrichir votre profil',    img: '/slides/slide4.png', accent: '#F59E0B', tag: '9 modules · Plug & Play' },
];
const ROTATE_MS = 6000;

export default function Showcase() {
  const [active, setActive] = useState(0);
  const [cycle, setCycle]   = useState(0);       // restarts the progress bar
  const [inView, setInView] = useState(false);
  const sectionRef          = useRef<HTMLElement>(null);
  const { ref, visible }    = useScrollReveal(0.1);

  // Rotate only while the section is on screen and the tab is visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setTimeout(() => {
      if (document.visibilityState !== 'visible') { setCycle((c) => c + 1); return; }
      setActive((i) => (i + 1) % TABS.length);
      setCycle((c) => c + 1);
    }, ROTATE_MS);
    return () => clearTimeout(t);
  }, [inView, cycle]);

  function switchTo(i: number) { setActive(i); setCycle((c) => c + 1); }

  const tab = TABS[active];

  return (
    <section ref={sectionRef} id="platform" className="lp-section lp-deferred" style={{ background: 'linear-gradient(180deg, #F4F7FB 0%, #EEF2FF 100%)', overflow: 'hidden' }}>
      <div ref={ref} style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(40px)', transition: 'opacity 0.8s cubic-bezier(0.23,1,0.32,1), transform 0.8s cubic-bezier(0.23,1,0.32,1)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 14 }}>La plateforme</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(30px, 4vw, 48px)', letterSpacing: '-1px', lineHeight: 1.1, color: '#0F172A', marginBottom: 14 }}>Tout en un. Vraiment.</h2>
          <p style={{ color: '#64748B', fontSize: 17, maxWidth: 500, margin: '0 auto' }}>Du profil public que voit votre contact, aux analytics que vous consultez — tout est pensé pour les pros.</p>
        </div>

        {/* Tabs */}
        <div role="group" aria-label="Aperçus de la plateforme" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button key={t.label} type="button" aria-pressed={i === active} aria-controls="showcase-panel" onClick={() => switchTo(i)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 18px', borderRadius: 999, border: i === active ? `1px solid ${t.accent}55` : '1px solid #E3E8EF', background: i === active ? `${t.accent}14` : '#FFFFFF', color: i === active ? t.accent : '#64748B', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: i === active ? 600 : 500, transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)' }}>
              <span style={{ fontSize: 16 }} aria-hidden>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Preview */}
        <div id="showcase-panel" aria-live="off" className="lp-card" style={{ overflow: 'hidden', borderColor: `${tab.accent}30`, transition: 'border-color 0.6s ease' }}>
          {/* Browser chrome */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: '#F4F7FB', borderBottom: '1px solid #EDF1F6' }}>
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }} aria-hidden>
              {['#FF5F57', '#FFBD2E', '#28CA41'].map((c) => (<div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />))}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#FFFFFF', border: '1px solid #E3E8EF', borderRadius: 8, padding: '4px 14px', maxWidth: 320, width: '100%', justifyContent: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#94A3B8', letterSpacing: 0.5 }}>weconnect.cards</span>
              </div>
            </div>
            <div className="showcase-tag" style={{ padding: '3px 10px', background: `${tab.accent}15`, border: `1px solid ${tab.accent}35`, borderRadius: 6, flexShrink: 0 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: tab.accent, letterSpacing: 1 }}>{tab.tag}</span>
            </div>
          </div>

          {/* Screenshots: optimised by next/image, loaded lazily, cross-faded */}
          <div style={{ position: 'relative', aspectRatio: '16 / 9', background: '#F4F7FB' }}>
            {TABS.map((t, i) => (
              <Image key={t.img} src={t.img} alt={`${t.label} — ${t.sub}`} fill sizes="(max-width: 1280px) 100vw, 1200px"
                style={{ objectFit: 'cover', objectPosition: 'top', opacity: i === active ? 1 : 0, transition: 'opacity 0.6s cubic-bezier(0.23,1,0.32,1)' }}
                aria-hidden={i !== active} />
            ))}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '22%', background: 'linear-gradient(transparent, #FFFFFF)', pointerEvents: 'none' }} />
          </div>

          {/* Caption (below the image so it never hides the screenshot on small screens) */}
          <div style={{ padding: '16px 20px 18px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F172A', marginBottom: 2 }}>{tab.label}</p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#64748B', lineHeight: 1.5 }}>{tab.sub}</p>
          </div>

          {/* Progress */}
          <div style={{ height: 3, background: '#EDF1F6' }}>
            <div key={`bar-${cycle}`} style={{ height: '100%', background: `linear-gradient(90deg, ${tab.accent}, ${tab.accent}88)`, animation: inView ? `tabLine ${ROTATE_MS}ms linear both` : 'none', transformOrigin: 'left' }} />
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 560px) { .showcase-tag { display: none; } }`}</style>
    </section>
  );
}
