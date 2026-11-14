import type { Viewport } from 'next';
import Nav         from '@/components/landing/Nav';
import HeroSection from '@/components/landing/hero/HeroSection';
import Showcase    from '@/components/landing/Showcase';
import HowItWorks  from '@/components/landing/HowItWorks';
import Features    from '@/components/landing/Features';
import Modules     from '@/components/landing/Modules';
import Pricing     from '@/components/landing/Pricing';
import CTA         from '@/components/landing/CTA';
import Footer      from '@/components/landing/Footer';
import MarketingFonts from '@/components/landing/MarketingFonts';

// Let the hero paint behind notches; header and hero pad themselves with safe-area insets
export const viewport: Viewport = { viewportFit: 'cover' };

export default function LandingPage() {
  return (
    <div className="wc-landing">
      <MarketingFonts />
      <Nav />
      <main>
        <HeroSection />
        <Showcase />
        <HowItWorks />
        <Features />
        <Modules />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
