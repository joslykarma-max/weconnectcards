import type { Viewport } from 'next';
import Nav         from '@/components/landing/Nav';
import HeroSection from '@/components/landing/hero/HeroSection';
import HowItWorks  from '@/components/landing/HowItWorks';
import Features    from '@/components/landing/Features';
import Pricing     from '@/components/landing/Pricing';
import CTA         from '@/components/landing/CTA';
import Footer      from '@/components/landing/Footer';

// Let the hero paint behind notches; header and hero pad themselves with safe-area insets
export const viewport: Viewport = { viewportFit: 'cover' };

export default function LandingPage() {
  return (
    <div className="wc-landing">
      <Nav />
      <main>
        <HeroSection />
        <HowItWorks />
        <Features />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
