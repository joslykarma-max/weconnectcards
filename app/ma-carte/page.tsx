import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import QRCode from 'qrcode';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import { EDITIONS } from '@/lib/editions';
import type { ProfileDoc } from '@/lib/types';
import VirtualCard, { type VirtualProfile } from './VirtualCard';

export const metadata: Metadata = {
  title: 'Ma carte — We Connect',
  manifest: '/ma-carte.webmanifest',
  appleWebApp: { capable: true, title: 'Ma carte', statusBarStyle: 'default' },
  icons: { apple: '/icons/carte-180.png' },
  robots: { index: false },
};
export const viewport: Viewport = { themeColor: '#F4F7FB', viewportFit: 'cover' };

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards').replace(/\/$/, '');

/** The user's phone as a card: full-screen card with a QR code to their profile. */
export default async function MaCartePage() {
  const session = await getSession();
  if (!session) redirect('/login?redirect=/ma-carte');

  // Main profile first, then one entry per card profile
  const snap = await adminDb.collection('profiles').where('uid', '==', session.uid).get();
  const docs = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as ProfileDoc) }))
    .filter((p) => p.username)
    .sort((a, b) => (a.id === session.uid ? -1 : b.id === session.uid ? 1 : 0));

  const profiles: VirtualProfile[] = await Promise.all(docs.map(async (p) => {
    const url     = `${APP_URL}/${p.username}`;
    const edition = EDITIONS.find((e) => e.key === p.theme) ?? EDITIONS[0];
    return {
      id:          p.id,
      label:       p.label || (p.id === session.uid ? 'Profil principal' : `/${p.username}`),
      username:    p.username,
      url,
      displayName: p.displayName || p.username,
      title:       [p.title, p.company].filter(Boolean).join(' · '),
      avatar:      p.avatar ?? null,
      isPublic:    p.isPublic !== false,
      editionName: edition.name,
      cardBg:      edition.card.bg,
      accent:      edition.card.accent,
      qrSvg:       await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0F172A', light: '#FFFFFF' } }),
    };
  }));

  return <VirtualCard profiles={profiles} />;
}
