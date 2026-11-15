import { NextRequest, NextResponse } from 'next/server';
import { DEVICE_COOKIE, currentDevice, devicesCol, isDeviceMode, loadEvent } from '@/lib/events-server';

/** The staff phone changes its gate (zone) or mode. */
export async function PATCH(req: NextRequest) {
  const device = await currentDevice();
  if (!device) return NextResponse.json({ error: 'Ce téléphone n’est pas en mode contrôle.' }, { status: 401 });
  const event = await loadEvent(device.eventId);
  if (!event) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });

  const body = await req.json().catch(() => ({})) as { mode?: string; zoneId?: string; name?: string };
  const update: Record<string, string> = {};
  if (body.mode !== undefined) {
    if (!isDeviceMode(body.mode)) return NextResponse.json({ error: 'Mode invalide.' }, { status: 400 });
    update.mode = body.mode;
  }
  if (body.zoneId !== undefined) {
    if (!event.zones.some((z) => z.id === body.zoneId)) return NextResponse.json({ error: 'Zone invalide.' }, { status: 400 });
    update.zoneId = body.zoneId;
  }
  if (typeof body.name === 'string' && body.name.trim()) update.name = body.name.trim().slice(0, 40);
  await devicesCol().doc(device.id).update(update);
  return NextResponse.json({ ok: true });
}

/** Leave the « mode contrôle » on this phone. */
export async function DELETE() {
  const device = await currentDevice();
  if (device) await devicesCol().doc(device.id).update({ revoked: true });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(DEVICE_COOKIE);
  return res;
}
