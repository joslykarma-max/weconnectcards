import Nav       from '@/components/landing/Nav';
import Hero       from '@/components/landing/Hero';
import Showcase   from '@/components/landing/Showcase';
import HowItWorks from '@/components/landing/HowItWorks';
import Features   from '@/components/landing/Features';
import Modules    from '@/components/landing/Modules';
import Pricing    from '@/components/landing/Pricing';
import CTA        from '@/components/landing/CTA';
import Footer     from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div style={{ background: '#FFFFFF' }}>
      <Nav />
      <main>
        <Hero />
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
