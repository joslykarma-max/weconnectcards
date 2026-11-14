import { memo } from 'react';
import type { EditionCard } from '@/lib/editions';
import styles from './hero.module.css';

// Back face: the QR verso that already existed on the landing page
const QR_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='30' height='30' fill='%236366F1'/%3E%3Crect x='60' y='10' width='30' height='30' fill='%236366F1'/%3E%3Crect x='10' y='60' width='30' height='30' fill='%236366F1'/%3E%3Crect x='45' y='45' width='10' height='10' fill='%2306B6D4'/%3E%3Crect x='60' y='60' width='10' height='10' fill='%236366F1'/%3E%3C/svg%3E\") center/contain no-repeat";

const alpha = (a: number) => Math.round(a * 255).toString(16).padStart(2, '0');

/** Physical card: verso, thickness layers, then recto (DOM order = paint order when flattened). */
function NfcCard({ card, name, glow, withBack }: { card: EditionCard; name: string; glow: string; withBack: boolean }) {
  return (
    <>
      {withBack && <div className={styles.back} style={{ border: `1px solid ${card.accent}44` }}>
        <div className={styles.backInner}>
          <div className={styles.qrFrame} style={{
            border: `2px solid ${card.accent}44`,
            background: 'repeating-linear-gradient(0deg, rgba(99,102,241,0.08) 0px, rgba(99,102,241,0.08) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(99,102,241,0.08) 0px, rgba(99,102,241,0.08) 1px, transparent 1px, transparent 8px)',
          }}>
            <div className={styles.qr} style={{ background: QR_PATTERN }} />
          </div>
          <p className={styles.backText}>Scannez pour voir le profil</p>
        </div>
      </div>}

      <div className={styles.glow} style={{ '--card-glow': glow } as React.CSSProperties} aria-hidden />
      <div className={styles.edge} style={{ background: card.edge }} />

      <div className={styles.face} style={{ background: card.bg, border: `1px solid ${card.accent}44` }}>
        <div className={styles.faceInner}>
          <div className={styles.faceTop}>
            <div className={styles.chip} style={{ background: card.chip }} />
            <div className={styles.nfc} aria-hidden>
              {[10.6, 7.6, 4.7].map((s, i) => (
                <div key={s} className={styles.nfcRing} style={{ width: `${s}cqw`, height: `${s}cqw`, border: `1.5px solid ${card.accent}${alpha(0.6 - i * 0.15)}` }} />
              ))}
              <div className={styles.nfcDot} style={{ background: card.accent }} />
            </div>
          </div>
          <div>
            <p className={styles.person}>{card.person.name}</p>
            <p className={styles.role}>{card.person.title}</p>
          </div>
          <div className={styles.faceBottom}>
            <p className={styles.brand}>We Connect</p>
            <div className={styles.badge} style={{ background: `${card.accent}22`, border: `1px solid ${card.accent}44`, color: card.accent }}>
              ÉDITION {name.toUpperCase()}
            </div>
          </div>
        </div>
        <div className={styles.accentLine} style={{ background: card.line }} />
        <div className={styles.sheen}><div className={styles.sheenBand} /></div>
        <div className={styles.dim} />
      </div>
    </>
  );
}

export default memo(NfcCard);
