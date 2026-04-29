'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

const SLIDES = [
  { src: '/slides/slide1.png', fallback: 'linear-gradient(135deg, #0D0E14 0%, #1a1a2e 100%)' },
  { src: '/slides/slide2.png', fallback: 'linear-gradient(135deg, #0c1a2e 0%, #0e2340 100%)' },
  { src: '/slides/slide3.png', fallback: 'linear-gradient(135deg, #1e1b4b 0%, #2d1b4b 100%)' },
  { src: '/slides/slide4.png', fallback: 'linear-gradient(135deg, #1a0a0a 0%, #2d1515 100%)' },
];

const SLIDE_INTERVAL = 5000;

function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [fading, setFading]   = useState(false);

  useEffect(() => {
    const timer = setInterval(() => advance('auto'), SLIDE_INTERVAL);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function advance(dir: 'auto' | 'prev' | 'next' | number) {
    const next = typeof dir === 'number'
      ? dir
      : dir === 'prev'
        ? (current - 1 + SLIDES.length) % SLIDES.length
        : (current + 1) % SLIDES.length;
    if (next === current) return;
    setPrev(current);
    setCurrent(next);
    setFading(true);
    setTimeout(() => { setPrev(null); setFading(false); }, 800);
  }

  return (
    <>
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            background: i === current || i === prev ? undefined : slide.fallback,
            opacity: i === current ? 0.5 : i === prev && fading ? 0 : 0,
            transition: i === current ? 'opacity 0.9s ease' : i === prev ? 'opacity 0.9s ease' : 'none',
            zIndex: i === current ? 1 : i === prev ? 0 : -1,
          }}
        >
          {/* Image with fallback */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${slide.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
          {/* Fallback gradient (shows if image fails to load) */}
          <div style={{
            position: 'absolute', inset: 0,
            background: slide.fallback,
            zIndex: -1,
          }} />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.58)', zIndex: 2 }} />

      {/* Dot navigation */}
      <div style={{
        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 10, zIndex: 10, alignItems: 'center',
      }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => advance(i)}
            style={{
              width: i === current ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.35)',
              border: 'none', cursor: 'pointer', padding: 0,
              transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
            }}
          />
        ))}
      </div>

      {/* Arrow prev */}
      <button
        onClick={() => advance('prev')}
        style={{
          position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
      </button>

      {/* Arrow next */}
      <button
        onClick={() => advance('next')}
        style={{
          position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
          zIndex: 10, width: 40, height: 40, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(4px)', transition: 'background 0.2s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </>
  );
}

const EDITIONS = [
  {
    key:         'midnight',
    label:       'Midnight',
    bg:          'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)',
    accent:      '#6366F1',
    line:        'linear-gradient(90deg, #6366F1, #06B6D4)',
    chip:        'linear-gradient(135deg, #F59E0B, #FBBF24)',
    personName:  'Sophie Martin',
    personTitle: 'CEO & Founder',
  },
  {
    key:         'electric',
    label:       'Electric',
    bg:          'linear-gradient(135deg, #1e1b4b 0%, #4338CA 100%)',
    accent:      '#818CF8',
    line:        'linear-gradient(90deg, #818CF8, #C084FC)',
    chip:        'linear-gradient(135deg, #C084FC, #818CF8)',
    personName:  'Marcus Chen',
    personTitle: 'Product Designer',
  },
  {
    key:         'glass',
    label:       'Glass',
    bg:          'linear-gradient(135deg, #0c1a2e 0%, #0e2340 100%)',
    accent:      '#06B6D4',
    line:        'linear-gradient(90deg, #06B6D4, #3B82F6)',
    chip:        'linear-gradient(135deg, #0EA5E9, #06B6D4)',
    personName:  'Léa Dubois',
    personTitle: 'Sales Director',
  },
  {
    key:         'metal',
    label:       'Métal',
    bg:          'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
    accent:      '#9CA3AF',
    line:        'linear-gradient(90deg, #9CA3AF, #6B7280)',
    chip:        'linear-gradient(135deg, #D1D5DB, #9CA3AF)',
    personName:  'Alex Torres',
    personTitle: 'CTO',
  },
];

const W = 340;
const H = 215;
const N = EDITIONS.length;

function CardDeck() {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [rotation, setRotation]     = useState({ x: 0, y: 0 });
  const [exiting, setExiting]       = useState(false);
  const cardRef   = useRef<HTMLDivElement>(null);
  const touchX    = useRef(0);

  function navigate(dir: 'prev' | 'next') {
    if (exiting) return;
    setExiting(true);
    setFlipped(false);
    setTimeout(() => {
      setActiveIdx((i) => dir === 'next' ? (i + 1) % N : (i - 1 + N) % N);
      setExiting(false);
    }, 380);
  }

  function getOffset(idx: number) {
    return ((idx - activeIdx) % N + N) % N;
  }

  function cardTransform(idx: number): React.CSSProperties {
    const offset = getOffset(idx);

    if (offset === 0) {
      if (exiting) {
        return {
          zIndex: 10, opacity: 0,
          transform: 'translateX(0px) scale(0.85)',
          transition: 'all 0.38s cubic-bezier(0.23,1,0.32,1)',
          pointerEvents: 'none',
        };
      }
      return {
        zIndex: 10, opacity: 1,
        transform: flipped
          ? 'rotateY(180deg)'
          : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: flipped
          ? 'transform 0.55s cubic-bezier(0.23,1,0.32,1)'
          : exiting ? 'all 0.38s cubic-bezier(0.23,1,0.32,1)' : 'transform 0.15s ease-out',
        cursor: 'pointer',
      };
    }

    if (offset === 1) {
      return {
        zIndex: 6, opacity: 0.6,
        transform: 'translateX(44px) translateY(14px) rotate(5deg) scale(0.88)',
        transition: 'all 0.45s cubic-bezier(0.23,1,0.32,1)',
        filter: 'blur(0.5px)',
        cursor: 'default',
      };
    }

    if (offset === N - 1) {
      return {
        zIndex: 6, opacity: 0.6,
        transform: 'translateX(-44px) translateY(14px) rotate(-5deg) scale(0.88)',
        transition: 'all 0.45s cubic-bezier(0.23,1,0.32,1)',
        filter: 'blur(0.5px)',
        cursor: 'default',
      };
    }

    return {
      zIndex: 1, opacity: 0,
      transform: 'scale(0.75)',
      transition: 'all 0.45s cubic-bezier(0.23,1,0.32,1)',
      pointerEvents: 'none',
    };
  }

  const active = EDITIONS[activeIdx];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>

      {/* Deck */}
      <div
        style={{ position: 'relative', width: W, height: H + 30, perspective: 1200 }}
        onMouseMove={(e) => {
          if (!cardRef.current || flipped || exiting) return;
          const r = cardRef.current.getBoundingClientRect();
          setRotation({
            x: ((e.clientY - r.top  - r.height / 2) / r.height) * -20,
            y: ((e.clientX - r.left - r.width  / 2) / r.width)  *  20,
          });
        }}
        onMouseLeave={() => setRotation({ x: 0, y: 0 })}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) navigate(dx < 0 ? 'next' : 'prev');
        }}
      >
        {EDITIONS.map((ed, idx) => (
          <div
            key={ed.key}
            ref={idx === activeIdx ? cardRef : undefined}
            style={{
              position: 'absolute',
              top: 15,
              left: 0,
              width: W,
              height: H,
              transformStyle: 'preserve-3d',
              ...cardTransform(idx),
            }}
            onClick={() => {
              if (getOffset(idx) === 0 && !exiting) setFlipped((f) => !f);
            }}
          >
            {/* ── FRONT ── */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              borderRadius: 16,
              background: ed.bg,
              border: `1px solid ${ed.accent}44`,
              padding: 28,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              boxShadow: getOffset(idx) === 0
                ? `0 40px 80px rgba(0,0,0,0.6), 0 0 40px ${ed.accent}22`
                : '0 16px 32px rgba(0,0,0,0.5)',
              overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 28, background: ed.chip, borderRadius: 4, opacity: 0.9 }} />
                <div style={{ position: 'relative', width: 36, height: 36 }}>
                  {[36, 26, 16].map((s, i) => (
                    <div key={i} style={{
                      position: 'absolute', top: '50%', left: '50%',
                      width: s, height: s, transform: 'translate(-50%,-50%)',
                      borderRadius: '50%',
                      border: `1.5px solid ${ed.accent}${Math.round((0.6 - i * 0.15) * 255).toString(16).padStart(2, '0')}`,
                    }} />
                  ))}
                  <div style={{ position: 'absolute', top: '50%', left: '50%', width: 6, height: 6, transform: 'translate(-50%,-50%)', borderRadius: '50%', background: ed.accent }} />
                </div>
              </div>

              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F8F9FC', marginBottom: 4 }}>
                  {ed.personName}
                </p>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#9CA3AF', textTransform: 'uppercase' }}>
                  {ed.personTitle}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>
                  We Connect
                </p>
                <div style={{ padding: '4px 10px', background: `${ed.accent}22`, border: `1px solid ${ed.accent}44`, borderRadius: 4 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: ed.accent, letterSpacing: 2 }}>
                    ÉDITION {ed.label.toUpperCase()}
                  </span>
                </div>
              </div>

              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: ed.line, borderRadius: '0 0 16px 16px' }} />
            </div>

            {/* ── BACK ── */}
            <div style={{
              position: 'absolute', inset: 0,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: 16,
              background: '#0D0E14',
              border: `1px solid ${ed.accent}44`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16,
              boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
            }}>
              <div style={{
                width: 110, height: 110,
                background: 'repeating-linear-gradient(0deg, rgba(99,102,241,0.08) 0px, rgba(99,102,241,0.08) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(99,102,241,0.08) 0px, rgba(99,102,241,0.08) 1px, transparent 1px, transparent 8px)',
                border: `2px solid ${ed.accent}44`,
                borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  width: 60, height: 60,
                  background: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='30' height='30' fill='%236366F1'/%3E%3Crect x='60' y='10' width='30' height='30' fill='%236366F1'/%3E%3Crect x='10' y='60' width='30' height='30' fill='%236366F1'/%3E%3Crect x='45' y='45' width='10' height='10' fill='%2306B6D4'/%3E%3Crect x='60' y='60' width='10' height='10' fill='%236366F1'/%3E%3C/svg%3E") center/contain no-repeat`,
                }} />
              </div>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>
                Scannez pour voir le profil
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={() => navigate('prev')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', color: '#9CA3AF', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#F8F9FC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9CA3AF'; }}
        >
          ←
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {EDITIONS.map((ed, i) => (
            <button
              key={ed.key}
              onClick={() => { setFlipped(false); setActiveIdx(i); }}
              style={{
                width: i === activeIdx ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === activeIdx ? active.accent : 'rgba(255,255,255,0.15)',
                border: 'none', cursor: 'pointer',
                transition: 'all 0.35s cubic-bezier(0.23,1,0.32,1)',
                padding: 0,
              }}
            />
          ))}
        </div>

        <button
          onClick={() => navigate('next')}
          style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            cursor: 'pointer', color: '#9CA3AF', fontSize: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#F8F9FC'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#9CA3AF'; }}
        >
          →
        </button>
      </div>

      <p style={{
        fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2,
        color: '#6B7280', textTransform: 'uppercase', textAlign: 'center',
      }}>
        {flipped ? '← Cliquez pour revenir' : 'Cliquez · Glissez pour changer d\'édition'}
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden',
        paddingTop: 80,
      }}
    >
      <HeroSlideshow />

      <div
        className="hero-grid"
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '80px 40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 80,
          alignItems: 'center',
          width: '100%',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Left */}
        <div className="hero-text">
          <Badge variant="gradient" className="mb-6 animate-fade-in-up">
            Technologie NFC · Carte intelligente
          </Badge>

          <h1
            className="animate-fade-in-up delay-100"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 'clamp(48px, 5vw, 72px)',
              lineHeight: 1.05,
              letterSpacing: '-2px',
              color: '#F8F9FC',
              marginBottom: 24,
            }}
          >
            Une touche.{' '}
            <span className="text-gradient">Toute votre identité.</span>
          </h1>

          <p
            className="animate-fade-in-up delay-200"
            style={{
              fontSize: 18,
              color: '#9CA3AF',
              lineHeight: 1.8,
              marginBottom: 40,
              maxWidth: 480,
            }}
          >
            La carte NFC premium qui remplace toutes vos cartes de visite.
            Profil dynamique, analytics temps réel, 9 modules métier.
            Partagez votre identité professionnelle en un geste.
          </p>

          <div className="animate-fade-in-up delay-300 hero-ctas" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/register">
              <Button variant="gradient" size="lg">
                Commander ma carte
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button variant="ghost" size="lg">
                Voir comment ça marche
              </Button>
            </Link>
          </div>

          <div className="animate-fade-in-up delay-400 hero-stats" style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { value: '10k+', label: 'Cartes actives' },
              { value: '3s',   label: 'Pour partager' },
              { value: '0',    label: 'Papier utilisé' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28,
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  {stat.value}
                </div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Card Deck */}
        <div className="animate-fade-in-up delay-300" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="card-deck-wrapper">
            <div className="card-deck-scale">
              <CardDeck />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
