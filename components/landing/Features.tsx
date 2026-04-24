'use client';
const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
        <path d="M8 12h8M12 8l4 4-4 4"/>
      </svg>
    ),
    title: 'NFC instantané',
    desc: 'Un tap suffit. Compatible tous smartphones iOS et Android sans application.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
    title: 'Profil dynamique',
    desc: 'Modifiez vos infos en temps réel. Votre carte physique, toujours à jour.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: 'Analytics détaillés',
    desc: 'Scans, clics, pays, appareils. Sachez exactement qui consulte votre profil.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
    title: 'Multi-liens',
    desc: 'Phone, WhatsApp, LinkedIn, Calendly, Portfolio. Tous vos réseaux en un profil.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <path d="M9 9h6v6H9z"/>
      </svg>
    ),
    title: 'Design sur-mesure',
    desc: '4 éditions exclusives. Midnight, Electric, Glass, Metal. Choisissez votre identité.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: 'Mode Équipe',
    desc: 'Dashboard centralisé pour vos équipes. Branding unifié, gestion simplifiée.',
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: '100px 40px', maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>
          Pourquoi We Connect
        </p>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(32px, 4vw, 48px)', letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 20 }}>
          Tout ce dont vous avez besoin.
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
          Une solution complète pour gérer et partager votre identité professionnelle.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              background: '#181B26',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: 32,
              transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              cursor: 'default',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.3)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 40px rgba(99,102,241,0.1)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
              (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 44, height: 44,
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818CF8',
              marginBottom: 20,
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC', marginBottom: 10 }}>
              {f.title}
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
