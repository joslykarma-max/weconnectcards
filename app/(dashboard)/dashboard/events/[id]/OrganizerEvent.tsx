'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import ContentEditor from '@/components/events/ContentEditor';
import {
  DENY_LABELS, DEVICE_MODE_LABELS, formatEventDate, formatTime,
  type DenyReason, type DeviceMode, type EventLink, type EventProgram, type EventZone,
} from '@/lib/events';
import ui from '@/components/events/manage.module.css';

interface Props {
  event: {
    id: string; name: string; venue: string; opensAt: string; endsAt: string; status: 'active' | 'archived';
    zones: EventZone[]; categories: { id: string; name: string; color: string }[];
    content: { description: string; posterUrl: string | null; program: EventProgram[]; links: EventLink[] };
  };
}

type Tab = 'live' | 'passes' | 'staff' | 'content';
const TABS: { key: Tab; label: string }[] = [
  { key: 'live', label: 'En direct' }, { key: 'passes', label: 'Pass' }, { key: 'staff', label: 'Staff' }, { key: 'content', label: 'Contenu' },
];

interface Stats {
  passes: number; entered: number; inside: number;
  byCategory: { id: string; name: string; color: string; passes: number; entered: number }[];
  byZone: { id: string; name: string; entries: number; denied: number }[];
  recent: { id: string; serial: string; categoryId: string; zoneId: string; deviceName: string; direction: 'in' | 'out'; result: 'granted' | 'denied'; reason: DenyReason | null; holderName: string | null; at: string }[];
}
interface PassRow { code: string; serial: string; categoryId: string; status: 'active' | 'disabled'; holderName: string | null; ticketRef: string | null; entered: boolean; inside: boolean; lastEntryAt: string | null }
interface Device { id: string; name: string; mode: DeviceMode; zoneId: string; scans: number; lastSeenAt: string | null }

export default function OrganizerEvent({ event }: Props) {
  const [tab, setTab] = useState<Tab>('live');
  const cat  = useCallback((id: string) => event.categories.find((c) => c.id === id), [event.categories]);
  const zone = useCallback((id: string) => event.zones.find((z) => z.id === id)?.name ?? '', [event.zones]);

  return (
    <div className={ui.stack} style={{ maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div>
        <Link href="/dashboard/events" className={ui.sub}>← Mes événements</Link>
        <h1 className={ui.h1}>{event.name}</h1>
        <p className={ui.sub}>{formatEventDate(event.opensAt)} → {formatEventDate(event.endsAt)}{event.venue ? ` · ${event.venue}` : ''}{event.status === 'archived' ? ' · Terminé' : ''}</p>
      </div>

      <div className={ui.tabs} role="tablist">
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} className={`${ui.tab} ${tab === t.key ? ui.tabOn : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>

      {tab === 'live'    && <Live eventId={event.id} cat={cat} zone={zone} />}
      {tab === 'passes'  && <Passes eventId={event.id} cat={cat} />}
      {tab === 'staff'   && <Staff eventId={event.id} zone={zone} archived={event.status === 'archived'} />}
      {tab === 'content' && <section className={ui.card}><ContentEditor eventId={event.id} initial={event.content} /></section>}
    </div>
  );
}

// ── Live ─────────────────────────────────────────────────────────────────────

function Live({ eventId, cat, zone }: { eventId: string; cat: (id: string) => { name: string; color: string } | undefined; zone: (id: string) => string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await fetch(`/api/events/${eventId}/stats`, { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const data = await res.json() as Stats;
        if (alive) { setStats(data); setError(false); }
      } catch { if (alive) setError(true); }
    };
    load();
    const timer = setInterval(load, 10_000);
    return () => { alive = false; clearInterval(timer); };
  }, [eventId]);

  if (!stats) return <section className={ui.card}><p className={ui.sub}>{error ? 'Chargement impossible.' : 'Chargement…'}</p></section>;
  const denied = stats.byZone.reduce((s, z) => s + z.denied, 0);

  return (
    <>
      <div className={ui.kpis}>
        <div className={ui.kpi}><b>{stats.entered}</b><span>entrés sur {stats.passes} pass</span></div>
        <div className={ui.kpi}><b>{stats.inside}</b><span>à l’intérieur</span></div>
        <div className={ui.kpi}><b>{denied}</b><span>refus</span></div>
      </div>

      <section className={ui.card}>
        <h2 className={ui.h2}>Par catégorie</h2>
        {stats.byCategory.map((c) => (
          <div key={c.id} className={ui.field}>
            <div className={ui.cardHead}><span style={{ fontWeight: 700 }}>{c.name}</span><span className={ui.mono}>{c.entered}/{c.passes}</span></div>
            <div className={ui.bar}><i style={{ width: `${c.passes ? Math.round((c.entered / c.passes) * 100) : 0}%`, background: c.color }} /></div>
          </div>
        ))}
      </section>

      {stats.byZone.length > 1 && (
        <section className={ui.card}>
          <h2 className={ui.h2}>Par zone</h2>
          <div className={ui.list}>
            {stats.byZone.map((z) => (
              <div key={z.id} className={ui.rowItem}>
                <span className={ui.rowMain}><b>{z.name}</b></span>
                <span className={`${ui.badge} ${ui.badgeOk}`}>{z.entries} entrées</span>
                <span className={`${ui.badge} ${z.denied ? ui.badgeNo : ''}`}>{z.denied} refus</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className={ui.card}>
        <div className={ui.cardHead}><h2 className={ui.h2}>Dernières activités</h2><span className={ui.sub}>Actualisé toutes les 10 s</span></div>
        {stats.recent.length === 0 ? <p className={ui.sub}>Aucun passage pour l’instant.</p> : (
          <div className={ui.list}>
            {stats.recent.map((r) => (
              <div key={r.id} className={ui.rowItem}>
                <span className={ui.mono}>{formatTime(r.at)}</span>
                <i className={ui.dot} style={{ background: cat(r.categoryId)?.color ?? '#94A3B8' }} aria-hidden />
                <span className={ui.rowMain}>
                  <b>{r.serial}{r.holderName ? ` · ${r.holderName}` : ''}</b>
                  <small>{zone(r.zoneId)} · {r.deviceName}</small>
                </span>
                <span className={`${ui.badge} ${r.result === 'granted' ? ui.badgeOk : ui.badgeNo}`}>
                  {r.result === 'granted' ? (r.direction === 'out' ? 'Sortie' : 'Entrée') : DENY_LABELS[r.reason ?? 'disabled']}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

// ── Passes ───────────────────────────────────────────────────────────────────

function Passes({ eventId, cat }: { eventId: string; cat: (id: string) => { name: string; color: string } | undefined }) {
  const [passes, setPasses] = useState<PassRow[] | null>(null);
  const [query,  setQuery]  = useState('');
  const [error,  setError]  = useState('');

  const load = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}/passes`, { cache: 'no-store' }).catch(() => null);
    if (!res?.ok) { setError('Chargement impossible.'); return; }
    setPasses(await res.json() as PassRow[]);
  }, [eventId]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/events/${eventId}/passes`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: PassRow[]) => { if (alive) setPasses(d); })
      .catch(() => { if (alive) setError('Chargement impossible.'); });
    return () => { alive = false; };
  }, [eventId]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = passes ?? [];
    return (q ? list.filter((p) => [p.serial, p.holderName, p.ticketRef].some((v) => v?.toLowerCase().includes(q))) : list).slice(0, 100);
  }, [passes, query]);

  async function toggle(p: PassRow) {
    const next = p.status === 'active' ? 'disabled' : 'active';
    if (next === 'disabled' && !confirm(`Désactiver le pass ${p.serial} ? Il sera refusé à l’entrée.`)) return;
    const res = await fetch(`/api/events/${eventId}/passes/${p.code}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: next }),
    }).catch(() => null);
    if (res?.ok) setPasses((list) => list?.map((x) => (x.code === p.code ? { ...x, status: next } : x)) ?? null);
    else load();
  }

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.h2}>{passes ? `${passes.length} pass` : 'Pass'}</h2>
        <a href={`/api/events/${eventId}/export`} className={ui.ghost}>Exporter (CSV)</a>
      </div>
      <input className={ui.input} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un numéro, un nom, un billet…" />
      {error && <p className={ui.err}>{error}</p>}
      {!passes ? <p className={ui.sub}>Chargement…</p> : (
        <div className={ui.list}>
          {shown.map((p) => {
            const c = cat(p.categoryId);
            return (
              <div key={p.code} className={ui.rowItem}>
                <i className={ui.dot} style={{ background: c?.color ?? '#94A3B8' }} aria-hidden />
                <span className={ui.rowMain}>
                  <b className={ui.mono}>{p.serial}</b>
                  <small>{c?.name}{p.holderName ? ` · ${p.holderName}` : ''}{p.ticketRef ? ` · billet ${p.ticketRef.slice(0, 24)}` : ''}</small>
                </span>
                <span className={`${ui.badge} ${p.status === 'disabled' ? ui.badgeNo : p.entered ? ui.badgeOk : ''}`}>
                  {p.status === 'disabled' ? 'Désactivé' : p.entered ? `Entré ${formatTime(p.lastEntryAt)}` : 'Pas entré'}
                </span>
                <button type="button" className={p.status === 'active' ? ui.danger : ui.ghost} onClick={() => toggle(p)}>
                  {p.status === 'active' ? 'Désactiver' : 'Réactiver'}
                </button>
              </div>
            );
          })}
          {shown.length === 0 && <div className={ui.rowItem}><span className={ui.sub}>Aucun pass trouvé.</span></div>}
        </div>
      )}
      {passes && passes.length > 100 && !query && <p className={ui.sub}>100 premiers affichés : utilisez la recherche.</p>}
    </section>
  );
}

// ── Staff ────────────────────────────────────────────────────────────────────

function Staff({ eventId, zone, archived }: { eventId: string; zone: (id: string) => string; archived: boolean }) {
  const [devices, setDevices] = useState<Device[] | null>(null);
  const [link,    setLink]    = useState<{ url: string; qrSvg: string } | null>(null);
  const [copied,  setCopied]  = useState(false);
  const [busy,    setBusy]    = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/events/${eventId}/staff`, { cache: 'no-store' }).catch(() => null);
    if (res?.ok) setDevices(((await res.json()) as { devices: Device[] }).devices);
  }, [eventId]);

  useEffect(() => {
    let alive = true;
    fetch(`/api/events/${eventId}/staff`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { devices: Device[] }) => { if (alive) setDevices(d.devices); })
      .catch(() => {});
    return () => { alive = false; };
  }, [eventId]);

  async function newLink() {
    if (link && !confirm('Créer un nouveau lien ? L’ancien lien ne fonctionnera plus (les téléphones déjà activés restent actifs).')) return;
    setBusy(true);
    const res = await fetch(`/api/events/${eventId}/staff`, { method: 'POST' }).catch(() => null);
    setBusy(false);
    if (res?.ok) setLink(await res.json() as { url: string; qrSvg: string });
  }

  async function revoke(d: Device) {
    if (!confirm(`Retirer « ${d.name} » du contrôle ?`)) return;
    await fetch(`/api/events/${eventId}/staff/${d.id}`, { method: 'DELETE' }).catch(() => null);
    load();
  }

  async function copy() {
    if (!link) return;
    try { await navigator.clipboard.writeText(link.url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ }
  }

  return (
    <>
      <section className={ui.card}>
        <h2 className={ui.h2}>Ajouter des téléphones de contrôle</h2>
        <p className={ui.sub}>Chaque agent ouvre ce lien sur son téléphone (iPhone ou Android, sans application ni compte), choisit sa porte et son mode : entrée, sortie ou guichet.</p>
        {link ? (
          <div className={ui.inline} style={{ flexWrap: 'wrap', alignItems: 'flex-start', gap: 16 }}>
            <div className={ui.qr} dangerouslySetInnerHTML={{ __html: link.qrSvg }} aria-label="QR code du lien staff" />
            <div className={ui.stack} style={{ flex: 1, minWidth: 220, gap: 10 }}>
              <input className={ui.input} readOnly value={link.url} onFocus={(e) => e.target.select()} />
              <div className={ui.inline} style={{ flexWrap: 'wrap' }}>
                <button type="button" className={ui.primary} onClick={copy}>{copied ? 'Lien copié ✓' : 'Copier le lien'}</button>
                <a className={ui.ghost} href={`https://wa.me/?text=${encodeURIComponent(`Lien de contrôle des entrées : ${link.url}`)}`} target="_blank" rel="noopener noreferrer">Partager sur WhatsApp</a>
              </div>
              <p className={ui.sub}>Gardez ce lien pour l’équipe : toute personne qui l’a peut activer un téléphone de contrôle.</p>
            </div>
          </div>
        ) : (
          <button type="button" className={ui.primary} style={{ alignSelf: 'flex-start' }} onClick={newLink} disabled={busy || archived}>
            {busy ? '…' : 'Créer le lien staff'}
          </button>
        )}
        {link && <button type="button" className={ui.ghost} onClick={newLink} disabled={busy}>Remplacer le lien</button>}
      </section>

      <section className={ui.card}>
        <h2 className={ui.h2}>Téléphones actifs</h2>
        {!devices ? <p className={ui.sub}>Chargement…</p> : devices.length === 0 ? <p className={ui.sub}>Aucun téléphone activé.</p> : (
          <div className={ui.list}>
            {devices.map((d) => (
              <div key={d.id} className={ui.rowItem}>
                <span className={ui.rowMain}>
                  <b>{d.name}</b>
                  <small>{DEVICE_MODE_LABELS[d.mode]}{d.mode !== 'guichet' ? ` · ${zone(d.zoneId)}` : ''} · {d.scans} scan{d.scans > 1 ? 's' : ''}{d.lastSeenAt ? ` · dernier à ${formatTime(d.lastSeenAt)}` : ''}</small>
                </span>
                <button type="button" className={ui.danger} onClick={() => revoke(d)}>Retirer</button>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
