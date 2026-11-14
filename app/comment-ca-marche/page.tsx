import Nav from '@/components/landing/Nav';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import MarketingFonts from '@/components/landing/MarketingFonts';

export const metadata = { title: 'Comment ça marche — We Connect' };

export default function HowItWorksPage() {
  return (
    <>
      <MarketingFonts />
      <Nav />
      <main style={{ paddingTop: 80 }}>
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
