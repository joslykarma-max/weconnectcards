import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

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

const themeInitScript = `
try {
  if (localStorage.getItem('wc-theme') === 'light') {
    document.documentElement.classList.add('light');
  }
} catch(e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full antialiased">
        {children}
      </body>
    </html>
  );
}
