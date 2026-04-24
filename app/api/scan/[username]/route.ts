import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getDeviceFromUA } from '@/lib/utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_URL ?? 'http://localhost:3000';

  // Resolve username → uid
  const usernameSnap = await adminDb.collection('usernames').doc(username).get();
  if (!usernameSnap.exists) return NextResponse.redirect(`${baseUrl}/404`);

  const { uid } = usernameSnap.data() as { uid: string };

  // Check profile is public
  const profileSnap = await adminDb.collection('profiles').doc(uid).get();
  if (!profileSnap.exists || !(profileSnap.data() as { isPublic?: boolean }).isPublic) {
    return NextResponse.redirect(`${baseUrl}/404`);
  }

  const ua     = req.headers.get('user-agent') ?? '';
  const device = getDeviceFromUA(ua);

  adminDb.collection('scans').add({
    userId:    uid,
    device,
    userAgent: ua.slice(0, 512),
    scannedAt: new Date().toISOString(),
  }).catch(() => {});

  return NextResponse.redirect(`${baseUrl}/${username}`);
}
