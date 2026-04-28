import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getDeviceFromUA } from '@/lib/utils';

export async function POST(req: NextRequest) {
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
