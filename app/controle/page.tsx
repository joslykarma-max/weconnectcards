import type { Metadata, Viewport } from 'next';
import { currentDevice, loadEvent } from '@/lib/events-server';
import { DEVICE_MODE_LABELS, formatEventDate } from '@/lib/events';
import StaffPanel from '@/components/events/StaffPanel';
import styles from '@/components/events/events.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Mode contrôle — We Connect', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: '#F4F7FB', viewportFit: 'cover' };

/** Home of a staff phone: which event, gate and mode it controls. */
export default async function ControlePage() {
  const device = await currentDevice();
  const event  = device ? await loadEvent(device.eventId) : null;

  if (!device || !event) {
    return (
      <div className={styles.page}>
        <main className={styles.center}>
          <p className={styles.bigEmoji} aria-hidden>📲</p>
          <h1 className={styles.h1}>Mode contrôle</h1>
          <p className={styles.muted}>Ce téléphone n’est rattaché à aucun événement.<br />Ouvrez le lien staff envoyé par l’organisateur.</p>
        </main>
      </div>
    );
  }

  const zone = event.zones.find((z) => z.id === device.zoneId);
  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <div className={styles.top}>
          <span className={styles.pill}>● Mode contrôle actif</span>
          <span className={styles.pill}>{device.scans} scan{device.scans > 1 ? 's' : ''}</span>
        </div>
        <section className={styles.card}>
          <p className={styles.sectionTitle} style={{ margin: 0 }}>{formatEventDate(event.opensAt)}</p>
          <h1 className={styles.h1}>{event.name}</h1>
          <p className={styles.muted}>
            {DEVICE_MODE_LABELS[device.mode]}{device.mode !== 'guichet' && zone ? ` · ${zone.name}` : ''} — {device.name}
          </p>
        </section>

        <section className={styles.card}>
          <p className={styles.sectionTitle} style={{ margin: 0 }}>Comment scanner</p>
          <ol className={styles.steps}>
            <li><b>iPhone</b> : écran déverrouillé, approchez le pass du <b>haut</b> du téléphone, puis touchez la notification.</li>
            <li><b>Android</b> : NFC activé, approchez le pass du <b>dos</b> du téléphone.</li>
            <li>Le résultat s’affiche en plein écran : <b>vert</b> = entrée, <b>rouge</b> = refus, <b>orange</b> = guichet.</li>
          </ol>
          <p className={styles.muted} style={{ fontSize: 13 }}>Le pass doit s’ouvrir dans le navigateur où ce mode est activé.</p>
        </section>

        <StaffPanel kind="settings" zones={event.zones} name={device.name} mode={device.mode} zoneId={device.zoneId} />
      </main>
    </div>
  );
}
