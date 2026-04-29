import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getDeviceFromUA } from '@/lib/utils';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIp(req), 60, 60_000)) {
    return NextResponse.json({ ok: true }); // silent drop — don't expose to client
  }

  const { linkId, profileId } = await req.json() as { linkId: string; profileId?: string };
  if (!linkId) return NextResponse.json({ error: 'Missing linkId' }, { status: 400 });

  const ua     = req.headers.get('user-agent') ?? '';
  const device = getDeviceFromUA(ua);

  adminDb.collection('linkClicks').add({
    linkId,
    profileId: profileId ?? '',
    device,
    clickedAt: new Date().toISOString(),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
