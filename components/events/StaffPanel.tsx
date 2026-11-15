'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEVICE_MODE_LABELS, type DeviceMode, type EventZone } from '@/lib/events';
import styles from './events.module.css';

type Props =
  | { kind: 'enroll'; eventId: string; staffKey: string; zones: EventZone[] }
  | { kind: 'settings'; zones: EventZone[]; name: string; mode: DeviceMode; zoneId: string };

const MODES: DeviceMode[] = ['entree', 'sortie', 'guichet'];
const MODE_HELP: Record<DeviceMode, string> = {
  entree:  'Chaque pass tapé est contrôlé et l’entrée enregistrée.',
  sortie:  'Enregistre les sorties (utile si les retours sont autorisés).',
  guichet: 'Associe un pass au billet acheté sur la billetterie.',
};

/** Join an event as staff, or change this phone's gate and mode. */
export default function StaffPanel(props: Props) {
  const router = useRouter();
  const [name,   setName]   = useState(props.kind === 'settings' ? props.name : '');
  const [mode,   setMode]   = useState<DeviceMode>(props.kind === 'settings' ? props.mode : 'entree');
  const [zoneId, setZoneId] = useState(props.kind === 'settings' ? props.zoneId : props.zones[0]?.id ?? '');
  const [busy,   setBusy]   = useState(false);
  const [error,  setError]  = useState('');
  const [saved,  setSaved]  = useState(false);

  async function submit() {
    setBusy(true); setError(''); setSaved(false);
    try {
      const res = props.kind === 'enroll'
        ? await fetch('/api/controle/enroll', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId: props.eventId, key: props.staffKey, name, mode, zoneId }),
          })
        : await fetch('/api/controle/device', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, mode, zoneId }),
          });
      const data = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) { setError(data.error ?? 'Erreur. Réessayez.'); return; }
      if (props.kind === 'enroll') router.replace('/controle');
      else { setSaved(true); router.refresh(); }
    } catch {
      setError('Connexion impossible. Vérifiez le réseau.');
    } finally {
      setBusy(false);
    }
  }

  async function leave() {
    if (!confirm('Quitter le mode contrôle sur ce téléphone ?')) return;
    await fetch('/api/controle/device', { method: 'DELETE' }).catch(() => null);
    router.refresh();
  }

  return (
    <section className={styles.card}>
      <label className={styles.label}>
        Nom de ce téléphone
        <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex. Porte Nord – Awa" maxLength={40} />
      </label>
      <label className={styles.label}>
        Mode
        <select className={styles.select} value={mode} onChange={(e) => setMode(e.target.value as DeviceMode)}>
          {MODES.map((m) => <option key={m} value={m}>{DEVICE_MODE_LABELS[m]}</option>)}
        </select>
      </label>
      <p className={styles.muted} style={{ fontSize: 13.5, marginTop: -6 }}>{MODE_HELP[mode]}</p>
      {mode !== 'guichet' && props.zones.length > 1 && (
        <label className={styles.label}>
          Zone contrôlée
          <select className={styles.select} value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
            {props.zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </label>
      )}
      {error && <p className={styles.errBox} role="alert">{error}</p>}
      {saved && <p className={styles.okBox}>Enregistré.</p>}
      <button type="button" className={styles.primary} onClick={submit} disabled={busy || !name.trim()}>
        {busy ? '…' : props.kind === 'enroll' ? 'Activer le mode contrôle' : 'Enregistrer'}
      </button>
      {props.kind === 'settings' && (
        <button type="button" className={styles.danger} onClick={leave}>Quitter le mode contrôle</button>
      )}
    </section>
  );
}
