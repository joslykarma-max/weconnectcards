'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

function NFCCard3D() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [flipped, setFlipped]   = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || flipped) return;
    const rect   = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top  + rect.height / 2;
    const rotX = ((e.clientY - centerY) / rect.height) * -20;
    const rotY = ((e.clientX - centerX) / rect.width)  *  20;
    setRotation({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => setRotation({ x: 0, y: 0 });

  return (
    <div
      style={{ perspective: 1200, cursor: 'pointer' }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          width: 340,
          height: 215,
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: flipped
            ? 'transform 0.6s cubic-bezier(0.23,1,0.32,1)'
            : 'transform 0.15s ease-out',
          transform: flipped
            ? 'rotateY(180deg)'
            : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        {/* Front */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            borderRadius: 16,
            background: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.15)',
          }}
        >
          {/* NFC ring */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{
              width: 40, height: 28,
              background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
              borderRadius: 4,
              opacity: 0.9,
            }} />
            <div style={{ position: 'relative', width: 36, height: 36 }}>
              {[36, 26, 16].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: s, height: s,
                  transform: 'translate(-50%,-50%)',
                  borderRadius: '50%',
                  border: `1.5px solid rgba(99,102,241,${0.6 - i * 0.15})`,
                }} />
              ))}
              <div style={{
                position: 'absolute', top: '50%', left: '50%',
                width: 6, height: 6,
                transform: 'translate(-50%,-50%)',
                borderRadius: '50%',
                background: '#6366F1',
              }} />
            </div>
          </div>

          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F8F9FC', marginBottom: 4 }}>
              Sophie Martin
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#9CA3AF', textTransform: 'uppercase' }}>
              CEO & Founder
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>
              We Connect
            </p>
            <div style={{
              padding: '4px 10px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 4,
            }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#818CF8', letterSpacing: 2 }}>
                ÉDITION ELECTRIC
              </span>
            </div>
          </div>

          {/* Gradient accent */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 3,
            background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
            borderRadius: '0 0 16px 16px',
          }} />
        </div>

        {/* Back */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: 16,
            background: '#0D0E14',
            border: '1px solid rgba(6,182,212,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* QR Code mockup */}
          <div style={{
            width: 110, height: 110,
            background: 'repeating-linear-gradient(0deg, rgba(99,102,241,0.1) 0px, rgba(99,102,241,0.1) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(99,102,241,0.1) 0px, rgba(99,102,241,0.1) 1px, transparent 1px, transparent 8px)',
            border: '2px solid rgba(99,102,241,0.3)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 60, height: 60,
              background: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'%3E%3Crect x=\'10\' y=\'10\' width=\'30\' height=\'30\' fill=\'%236366F1\'/%3E%3Crect x=\'60\' y=\'10\' width=\'30\' height=\'30\' fill=\'%236366F1\'/%3E%3Crect x=\'10\' y=\'60\' width=\'30\' height=\'30\' fill=\'%236366F1\'/%3E%3Crect x=\'45\' y=\'45\' width=\'10\' height=\'10\' fill=\'%2306B6D4\'/%3E%3Crect x=\'60\' y=\'60\' width=\'10\' height=\'10\' fill=\'%236366F1\'/%3E%3C/svg%3E") center/contain no-repeat',
            }} />
          </div>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>
            Scannez pour voir le profil
          </p>
        </div>
      </div>

      <p style={{
        textAlign: 'center',
        fontFamily: 'Space Mono, monospace',
        fontSize: 9,
        letterSpacing: 3,
        color: '#6B7280',
        marginTop: 16,
        textTransform: 'uppercase',
      }}>
        {flipped ? '← Cliquez pour revenir' : 'Cliquez pour révéler le QR Code'}
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
      {/* Grid background */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6 }} />
      {/* Radial glow */}
      <div className="glow-electric" style={{ position: 'absolute', inset: 0 }} />

      <div style={{
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
      }}>
        {/* Left */}
        <div>
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

          <div className="animate-fade-in-up delay-300" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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

          {/* Social proof */}
          <div className="animate-fade-in-up delay-400" style={{ display: 'flex', gap: 32, marginTop: 48, flexWrap: 'wrap' }}>
            {[
              { value: '10k+', label: 'Cartes actives' },
              { value: '3s',   label: 'Pour partager' },
              { value: '0',    label: 'Papier utilisé' },
            ].map((stat) => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 800,
                  fontSize: 28,
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
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

        {/* Right — 3D Card */}
        <div className="animate-fade-in-up delay-300" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <NFCCard3D />
        </div>
      </div>
    </section>
  );
}
