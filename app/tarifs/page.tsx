import Nav from '@/components/landing/Nav';
import Pricing from '@/components/landing/Pricing';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import MarketingFonts from '@/components/landing/MarketingFonts';

export const metadata = { title: 'Tarifs — We Connect' };

export default function TarifsPage() {
  return (
    <>
      <MarketingFonts />
      <Nav />
      <main style={{ paddingTop: 80 }}>
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
