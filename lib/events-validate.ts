// Cleans what the admin / organiser sends before it is stored in events/{id}.
import {
  CATEGORY_COLORS, shortId, type EntryRule, type EventCategory, type EventLink, type EventProgram, type EventZone,
} from './events';

const text = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const isIso = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(new Date(v).getTime());
const ENTRY_RULES: EntryRule[] = ['single', 'reentry', 'unlimited'];

export function cleanZones(raw: unknown): EventZone[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.slice(0, 20).flatMap((z) => {
    const name = text((z as EventZone)?.name, 40);
    let id = text((z as EventZone)?.id, 12).replace(/[^a-z0-9]/gi, '') || shortId();
    if (!name) return [];
    while (seen.has(id)) id = shortId();
    seen.add(id);
    return [{ id, name }];
  });
}

export function cleanCategories(raw: unknown, zones: EventZone[]): EventCategory[] {
  if (!Array.isArray(raw)) return [];
  const zoneIds = new Set(zones.map((z) => z.id));
  const seen = new Set<string>();
  return raw.slice(0, 20).flatMap((c, i) => {
    const src  = (c ?? {}) as Partial<EventCategory>;
    const name = text(src.name, 30);
    if (!name) return [];
    let id = text(src.id, 12).replace(/[^a-z0-9]/gi, '') || shortId();
    while (seen.has(id)) id = shortId();
    seen.add(id);
    const color = typeof src.color === 'string' && /^#[0-9a-f]{6}$/i.test(src.color) ? src.color : CATEGORY_COLORS[i % CATEGORY_COLORS.length];
    return [{
      id, name, color,
      zoneIds:        Array.isArray(src.zoneIds) ? src.zoneIds.filter((z): z is string => typeof z === 'string' && zoneIds.has(z)) : [],
      entryRule:      ENTRY_RULES.includes(src.entryRule as EntryRule) ? (src.entryRule as EntryRule) : 'single',
      requiresTicket: src.requiresTicket === true,
      validFrom:      isIso(src.validFrom) ? new Date(src.validFrom).toISOString() : null,
      validTo:        isIso(src.validTo)   ? new Date(src.validTo).toISOString()   : null,
    }];
  });
}

export function cleanProgram(raw: unknown): EventProgram[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 40).flatMap((p) => {
    const time  = text((p as EventProgram)?.time, 5);
    const title = text((p as EventProgram)?.title, 100);
    if (!title) return [];
    const speaker = text((p as EventProgram)?.speaker, 60);
    return [{ time: /^\d{2}:\d{2}$/.test(time) ? time : '', title, ...(speaker ? { speaker } : {}) }];
  }).sort((a, b) => a.time.localeCompare(b.time));
}

export function cleanLinks(raw: unknown): EventLink[] {
  if (!Array.isArray(raw)) return [];
  return raw.slice(0, 10).flatMap((l) => {
    const label = text((l as EventLink)?.label, 40);
    let url = text((l as EventLink)?.url, 500);
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    try { if (!label || !url || !['http:', 'https:'].includes(new URL(url).protocol)) return []; } catch { return []; }
    return [{ label, url }];
  });
}

export function cleanPosterUrl(raw: unknown): string | null {
  const url = text(raw, 1000);
  return /^https:\/\//i.test(url) ? url : null;
}

/** The organiser may only edit what guests see on their pass. */
export function cleanContent(body: Record<string, unknown>) {
  const out: Record<string, unknown> = {};
  if ('description' in body) out.description = text(body.description, 3000);
  if ('program' in body)     out.program     = cleanProgram(body.program);
  if ('links' in body)       out.links       = cleanLinks(body.links);
  if ('posterUrl' in body)   out.posterUrl   = cleanPosterUrl(body.posterUrl);
  return out;
}

export function cleanPrefix(raw: unknown): string {
  return text(raw, 8).toUpperCase().replace(/[^A-Z0-9]/g, '');
}
