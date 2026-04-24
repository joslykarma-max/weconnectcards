import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'We Connect — Your Identity. One Touch.',
  description: 'La plateforme NFC premium pour partager votre identité professionnelle en un geste. Carte intelligente + dashboard temps réel.',
  keywords: ['NFC', 'carte de visite digitale', 'profil professionnel', 'We Connect', 'technologie NFC'],
  authors: [{ name: 'We Connect' }],
  openGraph: {
    title: 'We Connect — Your Identity. One Touch.',
    description: 'Partagez votre identité professionnelle en un geste avec la carte NFC premium.',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-full antialiased" style={{ background: '#08090C', color: '#F8F9FC' }}>
        {children}
      </body>
    </html>
  );
}
