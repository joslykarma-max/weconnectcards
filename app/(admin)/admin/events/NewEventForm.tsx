'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ui from '@/components/events/manage.module.css';

export default function NewEventForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', organizerEmail: '', venue: '', opensAt: '', endsAt: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function create() {
    setBusy(true); setError('');
    const res  = await fetch('/api/admin/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }).catch(() => null);
    const data = await res?.json().catch(() => ({})) as { id?: string; error?: string } | undefined;
    setBusy(false);
    if (!res?.ok || !data?.id) { setError(data?.error ?? 'Création impossible.'); return; }
    router.push(`/admin/events/${data.id}`);
  }

  return (
    <div className={ui.stack}>
      <div className={ui.grid2}>
        <label className={ui.field}><span>Nom de l’événement</span><input className={ui.input} value={form.name} onChange={set('name')} placeholder="Festival Vodun Days 2027" /></label>
        <label className={ui.field}><span>E-mail du compte organisateur</span><input className={ui.input} type="email" value={form.organizerEmail} onChange={set('organizerEmail')} placeholder="organisateur@exemple.com" /></label>
        <label className={ui.field}><span>Lieu</span><input className={ui.input} value={form.venue} onChange={set('venue')} placeholder="Plage de Ouidah" /></label>
        <label className={ui.field}><span>Ouverture des portes (heure du Bénin)</span><input className={ui.input} type="datetime-local" value={form.opensAt} onChange={set('opensAt')} /></label>
        <label className={ui.field}><span>Fin</span><input className={ui.input} type="datetime-local" value={form.endsAt} onChange={set('endsAt')} /></label>
      </div>
      {error && <p className={ui.err}>{error}</p>}
      <button type="button" className={ui.primary} style={{ alignSelf: 'flex-start' }} onClick={create} disabled={busy}>{busy ? 'Création…' : 'Créer l’événement'}</button>
    </div>
  );
}
