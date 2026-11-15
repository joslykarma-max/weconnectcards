import { notFound } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { canManageEvent, loadEvent } from '@/lib/events-server';
import OrganizerEvent from './OrganizerEvent';

export const dynamic = 'force-dynamic';

export default async function OrganizerEventPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event || !(await canManageEvent(user.uid, event))) notFound();

  return (
    <OrganizerEvent
      event={{
        id: event.id, name: event.name, venue: event.venue, opensAt: event.opensAt, endsAt: event.endsAt,
        status: event.status, zones: event.zones,
        categories: event.categories.map((c) => ({ id: c.id, name: c.name, color: c.color })),
        content: { description: event.description, posterUrl: event.posterUrl, program: event.program, links: event.links },
      }}
    />
  );
}
