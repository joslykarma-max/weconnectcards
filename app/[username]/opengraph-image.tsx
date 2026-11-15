import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { adminDb } from '@/lib/firebase-admin';
import { resolveUsername } from '@/lib/profiles';
import { EDITIONS } from '@/lib/editions';
import type { ProfileDoc } from '@/lib/types';

// The picture WhatsApp, Facebook, LinkedIn… show when a profile link is shared.
export const alt = 'Carte de visite We Connect';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const fontsReady = Promise.all([
  readFile(join(process.cwd(), 'assets/og/PlusJakartaSans-ExtraBold.ttf')),
  readFile(join(process.cwd(), 'assets/og/DMSans-Medium.ttf')),
]);

/** The avatar as a data URI (JPEG/PNG only, small, fast) — or null to show the initial instead. */
async function avatarData(url: string | undefined): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) return null;
  try {
    const res  = await fetch(url, { signal: AbortSignal.timeout(3000) });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 3_000_000) return null;
    return `data:${type.split(';')[0]};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [jakarta, dmSans] = await fontsReady;
  const fonts = [
    { name: 'Jakarta', data: jakarta, weight: 800 as const, style: 'normal' as const },
    { name: 'DM Sans', data: dmSans,  weight: 500 as const, style: 'normal' as const },
  ];

  const resolved = await resolveUsername(username).catch(() => null);
  const snap     = resolved ? await adminDb.collection('profiles').doc(resolved.profileId).get() : null;
  const profile  = snap?.exists ? (snap.data() as ProfileDoc) : null;
  const visible  = !!profile?.isPublic;

  const edition = EDITIONS.find((e) => e.key === profile?.theme) ?? EDITIONS[0];
  const hidden  = new Set(visible ? profile!.hiddenFields ?? [] : []);
  const name    = visible ? profile!.displayName || profile!.username : 'We Connect';
  const role    = visible
    ? [hidden.has('title') ? '' : profile!.title, hidden.has('company') ? '' : profile!.company].filter(Boolean).join(' · ')
    : 'Votre identité professionnelle, en un geste';
  const avatar  = visible && !hidden.has('avatar') ? await avatarData(profile!.avatar) : null;
  const nameSize = name.length > 30 ? 50 : name.length > 22 ? 60 : 72;

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative',
        backgroundImage: edition.card.bg, fontFamily: 'DM Sans', color: '#FFFFFF',
      }}>
        {/* soft halos in the edition accent */}
        <div style={{ position: 'absolute', top: -160, right: -120, width: 560, height: 560, borderRadius: 999, backgroundImage: `radial-gradient(circle, ${edition.card.accent}66 0%, transparent 70%)` }} />
        <div style={{ position: 'absolute', bottom: -220, left: -160, width: 600, height: 600, borderRadius: 999, backgroundImage: 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, transparent 70%)' }} />

        {/* brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '44px 56px 0' }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" />
          </svg>
          <span style={{ fontSize: 24, letterSpacing: 8, opacity: 0.85 }}>WE CONNECT</span>
        </div>

        {/* identity, centred so a square crop still shows it */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 60px 30px', textAlign: 'center' }}>
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} width={176} height={176} style={{ borderRadius: 999, border: '6px solid rgba(255,255,255,0.9)', objectFit: 'cover' }} alt="" />
          ) : (
            <div style={{
              width: 176, height: 176, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: edition.card.accent, border: '6px solid rgba(255,255,255,0.9)',
              fontFamily: 'Jakarta', fontSize: 84, color: '#FFFFFF',
            }}>
              {name.trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', fontFamily: 'Jakarta', fontSize: nameSize, lineHeight: 1.1, letterSpacing: -1, marginTop: 10 }}>{name}</div>
          {role && <div style={{ display: 'flex', fontSize: 32, opacity: 0.82 }}>{role}</div>}
          <div style={{
            display: 'flex', marginTop: 12, padding: '10px 24px', borderRadius: 999, fontSize: 26,
            backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)',
          }}>
            {visible ? `weconnect.cards/${profile!.username}` : 'weconnect.cards'}
          </div>
        </div>

        <div style={{ display: 'flex', height: 10, backgroundImage: edition.card.line }} />
      </div>
    ),
    { ...size, fonts },
  );
}
