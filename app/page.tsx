import Nav from '@/components/landing/Nav';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Features from '@/components/landing/Features';
import Modules from '@/components/landing/Modules';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

/* Stats bar */
function StatsBar() {
  const stats = [
    { value: '10 000+', label: 'Cartes actives' },
    { value: '0 g',     label: 'Papier utilisé' },
    { value: '3 s',     label: 'Pour partager' },
    { value: '∞',       label: 'Mises à jour' },
  ];

  return (
    <div style={{
      background: '#0D0E14',
      borderTop:    '1px solid rgba(255,255,255,0.05)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      padding: '24px 40px',
    }}>
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: 32,
      }}>
        {stats.map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: 800,
              fontSize: 32,
              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: 4,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 9,
              letterSpacing: 3,
              color: '#6B7280',
              textTransform: 'uppercase',
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatsBar />
        <HowItWorks />
        <Features />
        <Modules />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
