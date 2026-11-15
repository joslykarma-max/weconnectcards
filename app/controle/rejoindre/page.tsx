import type { Metadata, Viewport } from 'next';
import { loadEvent, sha256 } from '@/lib/events-server';
import { formatEventDate } from '@/lib/events';
import StaffPanel from '@/components/events/StaffPanel';
import styles from '@/components/events/events.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Rejoindre le staff — We Connect', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: '#F4F7FB', viewportFit: 'cover' };

type Props = { searchParams: Promise<{ e?: string; k?: string }> };

/** Opened from the staff link (QR / WhatsApp) shared by the organiser. */
export default async function RejoindrePage({ searchParams }: Props) {
  const { e, k } = await searchParams;
  const event = e && k ? await loadEvent(e) : null;
  const valid = !!event && !!event.staffKeyHash && sha256(k!) === event.staffKeyHash && event.status !== 'archived';

  if (!valid) {
    return (
      <div className={styles.page}>
        <main className={styles.center}>
          <p className={styles.bigEmoji} aria-hidden>🔒</p>
          <h1 className={styles.h1}>Lien staff invalide</h1>
          <p className={styles.muted}>Ce lien a expiré ou a été remplacé. Demandez le nouveau lien à l’organisateur.</p>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <section className={styles.card}>
          <p className={styles.sectionTitle} style={{ margin: 0 }}>Rejoindre l’équipe de contrôle</p>
          <h1 className={styles.h1}>{event.name}</h1>
          <p className={styles.muted}>{formatEventDate(event.opensAt)}{event.venue ? ` · ${event.venue}` : ''}</p>
        </section>
        <StaffPanel kind="enroll" eventId={event.id} staffKey={k!} zones={event.zones} />
        <p className={styles.footer}>Aucun compte nécessaire · WE CONNECT</p>
      </main>
    </div>
  );
}
