import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Share picture of the site itself (home, modules, pricing…); profiles have their own.
export const alt = 'We Connect — cartes de visite NFC premium';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const [jakarta, dmSans] = await Promise.all([
    readFile(join(process.cwd(), 'assets/og/PlusJakartaSans-ExtraBold.ttf')),
    readFile(join(process.cwd(), 'assets/og/DMSans-Medium.ttf')),
  ]);
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', color: '#FFFFFF',
        backgroundImage: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)', fontFamily: 'DM Sans',
      }}>
        <div style={{ position: 'absolute', top: -180, right: -140, width: 620, height: 620, borderRadius: 999, backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.45) 0%, transparent 70%)' }} />
        <div style={{ position: 'absolute', bottom: -240, left: -180, width: 640, height: 640, borderRadius: 999, backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.30) 0%, transparent 70%)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '48px 60px 0' }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" /></svg>
          <span style={{ fontSize: 26, letterSpacing: 8, opacity: 0.85 }}>WE CONNECT</span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, padding: '0 80px 40px', textAlign: 'center' }}>
          <div style={{ display: 'flex', fontFamily: 'Jakarta', fontSize: 70, lineHeight: 1.08, letterSpacing: -1.5 }}>Votre identité professionnelle</div>
          <div style={{ display: 'flex', fontFamily: 'Jakarta', fontSize: 70, lineHeight: 1.08, letterSpacing: -1.5, color: '#A5B4FC', marginTop: -14 }}>en un geste</div>
          <div style={{ display: 'flex', fontSize: 30, opacity: 0.82 }}>Cartes de visite NFC · bracelets et badges pour vos événements</div>
          <div style={{ display: 'flex', marginTop: 6, padding: '10px 26px', borderRadius: 999, fontSize: 26, backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}>weconnect.cards</div>
        </div>
        <div style={{ display: 'flex', height: 10, backgroundImage: 'linear-gradient(90deg, #6366F1, #06B6D4)' }} />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Jakarta', data: jakarta, weight: 800, style: 'normal' },
        { name: 'DM Sans', data: dmSans, weight: 500, style: 'normal' },
      ],
    },
  );
}
