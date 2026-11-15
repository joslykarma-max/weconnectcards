'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import QrScanner from './QrScanner';
import styles from './events.module.css';

interface Props {
  code:         string;
  serial:       string;
  category:     { name: string; color: string };
  linkedTicket: string | null;
  holderName:   string | null;
  disabled:     boolean;
  eventName:    string;
  deviceName:   string;
}

const ERRORS: Record<string, string> = {
  already_linked: 'Ce pass est déjà associé à un billet.',
  ticket_used:    'Ce billet est déjà associé à un autre pass',
  pass_disabled:  'Ce pass est désactivé.',
  wrong_event:    'Ce pass appartient à un autre événement.',
  pass_not_found: 'Pass introuvable.',
};

/** Welcome desk: the wristband was just tapped — link it to the guest's ticket. */
export default function DeskAssociate({ code, serial, category, linkedTicket, holderName, disabled, eventName, deviceName }: Props) {
  const [ticket,   setTicket]   = useState('');
  const [name,     setName]     = useState('');
  const [scanning, setScanning] = useState(false);
  const [busy,     setBusy]     = useState(false);
  const [error,    setError]    = useState('');
  const [done,     setDone]     = useState<string | null>(null);

  const onScan = useCallback((text: string) => { setTicket(text); setScanning(false); setError(''); }, []);
  const onCancel = useCallback(() => setScanning(false), []);

  async function associate() {
    if (!ticket.trim()) { setError('Scannez ou saisissez le billet.'); return; }
    setBusy(true); setError('');
    try {
      const res  = await fetch('/api/controle/associate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, ticketRef: ticket, holderName: name }),
      });
      const data = await res.json().catch(() => ({})) as { error?: string; serial?: string };
      if (!res.ok) {
        const base = ERRORS[data.error ?? ''] ?? 'Association impossible. Réessayez.';
        setError(data.error === 'ticket_used' && data.serial ? `${base} (${data.serial}).` : base);
        navigator.vibrate?.([300, 100, 300]);
        return;
      }
      navigator.vibrate?.(90);
      setDone(ticket.trim());
    } catch {
      setError('Connexion impossible. Vérifiez le réseau et réessayez.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <main className={styles.wrap}>
        <div className={styles.top}>
          <span className={styles.pill}>Guichet · {deviceName}</span>
          <Link href="/controle" className={styles.pill}>Mode contrôle</Link>
        </div>

        <section className={styles.card}>
          <p className={styles.sectionTitle} style={{ margin: 0 }}>{eventName}</p>
          <div className={styles.catRow}>
            <span className={styles.chip} style={{ background: category.color }}>{category.name}</span>
            <span className={styles.serial}>{serial}</span>
          </div>

          {disabled ? (
            <p className={styles.errBox}>Ce pass est désactivé : ne le remettez pas.</p>
          ) : linkedTicket ? (
            <p className={styles.okBox}>Déjà associé au billet <b>{linkedTicket}</b>{holderName ? ` — ${holderName}` : ''}.</p>
          ) : done ? (
            <>
              <p className={styles.okBox}>✓ Pass {serial} associé au billet <b>{done}</b>. Remettez-le au participant.</p>
              <p className={styles.muted} style={{ fontSize: 14 }}>Tapez le pass suivant pour continuer.</p>
            </>
          ) : scanning ? (
            <QrScanner onResult={onScan} onCancel={onCancel} />
          ) : (
            <>
              <button type="button" className={styles.primary} onClick={() => setScanning(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M7 12h10" /></svg>
                Scanner le billet
              </button>
              <label className={styles.label}>
                N° du billet
                <input className={styles.input} value={ticket} onChange={(e) => setTicket(e.target.value)} placeholder="Scanné ou saisi à la main" autoComplete="off" />
              </label>
              <label className={styles.label}>
                Nom du participant (facultatif)
                <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Affiché à l’entrée" autoComplete="off" />
              </label>
              {error && <p className={styles.errBox} role="alert">{error}</p>}
              <button type="button" className={styles.primary} onClick={associate} disabled={busy}>
                {busy ? 'Association…' : 'Associer ce pass'}
              </button>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
