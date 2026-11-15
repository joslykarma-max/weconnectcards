import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { APP_URL, devicesCol, eventForManager, eventsCol, randomToken, sha256 } from '@/lib/events-server';
import type { EventDeviceDoc } from '@/lib/events';

export const dynamic = 'force-dynamic';

/** Staff phones enrolled for this event. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const snap = await devicesCol().where('eventId', '==', id).get();
  const devices = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as EventDeviceDoc) }))
    .filter((d) => !d.revoked)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return NextResponse.json({ devices, hasLink: !!guard.event.staffKeyHash }, { headers: { 'Cache-Control': 'no-store' } });
}

/** New staff link (the previous one stops working; enrolled phones stay enrolled). */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const guard = await eventForManager(id);
  if ('error' in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  if (guard.event.status === 'archived') return NextResponse.json({ error: 'Événement archivé.' }, { status: 400 });

  const key = randomToken(20);
  await eventsCol().doc(id).update({ staffKeyHash: sha256(key), updatedAt: new Date().toISOString() });
  const url = `${APP_URL}/controle/rejoindre?e=${encodeURIComponent(id)}&k=${key}`;
  const qrSvg = await QRCode.toString(url, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#0F172A', light: '#FFFFFF' } });
  return NextResponse.json({ url, qrSvg });
}
