import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { adminDb } from '@/lib/firebase-admin';
import { eventsCol, loadEvent, passesCol } from '@/lib/events-server';

/** After the tests on site: clears every entry so the passes are fresh for the event. */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) return NextResponse.json({ error: 'Événement introuvable.' }, { status: 404 });

  const passes = await passesCol().where('eventId', '==', id).where('entered', '==', true).get();
  for (let i = 0; i < passes.docs.length; i += 400) {
    const batch = adminDb.batch();
    passes.docs.slice(i, i + 400).forEach((d) => batch.update(d.ref, {
      entered: false, inside: false, zonesEntered: [], insideZones: [], entriesCount: 0,
      firstEntryAt: null, lastEntryAt: null, lastZoneId: null, lastDeviceId: null,
    }));
    await batch.commit();
  }
  await adminDb.recursiveDelete(eventsCol().doc(id).collection('entries'));
  return NextResponse.json({ ok: true, reset: passes.size });
}
