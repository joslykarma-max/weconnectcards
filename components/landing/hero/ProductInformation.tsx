import type { Edition } from '@/lib/editions';
import styles from './hero.module.css';

/** Name, description and traits of the selected edition, plus the verso and autoplay toggles. */
export default function ProductInformation({ edition, flipped, onFlip, playing, onTogglePlay, announce }: {
  edition: Edition; flipped: boolean; onFlip: () => void; playing: boolean; onTogglePlay: () => void; announce: boolean;
}) {
  return (
    <div className={styles.info}>
      {/* Persistent live region; the keyed child only replays the entrance animation */}
      <div aria-live={announce ? 'polite' : 'off'} aria-atomic="true">
      <div key={edition.key} className={styles.swapIn}>
        <p className={styles.infoKicker}>Édition</p>
        <h2 className={styles.infoName}>{edition.name}</h2>
        <p className={styles.infoDesc}>{edition.description}</p>
        <div className={styles.traits}>
          {edition.traits.map((t) => <span key={t} className={styles.trait}>{t}</span>)}
          <span className={styles.trait}>Puce NFC + QR code</span>
        </div>
      </div>
      </div>
      <div className={styles.infoActions}>
        <button type="button" className={styles.pill} onClick={onFlip} aria-pressed={flipped}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" />
          </svg>
          {flipped ? 'Voir le recto' : 'Voir le verso'}
        </button>
        <button type="button" className={styles.roundBtn} onClick={onTogglePlay}
          aria-label={playing ? 'Mettre le défilement en pause' : 'Reprendre le défilement'} aria-pressed={!playing}>
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
          )}
        </button>
      </div>
    </div>
  );
}
