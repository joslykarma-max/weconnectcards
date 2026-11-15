import Link from 'next/link';
import { requireAuth } from '@/lib/session';
import { eventsCol, passesCol } from '@/lib/events-server';
import { formatEventDate, type EventDoc } from '@/lib/events';
import ui from '@/components/events/manage.module.css';

export const dynamic = 'force-dynamic';

/** Organiser space: events for which We Connect supplied NFC passes. */
export default async function OrganizerEventsPage() {
  const user = await requireAuth();
  const snap = await eventsCol().where('organizerUid', '==', user.uid).get();
  const events = await Promise.all(snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as EventDoc) }))
    .sort((a, b) => b.opensAt.localeCompare(a.opensAt))
    .map(async (e) => {
      const [passes, entered] = await Promise.all([
        passesCol().where('eventId', '==', e.id).count().get(),
        passesCol().where('eventId', '==', e.id).where('entered', '==', true).count().get(),
      ]);
      return { ...e, passes: passes.data().count, entered: entered.data().count };
    }));

  return (
    <div className={ui.stack} style={{ maxWidth: 820, margin: '0 auto', width: '100%' }}>
      <div>
        <h1 className={ui.h1}>Mes événements</h1>
        <p className={ui.sub}>Vos pass NFC (cartes, bracelets, badges) : entrées en direct, staff, pass perdus.</p>
      </div>
      {events.length === 0 ? (
        <section className={ui.card}>
          <h2 className={ui.h2}>Aucun événement pour l’instant</h2>
          <p className={ui.sub}>We Connect conçoit et configure les bracelets, badges et cartes NFC de votre événement, compatibles avec votre billetterie. Contactez-nous pour un devis.</p>
          <Link href="/contact" className={ui.primary} style={{ alignSelf: 'flex-start' }}>Demander un devis</Link>
        </section>
      ) : (
        <div className={ui.list}>
          {events.map((e) => (
            <Link key={e.id} href={`/dashboard/events/${e.id}`} className={ui.rowItem}>
              <span className={ui.rowMain}>
                <b>{e.name}</b>
                <small>{formatEventDate(e.opensAt)}{e.venue ? ` · ${e.venue}` : ''}</small>
              </span>
              <span className={ui.badge}>{e.entered}/{e.passes} entrés</span>
              {e.status === 'archived' && <span className={ui.badge}>Terminé</span>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
