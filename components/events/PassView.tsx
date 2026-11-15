import { formatEventDate, SUPPORT_LABELS, type EventLink, type EventProgram, type SupportType } from '@/lib/events';
import styles from './events.module.css';

interface Props {
  event: {
    name: string; venue: string; opensAt: string; endsAt: string; description: string;
    posterUrl: string | null; program: EventProgram[]; links: EventLink[]; archived: boolean;
  };
  category:   { name: string; color: string };
  serial:     string;
  support:    SupportType;
  holderName: string | null;
  disabled:   boolean;
}

/** What a guest sees when they tap their own pass. */
export default function PassView({ event, category, serial, support, holderName, disabled }: Props) {
  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <section className={styles.pass} aria-label={`Pass ${category.name}`}>
          {event.posterUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.posterUrl} alt="" className={styles.poster} />
          )}
          <div className={styles.passHead} style={{ background: `linear-gradient(135deg, #0F172A 0%, ${category.color} 160%)` }}>
            <span className={styles.passBrand}>PASS ÉVÉNEMENT · WE CONNECT</span>
            <h1 className={styles.passTitle}>{event.name}</h1>
            <p className={styles.passMeta}>
              {formatEventDate(event.opensAt)}
              {event.venue && <><br />{event.venue}</>}
            </p>
          </div>
          <div className={styles.passBody}>
            <div className={styles.catRow}>
              <span className={styles.chip} style={{ background: category.color }}>{category.name}</span>
              <span className={styles.serial}>{SUPPORT_LABELS[support]} · {serial}</span>
            </div>
            {holderName && <p className={styles.holder}>{holderName}</p>}
            {disabled ? (
              <p className={styles.alert}>Ce pass a été désactivé par l’organisateur. Rapprochez-vous de l’accueil.</p>
            ) : event.archived ? (
              <p className={styles.alert}>Cet événement est terminé. Merci de votre venue !</p>
            ) : (
              <p className={styles.note}>Gardez ce {SUPPORT_LABELS[support].toLowerCase()} sur vous : il sera scanné à l’entrée.</p>
            )}
          </div>
        </section>

        {event.description && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>À propos</h2>
            <p className={styles.desc}>{event.description}</p>
          </section>
        )}

        {event.program.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Programme</h2>
            <ol className={styles.program}>
              {event.program.map((item, i) => (
                <li key={`${item.time}-${i}`}>
                  <time>{item.time}</time>
                  <span>{item.title}{item.speaker && <small>{item.speaker}</small>}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {event.links.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Liens utiles</h2>
            <div className={styles.links}>
              {event.links.map((l, i) => (
                <a key={`${l.url}-${i}`} href={l.url} target="_blank" rel="noopener noreferrer" className={styles.link}>
                  {l.label} <span aria-hidden>↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <p className={styles.footer}>Fin : {formatEventDate(event.endsAt)} · WE CONNECT</p>
      </main>
    </div>
  );
}
