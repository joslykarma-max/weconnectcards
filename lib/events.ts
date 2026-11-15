// « Pass Événement » — We Connect designs, configures and sells NFC supports (cards,
// wristbands, badges) to event organisers. It is not a ticketing platform: tickets are
// sold elsewhere; a pass can be anonymous (its category is the right of entry) or linked
// to a ticket at the welcome desk.
//
// Collections (server-only, see firestore.rules):
//   events/{eventId}                        EventDoc
//   events/{eventId}/entries/{autoId}       EventEntryDoc   (one per check-in / check-out)
//   events/{eventId}/tickets/{hash}         { passCode, at } (a ticket can open one pass only)
//   eventPasses/{code}                      EventPassDoc    (code = what the NFC tag holds)
//   eventDevices/{sha256(cookie token)}     EventDeviceDoc  (staff phones in « mode contrôle »)
//
// This file is shared by server and client code: types, labels and the entry rule only.

export const EVENT_TZ = 'Africa/Porto-Novo'; // Bénin, UTC+1 all year

export type SupportType = 'carte' | 'bracelet' | 'badge';
export type EntryRule   = 'single' | 'reentry' | 'unlimited';
export type DeviceMode  = 'entree' | 'sortie' | 'guichet';

export interface EventZone     { id: string; name: string }
export interface EventLink     { label: string; url: string }
export interface EventProgram  { time: string; title: string; speaker?: string }

export interface EventCategory {
  id:             string;
  name:           string;
  color:          string;
  zoneIds:        string[];       // zones this category may enter; empty = all
  entryRule:      EntryRule;
  requiresTicket: boolean;        // must be linked to a ticket at the desk before entry
  validFrom?:     string | null;  // ISO; overrides the event window (e.g. « Jour 1 »)
  validTo?:       string | null;
}

export interface EventDoc {
  name:          string;
  organizerUid:  string;
  organizerName: string;
  venue:         string;
  opensAt:       string;          // ISO — doors open
  endsAt:        string;          // ISO
  description:   string;
  posterUrl:     string | null;
  program:       EventProgram[];
  links:         EventLink[];
  zones:         EventZone[];
  categories:    EventCategory[];
  status:        'active' | 'archived';
  staffKeyHash:  string | null;   // sha256 of the current staff link key
  serials:       Record<string, number>; // last serial number used per prefix
  createdAt:     string;
  updatedAt?:    string;
}

export interface EventPassDoc {
  eventId:       string;
  categoryId:    string;
  serial:        string;          // printed on the support, e.g. VIP-0042
  support:       SupportType;
  batchId:       string;
  status:        'active' | 'disabled';
  holderName:    string | null;
  ticketRef:     string | null;
  associatedAt:  string | null;
  entered:       boolean;
  inside:        boolean;         // currently inside at least one zone
  zonesEntered:  string[];
  insideZones:   string[];
  entriesCount:  number;
  firstEntryAt:  string | null;
  lastEntryAt:   string | null;   // last granted entry
  lastZoneId:    string | null;
  lastDeviceId:  string | null;
  createdAt:     string;
}

export interface EventDeviceDoc {
  eventId:    string;
  name:       string;
  mode:       DeviceMode;
  zoneId:     string;
  scans:      number;
  revoked:    boolean;
  createdAt:  string;
  lastSeenAt: string | null;
}

export interface EventEntryDoc {
  passCode:    string;
  serial:      string;
  categoryId:  string;
  zoneId:      string;
  deviceId:    string;
  deviceName:  string;
  direction:   'in' | 'out';
  result:      'granted' | 'denied';
  reason:      DenyReason | null;
  holderName:  string | null;
  at:          string;
}

// ── Entry rule ───────────────────────────────────────────────────────────────

export type DenyReason = 'archived' | 'disabled' | 'not_yet' | 'expired' | 'zone' | 'not_associated' | 'already' | 'inside';

export type Decision =
  | { ok: true;  direction: 'in' | 'out'; repeat: boolean }
  | { ok: false; reason: DenyReason };

/** The same phone re-opening the same pass this soon is a reload, not a second entry. */
export const REPEAT_WINDOW_MS = 2 * 60 * 1000;

/** What the gate says when `pass` is tapped on `device` at `now`. Pure: no I/O. */
export function decideEntry(input: {
  event:    Pick<EventDoc, 'status' | 'opensAt' | 'endsAt'>;
  category: EventCategory;
  pass:     Pick<EventPassDoc, 'status' | 'ticketRef' | 'zonesEntered' | 'insideZones' | 'lastEntryAt' | 'lastZoneId' | 'lastDeviceId'>;
  device:   { id: string; mode: DeviceMode; zoneId: string };
  now:      Date;
}): Decision {
  const { event, category, pass, device, now } = input;
  if (event.status === 'archived') return { ok: false, reason: 'archived' };
  if (device.mode === 'sortie')    return { ok: true, direction: 'out', repeat: false };   // leaving is always allowed
  if (pass.status === 'disabled')  return { ok: false, reason: 'disabled' };

  const from = new Date(category.validFrom || event.opensAt);
  const to   = new Date(category.validTo   || event.endsAt);
  if (now < from) return { ok: false, reason: 'not_yet' };
  if (now > to)   return { ok: false, reason: 'expired' };

  if (category.zoneIds.length > 0 && !category.zoneIds.includes(device.zoneId)) return { ok: false, reason: 'zone' };
  if (category.requiresTicket && !pass.ticketRef) return { ok: false, reason: 'not_associated' };

  const last = pass.lastEntryAt ? new Date(pass.lastEntryAt).getTime() : 0;
  if (pass.lastDeviceId === device.id && pass.lastZoneId === device.zoneId && now.getTime() - last < REPEAT_WINDOW_MS) {
    return { ok: true, direction: 'in', repeat: true };
  }
  if (category.entryRule === 'single'  && pass.zonesEntered.includes(device.zoneId)) return { ok: false, reason: 'already' };
  if (category.entryRule === 'reentry' && pass.insideZones.includes(device.zoneId))  return { ok: false, reason: 'inside' };
  return { ok: true, direction: 'in', repeat: false };
}

// ── Labels (French UI) ───────────────────────────────────────────────────────

export const SUPPORT_LABELS: Record<SupportType, string> = { carte: 'Carte', bracelet: 'Bracelet', badge: 'Badge' };
export const ENTRY_RULE_LABELS: Record<EntryRule, string> = {
  single:    'Une seule entrée',
  reentry:   'Sorties et retours (sortie scannée)',
  unlimited: 'Entrées illimitées',
};
export const DEVICE_MODE_LABELS: Record<DeviceMode, string> = { entree: 'Entrée', sortie: 'Sortie', guichet: 'Guichet (association)' };
export const DENY_LABELS: Record<DenyReason, string> = {
  archived:       'Événement terminé',
  disabled:       'Pass désactivé',
  not_yet:        'Pas encore valide',
  expired:        'Pass expiré',
  zone:           'Zone non autorisée',
  not_associated: 'Pass non associé',
  already:        'Déjà entré',
  inside:         'Déjà à l’intérieur',
};

export const CATEGORY_COLORS = ['#6366F1', '#F59E0B', '#10B981', '#EF4444', '#06B6D4', '#EC4899', '#8B5CF6', '#64748B'];

// ── Dates (events are entered and shown in Bénin time) ───────────────────────

/** « 2026-12-12T18:00 » typed in a datetime-local field (Bénin time) → ISO string. */
export function localInputToIso(value: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const d = new Date(`${value}:00+01:00`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/** ISO → value for a datetime-local field, in Bénin time. */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(new Date(iso).getTime() + 60 * 60 * 1000);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
}

export function formatEventDate(iso: string | null | undefined, withTime = true): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: EVENT_TZ, weekday: 'short', day: 'numeric', month: 'short',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(new Date(iso));
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('fr-FR', { timeZone: EVENT_TZ, hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** Short unique id for zones / categories. */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 8);
}
