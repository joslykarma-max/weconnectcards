import Nav from '@/components/landing/Nav';
import Features from '@/components/landing/Features';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';
import MarketingFonts from '@/components/landing/MarketingFonts';

export const metadata = { title: 'Features — We Connect' };

export default function FeaturesPage() {
  return (
    <>
      <MarketingFonts />
      <Nav />
      <main style={{ paddingTop: 80 }}>
        <Features />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
