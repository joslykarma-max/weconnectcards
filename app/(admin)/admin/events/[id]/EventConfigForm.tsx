'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CATEGORY_COLORS, ENTRY_RULE_LABELS, isoToLocalInput, localInputToIso, shortId,
  type EntryRule, type EventCategory, type EventDoc, type EventZone,
} from '@/lib/events';
import ui from '@/components/events/manage.module.css';

type CategoryDraft = Omit<EventCategory, 'validFrom' | 'validTo'> & { validFrom: string; validTo: string };

/** Event settings that only We Connect changes: dates, organiser, zones, categories and their rules. */
export default function EventConfigForm({ event }: { event: EventDoc & { id: string } }) {
  const router = useRouter();
  const [name,    setName]    = useState(event.name);
  const [venue,   setVenue]   = useState(event.venue);
  const [opensAt, setOpensAt] = useState(isoToLocalInput(event.opensAt));
  const [endsAt,  setEndsAt]  = useState(isoToLocalInput(event.endsAt));
  const [organizerEmail, setOrganizerEmail] = useState('');
  const [status,  setStatus]  = useState(event.status);
  const [zones,   setZones]   = useState<EventZone[]>(event.zones);
  const [cats,    setCats]    = useState<CategoryDraft[]>(event.categories.map((c) => ({
    ...c, validFrom: isoToLocalInput(c.validFrom), validTo: isoToLocalInput(c.validTo),
  })));
  const [busy, setBusy] = useState(false);
  const [msg,  setMsg]  = useState<{ ok: boolean; text: string } | null>(null);

  const patchCat = (i: number, patch: Partial<CategoryDraft>) => setCats((list) => list.map((c, j) => (j === i ? { ...c, ...patch } : c)));

  async function save() {
    setBusy(true); setMsg(null);
    const res = await fetch(`/api/admin/events/${event.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, venue, opensAt, endsAt, status, organizerEmail, zones,
        categories: cats.map((c) => ({ ...c, validFrom: localInputToIso(c.validFrom), validTo: localInputToIso(c.validTo) })),
      }),
    }).catch(() => null);
    const data = await res?.json().catch(() => ({})) as { error?: string } | undefined;
    setBusy(false);
    setMsg(res?.ok ? { ok: true, text: 'Configuration enregistrée.' } : { ok: false, text: data?.error ?? 'Enregistrement impossible.' });
    if (res?.ok) { setOrganizerEmail(''); router.refresh(); }
  }

  return (
    <div className={ui.stack}>
      <div className={ui.grid2}>
        <label className={ui.field}><span>Nom</span><input className={ui.input} value={name} onChange={(e) => setName(e.target.value)} /></label>
        <label className={ui.field}><span>Lieu</span><input className={ui.input} value={venue} onChange={(e) => setVenue(e.target.value)} /></label>
        <label className={ui.field}><span>Ouverture des portes</span><input className={ui.input} type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} /></label>
        <label className={ui.field}><span>Fin</span><input className={ui.input} type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} /></label>
        <label className={ui.field}><span>Changer d’organisateur (e-mail)</span><input className={ui.input} type="email" value={organizerEmail} onChange={(e) => setOrganizerEmail(e.target.value)} placeholder={event.organizerName} /></label>
        <label className={ui.field}><span>Statut</span>
          <select className={ui.input} value={status} onChange={(e) => setStatus(e.target.value as EventDoc['status'])}>
            <option value="active">Actif</option>
            <option value="archived">Archivé (plus aucune entrée)</option>
          </select>
        </label>
      </div>

      <div className={ui.field}>
        <span>Zones contrôlées</span>
        {zones.map((z, i) => (
          <div key={z.id} className={ui.inline}>
            <input className={ui.input} value={z.name} maxLength={40} onChange={(e) => setZones((list) => list.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
            {zones.length > 1 && <button type="button" className={ui.iconBtn} aria-label="Retirer la zone" onClick={() => {
              setZones((list) => list.filter((_, j) => j !== i));
              setCats((list) => list.map((c) => ({ ...c, zoneIds: c.zoneIds.filter((id) => id !== z.id) })));
            }}>×</button>}
          </div>
        ))}
        <button type="button" className={ui.ghost} onClick={() => setZones((list) => [...list, { id: shortId(), name: '' }])}>+ Ajouter une zone (VIP, backstage…)</button>
      </div>

      <div className={ui.field}>
        <span>Catégories de pass</span>
        {cats.map((c, i) => (
          <div key={c.id} className={ui.card} style={{ padding: 14, gap: 10 }}>
            <div className={ui.inline}>
              <input className={ui.input} value={c.name} maxLength={30} onChange={(e) => patchCat(i, { name: e.target.value })} placeholder="VIP, Standard, Staff, Presse…" />
              {cats.length > 1 && <button type="button" className={ui.iconBtn} aria-label="Retirer la catégorie" onClick={() => setCats((list) => list.filter((_, j) => j !== i))}>×</button>}
            </div>
            <div className={ui.swatches}>
              {CATEGORY_COLORS.map((col) => (
                <button key={col} type="button" aria-label={`Couleur ${col}`} className={`${ui.swatch} ${c.color === col ? ui.swatchOn : ''}`} style={{ background: col }} onClick={() => patchCat(i, { color: col })} />
              ))}
            </div>
            <div className={ui.field}>
              <span>Zones autorisées (aucune cochée = toutes)</span>
              <div className={ui.chips}>
                {zones.map((z) => {
                  const on = c.zoneIds.includes(z.id);
                  return (
                    <button key={z.id} type="button" className={`${ui.chipToggle} ${on ? ui.chipOn : ''}`}
                      onClick={() => patchCat(i, { zoneIds: on ? c.zoneIds.filter((id) => id !== z.id) : [...c.zoneIds, z.id] })}>
                      {z.name || 'Zone'}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={ui.grid2}>
              <label className={ui.field}><span>Règle d’entrée</span>
                <select className={ui.input} value={c.entryRule} onChange={(e) => patchCat(i, { entryRule: e.target.value as EntryRule })}>
                  {(Object.keys(ENTRY_RULE_LABELS) as EntryRule[]).map((r) => <option key={r} value={r}>{ENTRY_RULE_LABELS[r]}</option>)}
                </select>
              </label>
              <label className={ui.field}><span>Valide à partir de (facultatif)</span><input className={ui.input} type="datetime-local" value={c.validFrom} onChange={(e) => patchCat(i, { validFrom: e.target.value })} /></label>
              <label className={ui.field}><span>Valide jusqu’à (facultatif)</span><input className={ui.input} type="datetime-local" value={c.validTo} onChange={(e) => patchCat(i, { validTo: e.target.value })} /></label>
            </div>
            <label className={ui.check}>
              <input type="checkbox" checked={c.requiresTicket} onChange={(e) => patchCat(i, { requiresTicket: e.target.checked })} />
              Associer au billet au guichet avant l’entrée (sinon : pass anonyme, la catégorie suffit)
            </label>
          </div>
        ))}
        <button type="button" className={ui.ghost} onClick={() => setCats((list) => [...list, {
          id: shortId(), name: '', color: CATEGORY_COLORS[list.length % CATEGORY_COLORS.length], zoneIds: [], entryRule: 'single', requiresTicket: false, validFrom: '', validTo: '',
        }])}>+ Ajouter une catégorie</button>
      </div>

      {msg && <p className={msg.ok ? ui.ok : ui.err}>{msg.text}</p>}
      <button type="button" className={ui.primary} style={{ alignSelf: 'flex-start' }} onClick={save} disabled={busy}>{busy ? 'Enregistrement…' : 'Enregistrer la configuration'}</button>
    </div>
  );
}
