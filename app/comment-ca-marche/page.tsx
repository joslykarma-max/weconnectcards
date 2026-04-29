import Nav from '@/components/landing/Nav';
import HowItWorks from '@/components/landing/HowItWorks';
import CTA from '@/components/landing/CTA';
import Footer from '@/components/landing/Footer';

export const metadata = { title: 'Comment ça marche — We Connect' };

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: 80 }}>
        <HowItWorks />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
