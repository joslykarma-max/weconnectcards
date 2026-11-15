import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import { eventsCol, passesCol } from '@/lib/events-server';
import { formatEventDate, type EventDoc } from '@/lib/events';
import NewEventForm from './NewEventForm';
import ui from '@/components/events/manage.module.css';

export const dynamic = 'force-dynamic';

/** We Connect: events we supply NFC passes for. */
export default async function AdminEventsPage() {
  await requireAdmin();
  const snap   = await eventsCol().orderBy('createdAt', 'desc').limit(100).get();
  const events = await Promise.all(snap.docs.map(async (d) => {
    const e = d.data() as EventDoc;
    const passes = (await passesCol().where('eventId', '==', d.id).count().get()).data().count;
    return { id: d.id, ...e, passes };
  }));

  return (
    <div className={ui.stack} style={{ maxWidth: 980 }}>
      <div>
        <h1 className={ui.h1}>Événements</h1>
        <p className={ui.sub}>Cartes, bracelets et badges NFC fournis aux organisateurs : catégories, zones, lots à encoder et contrôle des entrées.</p>
      </div>

      <section className={ui.card}>
        <h2 className={ui.h2}>Nouvel événement</h2>
        <NewEventForm />
      </section>

      <section className={ui.card}>
        <h2 className={ui.h2}>{events.length} événement{events.length > 1 ? 's' : ''}</h2>
        {events.length === 0 ? <p className={ui.sub}>Aucun événement pour l’instant.</p> : (
          <div className={ui.list}>
            {events.map((e) => (
              <Link key={e.id} href={`/admin/events/${e.id}`} className={ui.rowItem}>
                <span className={ui.rowMain}>
                  <b>{e.name}</b>
                  <small>{formatEventDate(e.opensAt)} · {e.venue || 'Lieu à préciser'} · {e.organizerName}</small>
                </span>
                <span className={ui.badge}>{e.passes} pass</span>
                <span className={`${ui.badge} ${e.status === 'active' ? ui.badgeOk : ''}`}>{e.status === 'active' ? 'Actif' : 'Archivé'}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
