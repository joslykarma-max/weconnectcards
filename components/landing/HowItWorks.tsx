'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

const STEPS = [
  {
    number: '01',
    title: 'Commandez',
    desc: 'Choisissez votre édition de carte NFC — Midnight, Electric, Glass ou Metal. Livraison rapide à votre adresse partout en Afrique et dans le monde.',
    accent: '#6366F1',
    visual: (
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
        {/* Card visual */}
        <div style={{ background: 'linear-gradient(135deg, #0D0E14, #181B26)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: 32, boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.1)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ width: 50, height: 34, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', borderRadius: 6 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {['Midnight', 'Electric', 'Glass'].map((e, i) => (
                <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: i === 0 ? 1 : 0.4 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1, color: i === 0 ? '#818CF8' : '#6B7280' }}>{e}</span>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${i === 0 ? '#6366F1' : 'rgba(255,255,255,0.1)'}`, background: i === 0 ? 'rgba(99,102,241,0.3)' : 'transparent' }} />
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', marginBottom: 6 }}>Votre Nom</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#9CA3AF', textTransform: 'uppercase' }}>Votre Fonction</p>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #6366F1, #06B6D4)', borderRadius: '0 0 20px 20px' }} />
        </div>

        {/* Floating badge */}
        <div style={{ position: 'absolute', top: -16, right: -16, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', borderRadius: 12, padding: '8px 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#fff', letterSpacing: 1 }}>4 ÉDITIONS</span>
        </div>

        {/* Delivery badge */}
        <div style={{ position: 'absolute', bottom: -16, left: -16, background: 'rgba(13,14,20,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '8px 14px', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'livePulse 2s ease-in-out infinite' }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#F8F9FC', fontWeight: 500 }}>Livraison Afrique + Monde</span>
        </div>
      </div>
    ),
  },
  {
    number: '02',
    title: 'Configurez',
    desc: 'Personnalisez votre profil depuis le dashboard. Photo, liens, thème, modules métier. Tout se met à jour instantanément — même votre carte physique déjà distribuée.',
    accent: '#06B6D4',
    visual: (
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
        {/* Dashboard mini mockup */}
        <div style={{ background: '#0D0E14', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.5)' }}>
          {/* Top bar */}
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: '#181B26', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
          </div>
          {/* Content */}
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Profile row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: 16, flexShrink: 0 }}>VN</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 4, width: '60%', marginBottom: 6 }} />
                <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, width: '40%' }} />
              </div>
              <div style={{ padding: '4px 10px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 4 }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#06B6D4', letterSpacing: 1 }}>ÉDITER</span>
              </div>
            </div>
            {/* Link rows */}
            {[
              { icon: '📞', label: '+229 XX XX XX XX', color: '#22C55E' },
              { icon: '💼', label: 'linkedin.com/in/vous', color: '#818CF8' },
              { icon: '🌐', label: 'votresite.com', color: '#06B6D4' },
            ].map((link) => (
              <div key={link.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px' }}>
                <span style={{ fontSize: 14 }}>{link.icon}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9CA3AF', flex: 1 }}>{link.label}</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: link.color }} />
              </div>
            ))}
            {/* Module toggles */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {[
                { name: 'Fidélité', on: true },
                { name: 'Menu', on: true },
                { name: 'Avis', on: false },
                { name: 'Événement', on: false },
              ].map((m) => (
                <div key={m.name} style={{ padding: '4px 10px', borderRadius: 6, background: m.on ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${m.on ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: m.on ? '#06B6D4' : '#6B7280', letterSpacing: 0.5 }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* "Temps réel" badge */}
        <div style={{ position: 'absolute', top: -12, right: -12, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.35)', borderRadius: 10, padding: '7px 14px', backdropFilter: 'blur(10px)' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#06B6D4', letterSpacing: 1 }}>⚡ TEMPS RÉEL</span>
        </div>
      </div>
    ),
  },
  {
    number: '03',
    title: 'Partagez',
    desc: 'Approchez votre carte. Le profil s\'ouvre instantanément sur n\'importe quel smartphone iOS ou Android. Zéro application requise. Zéro friction.',
    accent: '#8B5CF6',
    visual: (
      <div style={{ position: 'relative', width: '100%', maxWidth: 320, margin: '0 auto' }}>
        {/* Phone mockup */}
        <div style={{ background: '#1a1a2e', border: '2px solid rgba(139,92,246,0.3)', borderRadius: 36, padding: '16px 12px', boxShadow: '0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139,92,246,0.1)', position: 'relative' }}>
          {/* Notch */}
          <div style={{ width: 80, height: 24, background: '#0D0E14', borderRadius: 12, margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
          </div>
          {/* Screen content */}
          <div style={{ background: '#0D0E14', borderRadius: 20, overflow: 'hidden', padding: 16 }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: 20 }}>SM</div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#F8F9FC', margin: 0 }}>Sophie Martin</p>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase', margin: '4px 0 0' }}>CEO & Founder</p>
            </div>
            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[{ icon: '📞', label: 'Appeler' }, { icon: '✉️', label: 'Mail' }, { icon: '💬', label: 'WhatsApp' }].map((b) => (
                <div key={b.label} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, marginBottom: 2 }}>{b.icon}</div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 8, color: '#9CA3AF', margin: 0 }}>{b.label}</p>
                </div>
              ))}
            </div>
            {/* Social links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[{ icon: '💼', label: 'LinkedIn', color: '#818CF8' }, { icon: '🌐', label: 'Portfolio', color: '#06B6D4' }].map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '7px 10px' }}>
                  <span style={{ fontSize: 12 }}>{s.icon}</span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: s.color, flex: 1 }}>{s.label}</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280' }}>↗</span>
                </div>
              ))}
            </div>
          </div>
          {/* Home bar */}
          <div style={{ width: 80, height: 4, background: 'rgba(255,255,255,0.2)', borderRadius: 2, margin: '16px auto 0' }} />
        </div>

        {/* NFC tap indicator */}
        <div style={{ position: 'absolute', bottom: -20, right: -20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, animation: 'pulseGlow 2s ease-in-out infinite' }}>
            📶
          </div>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: '#8B5CF6', letterSpacing: 2, textTransform: 'uppercase', textAlign: 'center' }}>NFC</span>
        </div>
      </div>
    ),
  },
];

function StepRow({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const isEven  = index % 2 === 0;
  const { ref, visible } = useScrollReveal();

  return (
    <div
      ref={ref}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 80,
        alignItems: 'center',
        marginBottom: 100,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.8s cubic-bezier(0.23,1,0.32,1)',
      }}
      className="steps-alt-row"
    >
      {/* Text */}
      <div style={{ order: isEven ? 0 : 1 }} className="steps-alt-text">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 11, letterSpacing: 3, color: step.accent, textTransform: 'uppercase' }}>
            Étape {step.number}
          </span>
          <div style={{ height: 1, width: 40, background: step.accent, opacity: 0.4 }} />
        </div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 3vw, 40px)', letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 20, lineHeight: 1.1 }}>
          {step.title}
        </h3>
        <p style={{ color: '#9CA3AF', fontSize: 17, lineHeight: 1.85, maxWidth: 440 }}>
          {step.desc}
        </p>

        {/* Number badge */}
        <div style={{ marginTop: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 16, background: `${step.accent}15`, border: `1px solid ${step.accent}30` }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, background: `linear-gradient(135deg, ${step.accent}, #06B6D4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {step.number}
          </span>
        </div>
      </div>

      {/* Visual */}
      <div style={{ order: isEven ? 1 : 0, display: 'flex', justifyContent: 'center' }} className="steps-alt-visual">
        {step.visual}
      </div>
    </div>
  );
}

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="section-responsive" style={{ padding: '100px 40px', background: '#0D0E14', position: 'relative', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.35 }} />
      {/* Ambient glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 88 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#06B6D4', textTransform: 'uppercase', marginBottom: 16 }}>
            Comment ça marche
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 52px)', letterSpacing: '-1.5px', color: '#F8F9FC', marginBottom: 20 }}>
            Trois étapes. C&apos;est tout.
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
            De la commande au premier partage, tout se fait en quelques minutes.
          </p>
        </div>

        {/* Steps */}
        {STEPS.map((step, i) => (
          <StepRow key={step.number} step={step} index={i} />
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .steps-alt-row  { grid-template-columns: 1fr !important; gap: 40px !important; }
          .steps-alt-text { order: 0 !important; }
          .steps-alt-visual { order: 1 !important; }
        }
      `}</style>
    </section>
  );
}
