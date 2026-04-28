'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TicketType, AgendaItem, EventRegistration } from '@/lib/types';

interface EventInfo {
  eventName:           string;
  organizer:           string;
  date:                string;
  time:                string;
  venue:               string;
  description:         string;
  emoji:               string;
  currency:            string;
  whatsapp:            string;
  registrationEnabled: boolean;
}

const CURRENCIES = ['FCFA', 'XOF', 'EUR', 'USD', 'GHS', 'NGN', 'MAD'];
const EMOJIS     = ['🎟️','🎪','🎭','🎉','🎊','🥳','🎸','🎺','🎼','🎤','🏆','⚽','🏃','🍕','🍷','🌟','💼','📚','🎓','🖼️'];

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: on ? '#6366F1' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}

export default function EventDashboard({
  initialInfo,
  initialTickets,
  initialAgenda,
  initialRegistrations,
  initialPosters,
}: {
  initialInfo:          EventInfo;
  initialTickets:       TicketType[];
  initialAgenda:        AgendaItem[];
  initialRegistrations: EventRegistration[];
  initialPosters:       string[];
}) {
  const router = useRouter();
  const [info,    setInfo]    = useState<EventInfo>(initialInfo);
  const [tickets, setTickets] = useState<TicketType[]>(initialTickets);
  const [agenda,  setAgenda]  = useState<AgendaItem[]>(initialAgenda);
  const [regs]                = useState<EventRegistration[]>(initialRegistrations);
  const [posters, setPosters] = useState<string[]>(initialPosters);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showNewTicket,   setShowNewTicket]   = useState(false);
  const [newTicket, setNewTicket] = useState({ name: '', description: '', price: '', capacity: '' });
  const [showNewAgenda, setShowNewAgenda] = useState(false);
  const [newAgenda, setNewAgenda] = useState({ time: '', title: '', speaker: '' });

  const setField = <K extends keyof EventInfo>(k: K, v: EventInfo[K]) =>
    setInfo(p => ({ ...p, [k]: v }));

  async function uploadPoster(file: File) {
    if (posters.length >= 3) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload?folder=eventImages', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    if (data.url) setPosters(p => [...p, data.url!]);
    setUploading(false);
  }

  const countsByTicket: Record<string, number> = {};
  regs.forEach(r => { countsByTicket[r.ticketTypeId] = (countsByTicket[r.ticketTypeId] || 0) + 1; });

  function addTicket() {
    if (!newTicket.name) return;
    setTickets(p => [...p, {
      id:          Date.now().toString(),
      name:        newTicket.name,
      description: newTicket.description || undefined,
      price:       Number(newTicket.price)    || 0,
      capacity:    Number(newTicket.capacity) || 100,
    }]);
    setNewTicket({ name: '', description: '', price: '', capacity: '' });
    setShowNewTicket(false);
  }

  function addAgendaItem() {
    if (!newAgenda.time || !newAgenda.title) return;
    setAgenda(p =>
      [...p, { id: Date.now().toString(), time: newAgenda.time, title: newAgenda.title, speaker: newAgenda.speaker || undefined }]
        .sort((a, b) => a.time.localeCompare(b.time))
    );
    setNewAgenda({ time: '', title: '', speaker: '' });
    setShowNewAgenda(false);
  }

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'event', config: { ...info, tickets, agenda, posters } }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportCSV() {
    const hdr  = ['Nom', 'Téléphone', 'Email', 'Type de billet', 'Prix', 'Date inscription'];
    const rows = [...regs]
      .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
      .map(r => [r.name, r.phone, r.email || '', r.ticketTypeName, String(r.ticketPrice), new Date(r.registeredAt).toLocaleString('fr-FR')]);
    const csv  = [hdr, ...rows].map(r => r.map(v => `"${v.replace(/"/g, '""')}"`).join(',')).join('\n');
    const url  = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a    = Object.assign(document.createElement('a'), { href: url, download: `inscrits_${info.eventName || 'event'}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalCapacity = tickets.reduce((s, t) => s + t.capacity, 0);
  const totalReg      = regs.length;
  const sortedRegs    = [...regs].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime());

  const labelStyle: React.CSSProperties = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 };
  const sectionHead: React.CSSProperties = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', margin: 0 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="module-back-btn" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>{info.emoji} Pass Événement</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Billetterie et inscriptions en ligne</p>
        </div>
      </div>

      <div className="module-3col" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ─── Col 1: Info & Settings ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ ...sectionHead, marginBottom: 18 }}>Détails de l&apos;événement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={labelStyle}>Icône</p>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowEmojiPicker(p => !p)}
                    style={{ width: 52, height: 52, fontSize: 28, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}>
                    {info.emoji}
                  </button>
                  {showEmojiPicker && (
                    <div style={{ position: 'absolute', top: 56, left: 0, zIndex: 50, background: '#181B26', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 10, display: 'flex', flexWrap: 'wrap', gap: 6, width: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                      {EMOJIS.map(e => (
                        <button key={e} onClick={() => { setField('emoji', e); setShowEmojiPicker(false); }}
                          style={{ width: 36, height: 36, fontSize: 20, background: 'none', border: '1px solid transparent', borderRadius: 6, cursor: 'pointer' }}
                          onMouseOver={ev => (ev.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                          onMouseOut={ev  => (ev.currentTarget.style.background = 'none')}>{e}</button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <Input label="Nom de l'événement" placeholder="Gala de fin d'année 2025" value={info.eventName} onChange={e => setField('eventName', e.target.value)} />
              <Input label="Organisateur" placeholder="ANEB, Club Sport, Entreprise..." value={info.organizer} onChange={e => setField('organizer', e.target.value)} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input label="Date" type="date" value={info.date} onChange={e => setField('date', e.target.value)} />
                <Input label="Heure" type="time" value={info.time} onChange={e => setField('time', e.target.value)} />
              </div>
              <Input label="Lieu / Venue" placeholder="Palais des Congrès, Cotonou" value={info.venue} onChange={e => setField('venue', e.target.value)} />
              <div>
                <p style={labelStyle}>Description</p>
                <textarea value={info.description} onChange={e => setField('description', e.target.value)} rows={3}
                  placeholder="Détails, dress code, programme..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <h3 style={{ ...sectionHead, marginBottom: 18 }}>Paramètres</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <p style={labelStyle}>Devise</p>
                <select value={info.currency} onChange={e => setField('currency', e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}>
                  {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#181B26' }}>{c}</option>)}
                </select>
              </div>
              <Input label="WhatsApp organisateur" placeholder="+229 97 00 00 00" value={info.whatsapp} onChange={e => setField('whatsapp', e.target.value)} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Inscriptions ouvertes</p>
                  <p style={{ color: '#6B7280', fontSize: 11, margin: 0 }}>Les visiteurs peuvent s&apos;inscrire</p>
                </div>
                <Toggle on={info.registrationEnabled} onToggle={() => setField('registrationEnabled', !info.registrationEnabled)} />
              </div>
            </div>
          </Card>

          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        {/* ─── Col 2: Affiches + Tickets + Agenda ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Affiches */}
          <Card padding="md">
            <h3 style={{ ...sectionHead, marginBottom: 6 }}>Affiches de l&apos;événement</h3>
            <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 16 }}>Max 3 images · Format portrait recommandé</p>
            <input ref={posterInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) { uploadPoster(f); e.target.value = ''; } }} />
            <div style={{ display: 'flex', gap: 12 }}>
              {posters.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 100, height: 140, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Affiche ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button onClick={() => setPosters(p => p.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                    ×
                  </button>
                </div>
              ))}
              {posters.length < 3 && (
                <button onClick={() => posterInputRef.current?.click()} disabled={uploading}
                  style={{ width: 100, height: 140, borderRadius: 8, border: '2px dashed rgba(99,102,241,0.35)', background: 'rgba(99,102,241,0.05)', color: uploading ? '#6B7280' : '#818CF8', cursor: uploading ? 'wait' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 24 }}>{uploading ? '⏳' : '+'}</span>
                  <span style={{ fontSize: 11, fontFamily: 'Space Mono, monospace' }}>{uploading ? 'Upload...' : 'Ajouter'}</span>
                </button>
              )}
              {/* Slots vides pour montrer les emplacements restants */}
              {Array.from({ length: Math.max(0, 2 - posters.length) }).map((_, i) => (
                <div key={`empty-${i}`} style={{ width: 100, height: 140, borderRadius: 8, border: '1px dashed rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', flexShrink: 0 }} />
              ))}
            </div>
          </Card>

          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={sectionHead}>Types de billets</h3>
              {!showNewTicket && (
                <button onClick={() => setShowNewTicket(true)}
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', color: '#818CF8', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
                  + Ajouter
                </button>
              )}
            </div>

            {tickets.length === 0 && !showNewTicket && (
              <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucun type de billet — ajoutez en un ci-dessus
              </p>
            )}

            {tickets.map(ticket => {
              const sold = countsByTicket[ticket.id] || 0;
              const pct  = Math.min(100, Math.round((sold / Math.max(1, ticket.capacity)) * 100));
              return (
                <div key={ticket.id} style={{ padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <input value={ticket.name}
                      onChange={e => setTickets(p => p.map(t => t.id === ticket.id ? { ...t, name: e.target.value } : t))}
                      placeholder="Nom du billet"
                      style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '8px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '0 10px' }}>
                      <input type="number" value={ticket.price}
                        onChange={e => setTickets(p => p.map(t => t.id === ticket.id ? { ...t, price: Number(e.target.value) } : t))}
                        style={{ width: 80, background: 'none', border: 'none', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 12, outline: 'none' }} />
                      <span style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>{info.currency}</span>
                    </div>
                    <button onClick={() => setTickets(p => p.filter(t => t.id !== ticket.id))}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="number" value={ticket.capacity}
                        onChange={e => setTickets(p => p.map(t => t.id === ticket.id ? { ...t, capacity: Number(e.target.value) } : t))}
                        style={{ width: 64, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 4, padding: '4px 8px', color: '#9CA3AF', fontFamily: 'Space Mono, monospace', fontSize: 11, outline: 'none' }} />
                      <span style={{ color: '#6B7280', fontSize: 11 }}>places max</span>
                    </div>
                    <span style={{ fontSize: 12, color: sold >= ticket.capacity ? '#EF4444' : '#10B981', fontFamily: 'Space Mono, monospace' }}>
                      {sold} / {ticket.capacity} vendus
                    </span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: pct >= 100 ? '#EF4444' : '#6366F1', width: `${pct}%`, transition: 'width 0.3s' }} />
                  </div>
                </div>
              );
            })}

            {showNewTicket && (
              <div style={{ paddingTop: 16, borderTop: tickets.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input label="Nom du billet" placeholder="VIP, Standard, Gratuit..." value={newTicket.name} onChange={e => setNewTicket(p => ({ ...p, name: e.target.value }))} />
                  <Input label="Description (optionnel)" placeholder="Accès total + cocktail de bienvenue" value={newTicket.description} onChange={e => setNewTicket(p => ({ ...p, description: e.target.value }))} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <Input label={`Prix (${info.currency})`} type="number" placeholder="5000" value={newTicket.price} onChange={e => setNewTicket(p => ({ ...p, price: e.target.value }))} />
                    <Input label="Capacité" type="number" placeholder="100" value={newTicket.capacity} onChange={e => setNewTicket(p => ({ ...p, capacity: e.target.value }))} />
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="gradient" onClick={addTicket}>Ajouter</Button>
                    <Button variant="ghost" onClick={() => { setShowNewTicket(false); setNewTicket({ name: '', description: '', price: '', capacity: '' }); }}>Annuler</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={sectionHead}>Programme / Agenda</h3>
              {!showNewAgenda && (
                <button onClick={() => setShowNewAgenda(true)}
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', color: '#818CF8', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
                  + Ajouter
                </button>
              )}
            </div>

            {agenda.length === 0 && !showNewAgenda && (
              <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>
                Aucun élément de programme
              </p>
            )}

            {agenda.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#6366F1', minWidth: 44, paddingTop: 2 }}>{item.time}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontWeight: 500, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{item.title}</p>
                  {item.speaker && <p style={{ color: '#9CA3AF', fontSize: 12, margin: '2px 0 0' }}>🎤 {item.speaker}</p>}
                </div>
                <button onClick={() => setAgenda(p => p.filter(a => a.id !== item.id))}
                  style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}

            {showNewAgenda && (
              <div style={{ paddingTop: 16, borderTop: agenda.length > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: 10 }}>
                    <Input label="Heure" type="time" value={newAgenda.time} onChange={e => setNewAgenda(p => ({ ...p, time: e.target.value }))} />
                    <Input label="Titre" placeholder="Discours d'ouverture" value={newAgenda.title} onChange={e => setNewAgenda(p => ({ ...p, title: e.target.value }))} />
                  </div>
                  <Input label="Intervenant (optionnel)" placeholder="Jean Kossou" value={newAgenda.speaker} onChange={e => setNewAgenda(p => ({ ...p, speaker: e.target.value }))} />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <Button variant="gradient" onClick={addAgendaItem}>Ajouter</Button>
                    <Button variant="ghost" onClick={() => { setShowNewAgenda(false); setNewAgenda({ time: '', title: '', speaker: '' }); }}>Annuler</Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* ─── Col 3: Registrations ─── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <Card padding="md">
            <h3 style={{ ...sectionHead, marginBottom: 16 }}>Inscriptions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(99,102,241,0.08)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: '#6366F1', margin: 0 }}>{totalReg}</p>
                <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>inscrits</p>
              </div>
              <div style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: '#10B981', margin: 0 }}>{Math.max(0, totalCapacity - totalReg)}</p>
                <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>restantes</p>
              </div>
            </div>

            {tickets.map(t => {
              const sold = countsByTicket[t.id] || 0;
              const pct  = Math.min(100, Math.round((sold / Math.max(1, t.capacity)) * 100));
              return (
                <div key={t.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>{t.name}</span>
                    <span style={{ color: '#F8F9FC', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{sold}/{t.capacity}</span>
                  </div>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: '#6366F1', width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}

            <button onClick={exportCSV}
              style={{ width: '100%', marginTop: 12, padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#9CA3AF', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
              📥 Exporter CSV
            </button>
          </Card>

          <Card padding="md">
            <h3 style={{ ...sectionHead, marginBottom: 16 }}>Liste des inscrits</h3>
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {sortedRegs.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Aucune inscription pour le moment</p>
              ) : (
                sortedRegs.map((r, i) => (
                  <div key={i} style={{ padding: '11px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ color: '#F8F9FC', fontSize: 13, fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>{r.name}</span>
                      <span style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', marginLeft: 8, whiteSpace: 'nowrap' }}>
                        {new Date(r.registeredAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </span>
                    </div>
                    <p style={{ color: '#818CF8', fontSize: 11, fontFamily: 'Space Mono, monospace', margin: '2px 0 1px' }}>{r.ticketTypeName}</p>
                    <p style={{ color: '#6B7280', fontSize: 11, margin: 0 }}>{r.phone}</p>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
