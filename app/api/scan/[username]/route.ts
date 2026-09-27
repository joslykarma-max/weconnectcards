import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { resolveUsername } from '@/lib/profiles';
import { getDeviceFromUA } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

  // Resolve username → uid
  const resolved = await resolveUsername(username);
  if (!resolved) return NextResponse.redirect(`${baseUrl}/`);

  const { uid, profileId } = resolved;

  // Check profile is public
  const profileSnap = await adminDb.collection('profiles').doc(profileId).get();
  if (!profileSnap.exists || !(profileSnap.data() as { isPublic?: boolean }).isPublic) {
    return NextResponse.redirect(`${baseUrl}/`);
  }

  const ua     = req.headers.get('user-agent') ?? '';
  const device = getDeviceFromUA(ua);

  adminDb.collection('scans').add({
    userId:    uid,
    ...(profileId !== uid ? { profileId } : {}),
    device,
    userAgent: ua.slice(0, 512),
    scannedAt: new Date().toISOString(),
  }).catch(() => {});

  return NextResponse.redirect(`${baseUrl}/${username}`);
}
