import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdmin } from '@/lib/admin-auth';
import { loadEvent, passesCol } from '@/lib/events-server';
import ContentEditor from '@/components/events/ContentEditor';
import EventConfigForm from './EventConfigForm';
import PassBatches from './PassBatches';
import ui from '@/components/events/manage.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await loadEvent(id);
  if (!event) notFound();

  const counts = await Promise.all(event.categories.map(async (c) => ({
    id: c.id,
    count: (await passesCol().where('eventId', '==', id).where('categoryId', '==', c.id).count().get()).data().count,
  })));

  return (
    <div className={ui.stack} style={{ maxWidth: 980 }}>
      <div className={ui.cardHead}>
        <div>
          <Link href="/admin/events" className={ui.sub}>← Événements</Link>
          <h1 className={ui.h1}>{event.name}</h1>
          <p className={ui.sub}>Organisateur : {event.organizerName}</p>
        </div>
        <Link href={`/dashboard/events/${id}`} className={ui.ghost}>Vue organisateur (direct, staff) ↗</Link>
      </div>

      <section className={ui.card}>
        <h2 className={ui.h2}>Supports NFC</h2>
        <PassBatches eventId={id} categories={event.categories.map((c) => ({ id: c.id, name: c.name, color: c.color, count: counts.find((x) => x.id === c.id)?.count ?? 0 }))} />
      </section>

      <section className={ui.card}>
        <h2 className={ui.h2}>Configuration</h2>
        <EventConfigForm event={event} />
      </section>

      <section className={ui.card}>
        <h2 className={ui.h2}>Contenu du pass (vu par les invités)</h2>
        <ContentEditor eventId={id} initial={{ description: event.description, posterUrl: event.posterUrl, program: event.program, links: event.links }} />
      </section>
    </div>
  );
}
