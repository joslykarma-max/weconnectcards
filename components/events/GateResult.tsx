'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './events.module.css';

export type GateTone = 'ok' | 'no' | 'warn' | 'out';

interface Props {
  tone:         GateTone;
  title:        string;
  detail:       string;
  category:     { name: string; color: string };
  serial:       string;
  holderName:   string | null;
  ticketLinked: boolean;
  place:        string;
  time:         string;
}

const TONE_CLASS: Record<GateTone, string> = { ok: styles.gateOk, no: styles.gateNo, warn: styles.gateWarn, out: styles.gateOut };
const VIBRATION: Record<GateTone, number[]> = { ok: [90], out: [60], warn: [120, 80, 120], no: [300, 100, 300] };

/** Full-screen answer on the staff phone, readable at arm's length. */
export default function GateResult({ tone, title, detail, category, serial, holderName, ticketLinked, place, time }: Props) {
  useEffect(() => {
    try { navigator.vibrate?.(VIBRATION[tone]); } catch { /* not supported */ }
  }, [tone]);

  return (
    <main className={`${styles.gate} ${TONE_CLASS[tone]}`} role="status" aria-live="assertive">
      <div className={styles.gateIcon} aria-hidden>
        {tone === 'ok' || tone === 'out' ? (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        ) : tone === 'warn' ? (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 7v6M12 17h.01" /></svg>
        ) : (
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
        )}
      </div>
      <h1 className={styles.gateTitle}>{title}</h1>
      {detail && <p className={styles.gateDetail}>{detail}</p>}

      <div className={styles.gateCard}>
        <span className={styles.gateChip}><i style={{ background: category.color }} aria-hidden />{category.name}</span>
        <span className={styles.gateSerial}>{serial}</span>
        {holderName && <span className={styles.gateName}>{holderName}</span>}
        {ticketLinked && !holderName && <span className={styles.gateFoot}>Billet associé</span>}
      </div>

      <p className={styles.gateFoot}>{place} · {time}</p>
      <p className={styles.gateHint}>Approchez le pass suivant du téléphone</p>
      <Link href="/controle" className={styles.gateLink}>Mode contrôle</Link>
    </main>
  );
}
