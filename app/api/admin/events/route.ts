import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminAuth } from '@/lib/firebase-admin';
import { eventsCol } from '@/lib/events-server';
import { localInputToIso, shortId, type EventDoc } from '@/lib/events';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** We Connect creates an event for an organiser (who must have a We Connect account). */
export async function POST(req: NextRequest) {
  await requireAdmin();
  const body = await req.json().catch(() => ({})) as Record<string, string>;
  const name    = (body.name ?? '').trim().slice(0, 80);
  const venue   = (body.venue ?? '').trim().slice(0, 120);
  const opensAt = localInputToIso(body.opensAt ?? '');
  const endsAt  = localInputToIso(body.endsAt ?? '');
  if (!name) return bad('Nom de l’événement requis.');
  if (!opensAt || !endsAt || endsAt <= opensAt) return bad('Dates invalides : la fin doit suivre l’ouverture des portes.');

  let organizerUid = '';
  let organizerName = '';
  try {
    const u = await adminAuth.getUserByEmail((body.organizerEmail ?? '').trim().toLowerCase());
    organizerUid  = u.uid;
    organizerName = u.displayName ?? u.email ?? '';
  } catch {
    return bad('Aucun compte We Connect avec cet e-mail : l’organisateur doit d’abord créer son compte.');
  }

  const zoneId = shortId();
  const event: EventDoc = {
    name, organizerUid, organizerName, venue, opensAt, endsAt,
    description: '', posterUrl: null, program: [], links: [],
    zones: [{ id: zoneId, name: 'Entrée principale' }],
    categories: [{ id: shortId(), name: 'Standard', color: '#6366F1', zoneIds: [], entryRule: 'single', requiresTicket: false, validFrom: null, validTo: null }],
    status: 'active', staffKeyHash: null, serials: {},
    createdAt: new Date().toISOString(),
  };
  const ref = await eventsCol().add(event);
  return NextResponse.json({ id: ref.id });
}
