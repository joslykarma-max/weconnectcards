import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminAuth } from '@/lib/firebase-admin';
import { eventsCol, loadEvent, passesCol } from '@/lib/events-server';
import { localInputToIso } from '@/lib/events';
import { cleanCategories, cleanContent, cleanZones } from '@/lib/events-validate';

const bad = (error: string, status = 400) => NextResponse.json({ error }, { status });

/** Full configuration of an event (We Connect side). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return bad('Événement introuvable.', 404);

  const body = await req.json().catch(() => ({})) as Record<string, unknown>;
  const update: Record<string, unknown> = { ...cleanContent(body), updatedAt: new Date().toISOString() };

  if (typeof body.name === 'string')  update.name  = body.name.trim().slice(0, 80) || event.name;
  if (typeof body.venue === 'string') update.venue = body.venue.trim().slice(0, 120);
  if (body.status === 'active' || body.status === 'archived') update.status = body.status;

  const opensAt = typeof body.opensAt === 'string' ? localInputToIso(body.opensAt) : event.opensAt;
  const endsAt  = typeof body.endsAt  === 'string' ? localInputToIso(body.endsAt)  : event.endsAt;
  if (!opensAt || !endsAt || endsAt <= opensAt) return bad('Dates invalides : la fin doit suivre l’ouverture des portes.');
  update.opensAt = opensAt;
  update.endsAt  = endsAt;

  const zones = 'zones' in body ? cleanZones(body.zones) : event.zones;
  if (zones.length === 0) return bad('Gardez au moins une zone.');
  update.zones = zones;

  const categories = cleanCategories('categories' in body ? body.categories : event.categories, zones);
  if (categories.length === 0) return bad('Gardez au moins une catégorie.');
  // A category that already has passes cannot disappear
  const removed = event.categories.filter((c) => !categories.some((n) => n.id === c.id));
  if (removed.length) {
    const used = await Promise.all(removed.map(async (c) =>
      (await passesCol().where('eventId', '==', id).where('categoryId', '==', c.id).limit(1).get()).size));
    if (used.some((n) => n > 0)) return bad('Impossible de supprimer une catégorie qui a déjà des pass.');
  }
  update.categories = categories;

  if (typeof body.organizerEmail === 'string' && body.organizerEmail.trim()) {
    try {
      const u = await adminAuth.getUserByEmail(body.organizerEmail.trim().toLowerCase());
      update.organizerUid  = u.uid;
      update.organizerName = u.displayName ?? u.email ?? '';
    } catch {
      return bad('Aucun compte We Connect avec cet e-mail.');
    }
  }

  await eventsCol().doc(id).update(update);
  return NextResponse.json({ ok: true });
}
