import { EDITIONS } from '@/lib/editions';
import styles from './hero.module.css';

const arrow = (d: string) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

/** Previous / next arrows and one indicator per edition (44 px touch targets). */
export default function EditionSelector({ active, onPrev, onNext, onSelect }: {
  active: number; onPrev: () => void; onNext: () => void; onSelect: (i: number) => void;
}) {
  return (
    <div className={styles.controls}>
      <button type="button" className={styles.roundBtn} onClick={onPrev} aria-label="Édition précédente">
        {arrow('M15 18l-6-6 6-6')}
      </button>
      <div className={styles.dots}>
        {EDITIONS.map((ed, i) => (
          <button key={ed.key} type="button" className={styles.dotBtn} onClick={() => onSelect(i)}
            aria-label={`Afficher l’édition ${ed.name}`} aria-current={i === active ? 'true' : undefined}>
            <span className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} />
          </button>
        ))}
      </div>
      <button type="button" className={styles.roundBtn} onClick={onNext} aria-label="Édition suivante">
        {arrow('M9 18l6-6-6-6')}
      </button>
    </div>
  );
}
