import styles from './light-bubbles.module.css';

// Same bubble field as the « Clair » profile pages (fixed values: identical on server and client)
const BUBBLES = [
  { left: 4,  size: 120, dur: 26, delay: -4 , rest: -22 },
  { left: 20, size: 44,  dur: 18, delay: -11, rest: -62 },
  { left: 36, size: 84,  dur: 30, delay: -19, rest: -86 },
  { left: 54, size: 28,  dur: 16, delay: -2 , rest: -40 },
  { left: 68, size: 150, dur: 34, delay: -9 , rest: -70 },
  { left: 84, size: 56,  dur: 21, delay: -15, rest: -30 },
  { left: 92, size: 24,  dur: 14, delay: -6 , rest: -96 },
  { left: 11, size: 34,  dur: 19, delay: -13, rest: -50 },
  { left: 46, size: 64,  dur: 24, delay: -21, rest: -14 },
  { left: 76, size: 38,  dur: 17, delay: -1 , rest: -58 },
];
const SWAYS = [styles.swayA, styles.swayB, styles.swayC];

/** Rising bubbles behind a light page, tinted with two colours. */
export default function LightBubbles({ tints }: { tints: [string, string] }) {
  return (
    <div className={styles.field} aria-hidden>
      {BUBBLES.map((b, i) => {
        const tint = tints[i % 2];
        return (
          <span key={i} className={styles.bubble} style={{
            left: `${b.left}%`, width: b.size, height: b.size,
            '--dur': `${b.dur}s`, '--delay': `${b.delay}s`, '--rest': `${b.rest}vh`,
          } as React.CSSProperties}>
            <span className={`${styles.body} ${SWAYS[i % 3]}`} style={{
              background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.95) 0 7%, ${tint}55 9%, ${tint}2E 58%, ${tint}14 100%)`,
              border: `1px solid ${tint}4D`,
            }} />
          </span>
        );
      })}
    </div>
  );
}
