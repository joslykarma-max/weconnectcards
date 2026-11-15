'use client';

import { useState } from 'react';
import type { EventLink, EventProgram } from '@/lib/events';
import ui from './manage.module.css';

interface Props {
  eventId: string;
  initial: { description: string; posterUrl: string | null; program: EventProgram[]; links: EventLink[] };
}

/** What guests see on their pass: description, poster, programme, useful links. */
export default function ContentEditor({ eventId, initial }: Props) {
  const [description, setDescription] = useState(initial.description);
  const [posterUrl,   setPosterUrl]   = useState<string | null>(initial.posterUrl);
  const [program,     setProgram]     = useState<EventProgram[]>(initial.program);
  const [links,       setLinks]       = useState<EventLink[]>(initial.links);
  const [busy,   setBusy]   = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload?folder=eventImages', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
      if (data.url) setPosterUrl(data.url);
      else setStatus({ ok: false, text: data.error ?? 'Envoi de l’image impossible.' });
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true); setStatus(null);
    const res = await fetch(`/api/events/${eventId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description, posterUrl, program, links }),
    }).catch(() => null);
    setBusy(false);
    setStatus(res?.ok ? { ok: true, text: 'Contenu enregistré.' } : { ok: false, text: 'Enregistrement impossible.' });
  }

  return (
    <div className={ui.stack}>
      <div className={ui.field}>
        <span>Affiche</span>
        {posterUrl ? (
          <div className={ui.posterRow}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={posterUrl} alt="" className={ui.posterThumb} />
            <button type="button" className={ui.ghost} onClick={() => setPosterUrl(null)}>Retirer</button>
          </div>
        ) : (
          <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); }} />
        )}
      </div>

      <label className={ui.field}>
        <span>Description</span>
        <textarea className={ui.input} rows={4} value={description} maxLength={3000} onChange={(e) => setDescription(e.target.value)}
          placeholder="Dress code, accès, parking, contacts…" />
      </label>

      <div className={ui.field}>
        <span>Programme</span>
        {program.map((p, i) => (
          <div key={i} className={ui.inline}>
            <input className={ui.input} style={{ maxWidth: 100 }} type="time" value={p.time}
              onChange={(e) => setProgram((list) => list.map((x, j) => (j === i ? { ...x, time: e.target.value } : x)))} />
            <input className={ui.input} value={p.title} placeholder="Titre" maxLength={100}
              onChange={(e) => setProgram((list) => list.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} />
            <input className={ui.input} value={p.speaker ?? ''} placeholder="Intervenant" maxLength={60}
              onChange={(e) => setProgram((list) => list.map((x, j) => (j === i ? { ...x, speaker: e.target.value } : x)))} />
            <button type="button" className={ui.iconBtn} aria-label="Retirer" onClick={() => setProgram((list) => list.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        <button type="button" className={ui.ghost} onClick={() => setProgram((list) => [...list, { time: '', title: '' }])}>+ Ajouter un créneau</button>
      </div>

      <div className={ui.field}>
        <span>Liens utiles (sponsors, plan, réseaux…)</span>
        {links.map((l, i) => (
          <div key={i} className={ui.inline}>
            <input className={ui.input} value={l.label} placeholder="Libellé" maxLength={40}
              onChange={(e) => setLinks((list) => list.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
            <input className={ui.input} value={l.url} placeholder="https://…" maxLength={500}
              onChange={(e) => setLinks((list) => list.map((x, j) => (j === i ? { ...x, url: e.target.value } : x)))} />
            <button type="button" className={ui.iconBtn} aria-label="Retirer" onClick={() => setLinks((list) => list.filter((_, j) => j !== i))}>×</button>
          </div>
        ))}
        {links.length < 10 && <button type="button" className={ui.ghost} onClick={() => setLinks((list) => [...list, { label: '', url: '' }])}>+ Ajouter un lien</button>}
      </div>

      {status && <p className={status.ok ? ui.ok : ui.err}>{status.text}</p>}
      <button type="button" className={ui.primary} onClick={save} disabled={busy || uploading}>{busy ? 'Enregistrement…' : 'Enregistrer le contenu'}</button>
    </div>
  );
}
