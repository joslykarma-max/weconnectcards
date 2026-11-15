'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SUPPORT_LABELS, type SupportType } from '@/lib/events';
import ui from '@/components/events/manage.module.css';

interface Props { eventId: string; categories: { id: string; name: string; color: string; count: number }[] }

/** Create batches of passes, export them for the encoding workshop, reset after tests. */
export default function PassBatches({ eventId, categories }: Props) {
  const router = useRouter();
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [support,    setSupport]    = useState<SupportType>('bracelet');
  const [quantity,   setQuantity]   = useState('100');
  const [prefix,     setPrefix]     = useState('');
  const [busy, setBusy]   = useState(false);
  const [msg,  setMsg]    = useState<{ ok: boolean; text: string } | null>(null);
  const total = categories.reduce((s, c) => s + c.count, 0);

  async function create() {
    setBusy(true); setMsg(null);
    const res  = await fetch(`/api/admin/events/${eventId}/passes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId, support, quantity: Number(quantity), prefix }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({})) as { first?: string; last?: string; count?: number; error?: string } | undefined;
    setBusy(false);
    if (!res?.ok) { setMsg({ ok: false, text: data?.error ?? 'Création impossible.' }); return; }
    setMsg({ ok: true, text: `${data?.count} pass créés : ${data?.first} → ${data?.last}. Exportez le fichier pour l’encodage.` });
    router.refresh();
  }

  async function reset() {
    if (!confirm('Effacer toutes les entrées enregistrées (après les tests) ? Les pass redeviennent « jamais entrés ».')) return;
    const res = await fetch(`/api/admin/events/${eventId}/reset`, { method: 'POST' }).catch(() => null);
    setMsg(res?.ok ? { ok: true, text: 'Entrées remises à zéro.' } : { ok: false, text: 'Remise à zéro impossible.' });
    router.refresh();
  }

  return (
    <div className={ui.stack}>
      <div className={ui.list}>
        {categories.map((c) => (
          <div key={c.id} className={ui.rowItem}>
            <i className={ui.dot} style={{ background: c.color }} aria-hidden />
            <span className={ui.rowMain}><b>{c.name}</b></span>
            <span className={ui.badge}>{c.count} pass</span>
          </div>
        ))}
        <div className={ui.rowItem}><span className={ui.rowMain}><b>Total</b></span><span className={ui.badge}>{total} pass</span></div>
      </div>

      <div className={ui.grid2}>
        <label className={ui.field}><span>Catégorie</span>
          <select className={ui.input} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className={ui.field}><span>Support</span>
          <select className={ui.input} value={support} onChange={(e) => setSupport(e.target.value as SupportType)}>
            {(Object.keys(SUPPORT_LABELS) as SupportType[]).map((s) => <option key={s} value={s}>{SUPPORT_LABELS[s]}</option>)}
          </select>
        </label>
        <label className={ui.field}><span>Quantité</span><input className={ui.input} type="number" min={1} max={5000} value={quantity} onChange={(e) => setQuantity(e.target.value)} /></label>
        <label className={ui.field}><span>Préfixe imprimé (facultatif)</span><input className={ui.input} value={prefix} maxLength={8} onChange={(e) => setPrefix(e.target.value.toUpperCase())} placeholder="VIP → VIP-0001" /></label>
      </div>
      {msg && <p className={msg.ok ? ui.ok : ui.err}>{msg.text}</p>}
      <div className={ui.inline} style={{ flexWrap: 'wrap' }}>
        <button type="button" className={ui.primary} onClick={create} disabled={busy || !categoryId}>{busy ? 'Création…' : 'Créer le lot'}</button>
        <a className={ui.ghost} href={`/api/admin/events/${eventId}/passes`}>Exporter pour l’encodage (CSV)</a>
        <button type="button" className={ui.danger} onClick={reset}>Remettre les entrées à zéro</button>
      </div>
      <p className={ui.sub}>Chaque puce reçoit l’URL de son pass (colonne « URL à encoder »). Le numéro est à imprimer sur le support.</p>
    </div>
  );
}
