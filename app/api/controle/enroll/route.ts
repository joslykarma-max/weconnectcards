import { NextRequest, NextResponse } from 'next/server';
import { DEVICE_COOKIE, devicesCol, isDeviceMode, loadEvent, randomToken, sha256 } from '@/lib/events-server';
import type { EventDeviceDoc } from '@/lib/events';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** A staff phone joins an event with the link shared by the organiser. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { eventId?: string; key?: string; name?: string; mode?: string; zoneId?: string } | null;
  if (!body?.eventId || !body.key) return bad('Lien incomplet.');

  const event = await loadEvent(body.eventId);
  if (!event || !event.staffKeyHash || sha256(body.key) !== event.staffKeyHash) {
    return bad('Ce lien staff n’est plus valide. Demandez un nouveau lien à l’organisateur.', 403);
  }
  if (event.status === 'archived') return bad('Cet événement est clôturé.', 403);

  const name   = (body.name ?? '').trim().slice(0, 40);
  const zoneId = event.zones.some((z) => z.id === body.zoneId) ? body.zoneId! : event.zones[0]?.id;
  if (!name) return bad('Donnez un nom à ce téléphone (ex. « Porte Nord – Awa »).');
  if (!isDeviceMode(body.mode)) return bad('Choisissez un mode.');
  if (!zoneId) return bad('Aucune zone configurée pour cet événement.');

  const token  = randomToken(32);
  const device: EventDeviceDoc = {
    eventId: event.id, name, mode: body.mode, zoneId, scans: 0, revoked: false,
    createdAt: new Date().toISOString(), lastSeenAt: null,
  };
  await devicesCol().doc(sha256(token)).set(device);

  // Valid until two days after the event (between 1 and 30 days)
  const untilEnd = Math.round((new Date(event.endsAt).getTime() - Date.now()) / 1000) + 2 * 86400;
  const maxAge   = Math.min(30 * 86400, Math.max(86400, untilEnd));

  const res = NextResponse.json({ ok: true });
  res.cookies.set(DEVICE_COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge,
  });
  return res;
}
