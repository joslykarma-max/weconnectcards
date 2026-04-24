'use client';
const steps = [
  {
    number: '01',
    title: 'Commander',
    desc: 'Choisissez votre édition de carte NFC et passez commande en ligne. Livraison rapide à votre adresse.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Configurer',
    desc: 'Personnalisez votre profil digital depuis le dashboard. Photo, liens, modules métier, thème de carte.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 20h9"/>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Partager',
    desc: 'Approchez votre carte du téléphone de votre interlocuteur. Votre profil s\'ouvre instantanément.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '100px 40px', background: '#0D0E14', position: 'relative', overflow: 'hidden' }}>
      {/* Subtle grid */}
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#06B6D4', textTransform: 'uppercase', marginBottom: 16 }}>
            Processus
          </p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#F8F9FC' }}>
            Trois étapes. C&apos;est tout.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48, position: 'relative' }}>
          {/* Connecting line */}
          <div style={{
            position: 'absolute',
            top: 32,
            left: '16.66%',
            right: '16.66%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4), transparent)',
          }} />

          {steps.map((step, i) => (
            <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
              {/* Number badge */}
              <div style={{
                width: 64, height: 64,
                margin: '0 auto 28px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.15))',
                border: '1px solid rgba(99,102,241,0.3)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#818CF8',
                position: 'relative',
              }}>
                {step.icon}
                <span style={{
                  position: 'absolute',
                  top: -10, right: -10,
                  background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  color: '#fff',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: 1,
                  padding: '2px 7px',
                  borderRadius: 3,
                }}>
                  {step.number}
                </span>
              </div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#F8F9FC', marginBottom: 14 }}>
                {step.title}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: 15, lineHeight: 1.8 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
