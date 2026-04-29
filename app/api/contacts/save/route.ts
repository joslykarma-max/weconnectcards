import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getDeviceFromUA } from '@/lib/utils';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIp(req), 5, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes.' }, { status: 429 });
  }

  const body = await req.json() as {
    profileId?: string;
    name?:      string;
    email?:     string;
    phone?:     string;
  };

  if (!body.profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 });

  const ua     = req.headers.get('user-agent') ?? '';
  const device = getDeviceFromUA(ua);

  await adminDb.collection('savedContacts').add({
    profileId: body.profileId,
    device,
    savedAt:   new Date().toISOString(),
    ...(body.name  ? { name:  body.name.trim()  } : {}),
    ...(body.email ? { email: body.email.trim().toLowerCase() } : {}),
    ...(body.phone ? { phone: body.phone.trim() } : {}),
  });

  return NextResponse.json({ ok: true });
}
