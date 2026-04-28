import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import EventDashboard from './EventDashboard';
import type { ModuleDoc, TicketType, AgendaItem, EventRegistration } from '@/lib/types';

export default async function EventPage() {
  const user = await requireAuth();

  const snap = await adminDb.collection('modules').doc(`${user.uid}_event`).get();
  const config = snap.exists ? ((snap.data() as ModuleDoc).config ?? {}) : {};

  const regSnap = await adminDb.collection('eventRegistrations')
    .where('profileId', '==', user.uid)
    .get();
  const registrations: EventRegistration[] = regSnap.docs.map(d => d.data() as EventRegistration);

  return (
    <EventDashboard
      initialInfo={{
        eventName:           String(config.eventName           ?? ''),
        organizer:           String(config.organizer           ?? ''),
        date:                String(config.date                ?? ''),
        time:                String(config.time                ?? ''),
        venue:               String(config.venue               ?? ''),
        description:         String(config.description         ?? ''),
        emoji:               String(config.emoji               ?? '🎟️'),
        currency:            String(config.currency            ?? 'FCFA'),
        whatsapp:            String(config.whatsapp            ?? ''),
        registrationEnabled: config.registrationEnabled !== false,
      }}
      initialTickets={(config.tickets  as TicketType[] | undefined) ?? []}
      initialAgenda={(config.agenda    as AgendaItem[]  | undefined) ?? []}
      initialPosters={(config.posters  as string[]      | undefined) ?? []}
      initialRegistrations={registrations}
    />
  );
}
