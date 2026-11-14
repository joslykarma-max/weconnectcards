import { memo } from 'react';
import { EDITIONS } from '@/lib/editions';
import styles from './hero.module.css';

// Fixed values so server and client render alike (same family as the « Clair » profile bubbles)
const BUBBLES = [
  { left: 6,  size: 110, dur: 26, delay: -4,  rest: -22 },
  { left: 22, size: 42,  dur: 18, delay: -11, rest: -62 },
  { left: 38, size: 78,  dur: 30, delay: -19,  rest: -86 },
  { left: 56, size: 26,  dur: 16, delay: -2, rest: -40 },
  { left: 72, size: 140, dur: 34, delay: -9, rest: -70 },
  { left: 88, size: 52,  dur: 21, delay: -15,  rest: -30 },
  { left: 13, size: 32,  dur: 19, delay: -13,  rest: -50 },
  { left: 47, size: 60,  dur: 24, delay: -21, rest: -14 },
  { left: 80, size: 36,  dur: 17, delay: -1,  rest: -58 },
  { left: 30, size: 94,  dur: 28, delay: -25, rest: -96 },
];

const SWAYS = [styles.swayA, styles.swayB, styles.swayC];

/** Per-edition backgrounds cross-faded by opacity, plus bubbles tinted by the active edition. */
function DynamicTheme({ active, bubbles }: { active: number; bubbles: boolean }) {
  return (
    <div className={styles.backdrop} aria-hidden>
      {EDITIONS.map((ed, i) => (
        <div key={ed.key} className={`${styles.layer} ${i === active ? styles.layerActive : ''}`} style={{ background: ed.theme.background }}>
          <span className={styles.light} style={{ background: `radial-gradient(circle, ${ed.theme.glow} 0%, transparent 62%)` }} />
        </div>
      ))}
      <div className={`${styles.bubbles} ${bubbles ? '' : styles.bubblesIdle}`}>
        {BUBBLES.map((b, i) => (
          <span key={i} className={styles.bubble} style={{
            left: `${b.left}%`, width: b.size, height: b.size,
            '--dur': `${b.dur}s`, '--delay': `${b.delay}s`, '--rest': `${b.rest}vh`,
          } as React.CSSProperties}>
            <span className={`${styles.bubbleBody} ${SWAYS[i % SWAYS.length]}`} />
          </span>
        ))}
      </div>
    </div>
  );
}

export default memo(DynamicTheme);
