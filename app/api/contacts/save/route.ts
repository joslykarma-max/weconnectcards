import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getDeviceFromUA } from '@/lib/utils';

export async function POST(req: NextRequest) {
  const { profileId } = await req.json() as { profileId?: string };
  if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });

  const ua     = req.headers.get('user-agent') ?? '';
  const device = getDeviceFromUA(ua);

  adminDb.collection('savedContacts').add({
    profileId,
    device,
    savedAt: new Date().toISOString(),
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
