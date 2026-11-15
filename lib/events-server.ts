// Server-side helpers for the « Pass Événement » (see lib/events.ts for the model).
import { createHash, randomInt } from 'node:crypto';
import { cookies } from 'next/headers';
import { getSession } from './session';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import {
  decideEntry, type Decision, type DeviceMode, type EventCategory, type EventDeviceDoc, type EventDoc,
  type EventEntryDoc, type EventPassDoc, type SupportType,
} from './events';

export const APP_URL = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards').replace(/\/$/, '');
export const DEVICE_COOKIE = 'wc_device';

export const eventsCol  = () => adminDb.collection('events');
export const passesCol  = () => adminDb.collection('eventPasses');
export const devicesCol = () => adminDb.collection('eventDevices');

export type EventWithId  = EventDoc & { id: string };
export type PassWithCode = EventPassDoc & { code: string };
export type DeviceWithId = EventDeviceDoc & { id: string };

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I

export function randomToken(length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

export const passUrl = (code: string) => `${APP_URL}/p/${code}`;

export function isPassCode(code: string): boolean {
  return /^[A-HJ-NP-Z2-9]{10}$/.test(code);
}

export async function isAdminUid(uid: string): Promise<boolean> {
  const envAdmins = (process.env.ADMIN_UIDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (envAdmins.includes(uid)) return true;
  return (await adminDb.collection('admins').doc(uid).get()).exists;
}

export async function loadEvent(id: string): Promise<EventWithId | null> {
  if (!id || id.includes('/')) return null;
  const snap = await eventsCol().doc(id).get();
  return snap.exists ? ({ id: snap.id, ...(snap.data() as EventDoc) }) : null;
}

/** The organiser of the event, or a We Connect admin. */
export async function canManageEvent(uid: string, event: EventDoc): Promise<boolean> {
  return event.organizerUid === uid || isAdminUid(uid);
}

export async function loadPass(code: string): Promise<PassWithCode | null> {
  if (!isPassCode(code)) return null;
  const snap = await passesCol().doc(code).get();
  return snap.exists ? ({ code: snap.id, ...(snap.data() as EventPassDoc) }) : null;
}

/** The staff phone this request comes from, when it is enrolled and not revoked. */
export async function currentDevice(): Promise<DeviceWithId | null> {
  const token = (await cookies()).get(DEVICE_COOKIE)?.value;
  if (!token || token.length < 20) return null;
  const snap = await devicesCol().doc(sha256(token)).get();
  if (!snap.exists) return null;
  const device = snap.data() as EventDeviceDoc;
  return device.revoked ? null : { id: snap.id, ...device };
}

// ── Passes ───────────────────────────────────────────────────────────────────

export async function createPasses(eventId: string, input: {
  categoryId: string; quantity: number; support: SupportType; prefix: string;
}): Promise<{ batchId: string; first: string; last: string; count: number }> {
  const eventRef = eventsCol().doc(eventId);
  // Reserve a range of serial numbers for this prefix
  const start = await adminDb.runTransaction(async (t) => {
    const event = (await t.get(eventRef)).data() as EventDoc | undefined;
    if (!event) throw new Error('EVENT_NOT_FOUND');
    if (!event.categories.some((c) => c.id === input.categoryId)) throw new Error('CATEGORY_NOT_FOUND');
    const used = event.serials?.[input.prefix] ?? 0;
    t.update(eventRef, { [`serials.${input.prefix}`]: used + input.quantity, updatedAt: new Date().toISOString() });
    return used + 1;
  });

  const batchId = randomToken(8);
  const now     = new Date().toISOString();
  const width   = Math.max(4, String(start + input.quantity - 1).length);
  const serial  = (n: number) => `${input.prefix}-${String(n).padStart(width, '0')}`;

  for (let offset = 0; offset < input.quantity; offset += 400) {
    const batch = adminDb.batch();
    for (let i = offset; i < Math.min(offset + 400, input.quantity); i++) {
      const pass: EventPassDoc = {
        eventId, categoryId: input.categoryId, serial: serial(start + i), support: input.support, batchId,
        status: 'active', holderName: null, ticketRef: null, associatedAt: null,
        entered: false, inside: false, zonesEntered: [], insideZones: [], entriesCount: 0,
        firstEntryAt: null, lastEntryAt: null, lastZoneId: null, lastDeviceId: null, createdAt: now,
      };
      batch.create(passesCol().doc(randomToken(10)), pass);   // create() fails on the (astronomically rare) duplicate code
    }
    await batch.commit();
  }
  return { batchId, first: serial(start), last: serial(start + input.quantity - 1), count: input.quantity };
}

export async function listPasses(eventId: string): Promise<PassWithCode[]> {
  const snap = await passesCol().where('eventId', '==', eventId).get();
  return snap.docs
    .map((d) => ({ code: d.id, ...(d.data() as EventPassDoc) }))
    .sort((a, b) => a.serial.localeCompare(b.serial, 'fr', { numeric: true }));
}

// ── Check-in ─────────────────────────────────────────────────────────────────

export interface CheckInResult {
  decision: Decision;
  pass:     PassWithCode;
  category: EventCategory;
  at:       string;
}

/** Applies the entry rule for a tap on a staff phone and records it. */
export async function checkIn(event: EventWithId, code: string, device: DeviceWithId): Promise<CheckInResult | null> {
  const passRef   = passesCol().doc(code);
  const deviceRef = devicesCol().doc(device.id);

  return adminDb.runTransaction(async (t) => {
    const snap = await t.get(passRef);
    if (!snap.exists) return null;
    const pass     = { code, ...(snap.data() as EventPassDoc) };
    const category = event.categories.find((c) => c.id === pass.categoryId);
    if (pass.eventId !== event.id || !category) return null;

    const now      = new Date();
    const at       = now.toISOString();
    const decision = decideEntry({ event, category, pass, device, now });

    if (decision.ok && decision.repeat) return { decision, pass, category, at: pass.lastEntryAt ?? at };

    const entry: EventEntryDoc = {
      passCode: code, serial: pass.serial, categoryId: pass.categoryId, zoneId: device.zoneId,
      deviceId: device.id, deviceName: device.name,
      direction: decision.ok ? decision.direction : 'in',
      result: decision.ok ? 'granted' : 'denied',
      reason: decision.ok ? null : decision.reason,
      holderName: pass.holderName, at,
    };
    t.create(eventsCol().doc(event.id).collection('entries').doc(), entry);
    t.update(deviceRef, { scans: FieldValue.increment(1), lastSeenAt: at });

    if (decision.ok && decision.direction === 'in') {
      const insideZones = [...new Set([...pass.insideZones, device.zoneId])];
      t.update(passRef, {
        entered: true,
        inside:  true,
        zonesEntered: [...new Set([...pass.zonesEntered, device.zoneId])],
        insideZones,
        entriesCount: FieldValue.increment(1),
        firstEntryAt: pass.firstEntryAt ?? at,
        lastEntryAt:  at,
        lastZoneId:   device.zoneId,
        lastDeviceId: device.id,
      });
    } else if (decision.ok) {
      const insideZones = pass.insideZones.filter((z) => z !== device.zoneId);
      t.update(passRef, { insideZones, inside: insideZones.length > 0 });
    }
    return { decision, pass, category, at };
  });
}

// ── Desk: link a ticket bought on a ticketing platform to a pass ─────────────

export type AssociateError = 'pass_not_found' | 'wrong_event' | 'pass_disabled' | 'already_linked' | 'ticket_used';

export async function associateTicket(event: EventWithId, code: string, rawTicket: string, holderName: string | null)
  : Promise<{ ok: true; serial: string } | { ok: false; error: AssociateError; serial?: string }> {
  const ticketRef = rawTicket.trim().slice(0, 300);
  const passRef   = passesCol().doc(code);
  const ticketKey = eventsCol().doc(event.id).collection('tickets').doc(sha256(ticketRef.toUpperCase()));

  return adminDb.runTransaction(async (t) => {
    const [passSnap, ticketSnap] = await Promise.all([t.get(passRef), t.get(ticketKey)]);
    if (!passSnap.exists) return { ok: false, error: 'pass_not_found' } as const;
    const pass = passSnap.data() as EventPassDoc;
    if (pass.eventId !== event.id)  return { ok: false, error: 'wrong_event' } as const;
    if (pass.status === 'disabled') return { ok: false, error: 'pass_disabled' } as const;
    if (pass.ticketRef)             return { ok: false, error: 'already_linked', serial: pass.serial } as const;
    if (ticketSnap.exists) {
      const other = (ticketSnap.data() as { serial?: string }).serial;
      return { ok: false, error: 'ticket_used', serial: other } as const;
    }
    const at = new Date().toISOString();
    t.create(ticketKey, { passCode: code, serial: pass.serial, at });
    t.update(passRef, { ticketRef, holderName: holderName?.trim().slice(0, 80) || null, associatedAt: at });
    return { ok: true, serial: pass.serial } as const;
  });
}

// ── Live figures for the organiser ───────────────────────────────────────────

export interface EventStats {
  passes:     number;
  entered:    number;
  inside:     number;
  byCategory: { id: string; name: string; color: string; passes: number; entered: number }[];
  byZone:     { id: string; name: string; entries: number; denied: number }[];
  recent:     (EventEntryDoc & { id: string })[];
}

export async function eventStats(event: EventWithId): Promise<EventStats> {
  const passes  = passesCol().where('eventId', '==', event.id);
  const entries = eventsCol().doc(event.id).collection('entries');
  const count   = async (q: FirebaseFirestore.Query) => (await q.count().get()).data().count;

  const [total, entered, inside, byCategory, byZone, recentSnap] = await Promise.all([
    count(passes),
    count(passes.where('entered', '==', true)),
    count(passes.where('inside', '==', true)),
    Promise.all(event.categories.map(async (c) => ({
      id: c.id, name: c.name, color: c.color,
      passes:  await count(passes.where('categoryId', '==', c.id)),
      entered: await count(passes.where('categoryId', '==', c.id).where('entered', '==', true)),
    }))),
    Promise.all(event.zones.map(async (z) => ({
      id: z.id, name: z.name,
      entries: await count(entries.where('zoneId', '==', z.id).where('result', '==', 'granted').where('direction', '==', 'in')),
      denied:  await count(entries.where('zoneId', '==', z.id).where('result', '==', 'denied')),
    }))),
    entries.orderBy('at', 'desc').limit(25).get(),
  ]);

  return {
    passes: total,
    entered,
    inside,
    byCategory,
    byZone,
    recent: recentSnap.docs.map((d) => ({ id: d.id, ...(d.data() as EventEntryDoc) })),
  };
}

export function isDeviceMode(v: unknown): v is DeviceMode {
  return v === 'entree' || v === 'sortie' || v === 'guichet';
}

/** API guard: the signed-in organiser of this event, or a We Connect admin. */
export async function eventForManager(id: string): Promise<{ event: EventWithId } | { error: string; status: number }> {
  const session = await getSession();
  if (!session) return { error: 'Non connecté.', status: 401 };
  const event = await loadEvent(id);
  if (!event) return { error: 'Événement introuvable.', status: 404 };
  if (!(await canManageEvent(session.uid, event))) return { error: 'Accès refusé.', status: 403 };
  return { event };
}
