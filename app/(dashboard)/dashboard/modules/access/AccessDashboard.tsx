'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AccessZone, AccessLog } from '@/lib/types';

interface BadgeInfo {
  title:       string;
  holderName:  string;
  holderRole:  string;
  holderPhoto: string;
}

const DAYS   = ['lun','mar','mer','jeu','ven','sam','dim'];
const EMOJIS = ['🚪','🔑','🔒','🏢','🚗','🏋️','🏨','🏫','🏪','🏭','🏠','⚡','💼','🛡️','🔐','🎯','📦','🧪','🖥️','🔓'];
const TYPE_LABELS: Record<string, string> = { libre: 'Libre', pin: 'PIN', whatsapp: 'WhatsApp' };

async function hashPin(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pin));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', background: on ? '#6366F1' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 22 : 2, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
    </button>
  );
}

export default function AccessDashboard({
  initialBadge,
  initialZones,
  initialLogs,
}: {
  initialBadge: BadgeInfo;
  initialZones: AccessZone[];
  initialLogs:  AccessLog[];
}) {
  const router    = useRouter();
  const [badge,   setBadge]   = useState<BadgeInfo>(initialBadge);
  const [zones,   setZones]   = useState<AccessZone[]>(initialZones);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [expandedId,     setExpandedId]     = useState<string | null>(zones.length === 0 ? null : zones[0].id);
  const [showEmojiFor,   setShowEmojiFor]   = useState<string | null>(null);
  const [editingPinFor,  setEditingPinFor]  = useState<string | null>(null);
  const [newPinValue,    setNewPinValue]    = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const logs = [...initialLogs].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  const grantedToday = logs.filter(l =>
    l.status === 'granted' && new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length;
  const deniedToday = logs.filter(l =>
    l.status === 'denied' && new Date(l.timestamp).toDateString() === new Date().toDateString()
  ).length;

  function setField<K extends keyof BadgeInfo>(k: K, v: BadgeInfo[K]) {
    setBadge(p => ({ ...p, [k]: v }));
  }

  function updateZone(id: string, patch: Partial<AccessZone>) {
    setZones(p => p.map(z => z.id === id ? { ...z, ...patch } : z));
  }

  function updateSchedule(id: string, patch: Partial<AccessZone['schedule']>) {
    setZones(p => p.map(z =>
      z.id === id ? { ...z, schedule: { ...z.schedule, ...patch } } : z
    ));
  }

  async function confirmPin(zoneId: string) {
    if (!newPinValue) return;
    const hash = await hashPin(newPinValue);
    updateZone(zoneId, { pinHash: hash });
    setEditingPinFor(null);
    setNewPinValue('');
  }

  function addZone() {
    if (zones.length >= 5) return;
    const id = Date.now().toString();
    const z: AccessZone = {
      id, name: 'Nouvelle zone', emoji: '🚪', accessType: 'libre',
      schedule: { days: ['lun','mar','mer','jeu','ven'], startTime: '08:00', endTime: '18:00', allDay: false },
    };
    setZones(p => [...p, z]);
    setExpandedId(id);
  }

  async function uploadPhoto(file: File) {
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch('/api/upload?folder=accessBadges', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    if (data.url) setField('holderPhoto', data.url);
    setUploadingPhoto(false);
  }

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'access', config: { ...badge, zones } }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function exportCSV() {
    const hdr  = ['Zone','Statut','Date','Heure','Appareil'];
    const rows = logs.map(l => {
      const d = new Date(l.timestamp);
      return [l.zoneName, l.status === 'granted' ? 'Accordé' : 'Refusé', d.toLocaleDateString('fr-FR'), d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), l.device];
    });
    const csv = [hdr, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' }));
    Object.assign(document.createElement('a'), { href: url, download: 'journal_acces.csv' }).click();
    URL.revokeObjectURL(url);
  }

  const label: React.CSSProperties = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 };
  const sHead: React.CSSProperties = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', margin: 0 };
  const inputCss: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>🔑 Clé d&apos;accès</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Badge NFC multi-zones avec contrôle horaire</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* ── Col 1: Badge du porteur ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ ...sHead, marginBottom: 18 }}>Badge du porteur</h3>

            {/* Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { uploadPhoto(f); e.target.value = ''; } }} />
              <button onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto}
                style={{ width: 64, height: 64, borderRadius: '50%', border: '2px dashed rgba(99,102,241,0.4)', background: badge.holderPhoto ? 'none' : 'rgba(99,102,241,0.08)', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, padding: 0 }}>
                {badge.holderPhoto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={badge.holderPhoto} alt="Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: uploadingPhoto ? 14 : 24, color: '#818CF8' }}>{uploadingPhoto ? '⏳' : '+'}</span>
                }
              </button>
              <div>
                <p style={{ color: '#F8F9FC', fontSize: 13, margin: 0 }}>Photo du porteur</p>
                <p style={{ color: '#6B7280', fontSize: 11, margin: 0 }}>Optionnel · JPG/PNG</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="Titre du badge" placeholder="Badge Employé, Clé Résidence..." value={badge.title} onChange={e => setField('title', e.target.value)} />
              <Input label="Nom du porteur" placeholder="Koffi Mensah" value={badge.holderName} onChange={e => setField('holderName', e.target.value)} />
              <Input label="Rôle / Poste" placeholder="Directeur Commercial, Membre..." value={badge.holderRole} onChange={e => setField('holderRole', e.target.value)} />
            </div>
          </Card>

          {/* Aperçu badge */}
          <Card padding="md">
            <p style={label}>Aperçu badge</p>
            <div style={{ background: 'linear-gradient(135deg, #0D0E14, #1a1d2e)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {badge.holderPhoto
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={badge.holderPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 20 }}>👤</span>
                  }
                </div>
                <div>
                  <p style={{ color: '#F8F9FC', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, margin: 0 }}>{badge.holderName || 'Nom du porteur'}</p>
                  <p style={{ color: '#818CF8', fontSize: 11, margin: 0 }}>{badge.holderRole || 'Rôle'}</p>
                </div>
              </div>
              <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: 2, textTransform: 'uppercase' }}>{badge.title || 'Badge d\'accès'}</p>
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {zones.slice(0, 3).map(z => (
                  <span key={z.id} style={{ fontSize: 11, background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '3px 8px', color: '#9CA3AF' }}>{z.emoji} {z.name}</span>
                ))}
                {zones.length > 3 && <span style={{ fontSize: 11, color: '#6B7280' }}>+{zones.length - 3}</span>}
              </div>
            </div>
          </Card>

          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        {/* ── Col 2: Zones ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={sHead}>Zones d&apos;accès</h3>
                <p style={{ color: '#6B7280', fontSize: 11, margin: '2px 0 0' }}>Max 5 zones par badge</p>
              </div>
              {zones.length < 5 && (
                <button onClick={addZone}
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 14px', color: '#818CF8', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
                  + Ajouter
                </button>
              )}
            </div>

            {zones.length === 0 && (
              <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                Aucune zone — ajoutez une zone d&apos;accès ci-dessus
              </p>
            )}

            {zones.map((zone, idx) => {
              const isExpanded = expandedId === zone.id;
              return (
                <div key={zone.id} style={{ borderBottom: idx < zones.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: 12, marginBottom: 12 }}>
                  {/* Zone header (always visible) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
                    onClick={() => setExpandedId(isExpanded ? null : zone.id)}>
                    <span style={{ fontSize: 20 }}>{zone.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#F8F9FC', fontSize: 14, fontWeight: 600, margin: 0, fontFamily: 'DM Sans, sans-serif' }}>{zone.name}</p>
                      <p style={{ color: '#6B7280', fontSize: 11, margin: 0, fontFamily: 'Space Mono, monospace' }}>
                        {TYPE_LABELS[zone.accessType]} · {zone.schedule.allDay ? 'Toute la journée' : `${zone.schedule.startTime}–${zone.schedule.endTime}`}
                      </p>
                    </div>
                    <span style={{ fontSize: 12, background: zone.accessType === 'pin' ? 'rgba(245,158,11,0.15)' : zone.accessType === 'whatsapp' ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', color: zone.accessType === 'pin' ? '#F59E0B' : zone.accessType === 'whatsapp' ? '#10B981' : '#818CF8', borderRadius: 4, padding: '2px 8px', fontFamily: 'Space Mono, monospace' }}>
                      {TYPE_LABELS[zone.accessType]}
                    </span>
                    <button onClick={e => { e.stopPropagation(); setZones(p => p.filter(z => z.id !== zone.id)); if (expandedId === zone.id) setExpandedId(null); }}
                      style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0, flexShrink: 0 }}>×</button>
                    <span style={{ color: '#6B7280', fontSize: 12 }}>{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {/* Zone detail (expanded) */}
                  {isExpanded && (
                    <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

                      {/* Emoji + name */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                          <button onClick={() => setShowEmojiFor(showEmojiFor === zone.id ? null : zone.id)}
                            style={{ width: 44, height: 44, fontSize: 22, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer' }}>
                            {zone.emoji}
                          </button>
                          {showEmojiFor === zone.id && (
                            <div style={{ position: 'absolute', top: 48, left: 0, zIndex: 50, background: '#181B26', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10, padding: 8, display: 'flex', flexWrap: 'wrap', gap: 4, width: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
                              {EMOJIS.map(e => (
                                <button key={e} onClick={() => { updateZone(zone.id, { emoji: e }); setShowEmojiFor(null); }}
                                  style={{ width: 32, height: 32, fontSize: 18, background: 'none', border: 'none', borderRadius: 4, cursor: 'pointer' }}
                                  onMouseOver={ev => (ev.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                                  onMouseOut={ev => (ev.currentTarget.style.background = 'none')}>{e}</button>
                              ))}
                            </div>
                          )}
                        </div>
                        <input value={zone.name} onChange={e => updateZone(zone.id, { name: e.target.value })}
                          style={{ ...inputCss, flex: 1 }} placeholder="Nom de la zone" />
                      </div>

                      {/* Type selector */}
                      <div>
                        <p style={label}>Type d&apos;accès</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {(['libre','pin','whatsapp'] as const).map(t => (
                            <button key={t} onClick={() => updateZone(zone.id, { accessType: t })}
                              style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${zone.accessType === t ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: zone.accessType === t ? 'rgba(99,102,241,0.2)' : 'transparent', color: zone.accessType === t ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1 }}>
                              {TYPE_LABELS[t]}
                            </button>
                          ))}
                        </div>
                        <p style={{ color: '#6B7280', fontSize: 11, marginTop: 6 }}>
                          {zone.accessType === 'libre' && 'Badge NFC suffit — accès accordé sans code'}
                          {zone.accessType === 'pin'   && 'Code PIN chiffré requis pour ouvrir'}
                          {zone.accessType === 'whatsapp' && 'Envoie un message WhatsApp au responsable'}
                        </p>
                      </div>

                      {/* PIN config */}
                      {zone.accessType === 'pin' && (
                        <div>
                          <p style={label}>Code PIN</p>
                          {editingPinFor === zone.id ? (
                            <div style={{ display: 'flex', gap: 8 }}>
                              <input type="password" inputMode="numeric" value={newPinValue}
                                onChange={e => setNewPinValue(e.target.value)} placeholder="Nouveau PIN"
                                style={{ ...inputCss, flex: 1, letterSpacing: 4, fontSize: 18 }} autoFocus />
                              <button onClick={() => confirmPin(zone.id)}
                                style={{ padding: '0 14px', background: '#6366F1', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'Space Mono, monospace' }}>✓</button>
                              <button onClick={() => { setEditingPinFor(null); setNewPinValue(''); }}
                                style={{ padding: '0 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#6B7280', cursor: 'pointer', fontSize: 16 }}>×</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '10px 14px' }}>
                              <span style={{ color: zone.pinHash ? '#10B981' : '#6B7280', fontSize: 13 }}>
                                {zone.pinHash ? '● PIN configuré' : '⚠ Aucun PIN défini'}
                              </span>
                              <button onClick={() => setEditingPinFor(zone.id)}
                                style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                                {zone.pinHash ? 'Modifier' : 'Définir'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* WhatsApp */}
                      {zone.accessType === 'whatsapp' && (
                        <Input label="Numéro WhatsApp du responsable" placeholder="+229 97 00 00 00"
                          value={zone.whatsapp || ''} onChange={e => updateZone(zone.id, { whatsapp: e.target.value })} />
                      )}

                      {/* Schedule */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <p style={{ ...label, margin: 0 }}>Horaires</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ color: '#6B7280', fontSize: 11 }}>Toute la journée</span>
                            <Toggle on={zone.schedule.allDay} onToggle={() => updateSchedule(zone.id, { allDay: !zone.schedule.allDay })} />
                          </div>
                        </div>
                        {!zone.schedule.allDay && (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                              <Input label="De" type="time" value={zone.schedule.startTime} onChange={e => updateSchedule(zone.id, { startTime: e.target.value })} />
                              <Input label="À" type="time" value={zone.schedule.endTime} onChange={e => updateSchedule(zone.id, { endTime: e.target.value })} />
                            </div>
                          </>
                        )}
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {DAYS.map(d => {
                            const active = zone.schedule.days.includes(d);
                            return (
                              <button key={d} onClick={() => updateSchedule(zone.id, { days: active ? zone.schedule.days.filter(x => x !== d) : [...zone.schedule.days, d] })}
                                style={{ padding: '5px 10px', borderRadius: 5, border: `1px solid ${active ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: active ? 'rgba(99,102,241,0.2)' : 'transparent', color: active ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Message post-accès */}
                      <div>
                        <p style={label}>Message après accès accordé (optionnel)</p>
                        <input value={zone.afterAccessMessage || ''} onChange={e => updateZone(zone.id, { afterAccessMessage: e.target.value })}
                          placeholder="2ème étage à gauche · Code interphone : 47B"
                          style={inputCss} />
                      </div>

                      {/* Contact urgence */}
                      <div>
                        <p style={label}>Contact urgence (optionnel)</p>
                        <input value={zone.emergencyContact || ''} onChange={e => updateZone(zone.id, { emergencyContact: e.target.value })}
                          placeholder="Appeler Kofi : +229 97 00 00 00"
                          style={inputCss} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </Card>
        </div>

        {/* ── Col 3: Journal ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          <Card padding="md">
            <h3 style={{ ...sHead, marginBottom: 16 }}>Journal d&apos;accès</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              <div style={{ textAlign: 'center', padding: '14px 8px', background: 'rgba(16,185,129,0.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,0.15)' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#10B981', margin: 0 }}>{grantedToday}</p>
                <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>accordés auj.</p>
              </div>
              <div style={{ textAlign: 'center', padding: '14px 8px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#EF4444', margin: 0 }}>{deniedToday}</p>
                <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>refusés auj.</p>
              </div>
            </div>
            <button onClick={exportCSV}
              style={{ width: '100%', padding: '9px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#9CA3AF', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer', marginBottom: 16 }}>
              📥 Exporter CSV
            </button>
            <div style={{ maxHeight: 460, overflowY: 'auto' }}>
              {logs.length === 0 ? (
                <p style={{ color: '#6B7280', fontSize: 13, textAlign: 'center', padding: '24px 0' }}>Aucun accès enregistré</p>
              ) : (
                logs.map((l, i) => {
                  const d = new Date(l.timestamp);
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{l.status === 'granted' ? '✅' : '❌'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ color: '#F8F9FC', fontSize: 12, fontWeight: 500, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.zoneName}</p>
                        <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', margin: 0 }}>
                          {d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} · {d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
