'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MemberCardDoc } from '@/lib/types';

interface ClubConfig {
  clubName:  string;
  clubPhoto: string;
  website:   string;
  benefits:  string;
}

const LEVELS = [
  { key: 'silver',   label: 'Silver',   emoji: '🥈', color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)', border: 'rgba(156,163,175,0.3)' },
  { key: 'gold',     label: 'Gold',     emoji: '🥇', color: '#F59E0B', bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)'  },
  { key: 'platinum', label: 'Platinum', emoji: '💎', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)',   border: 'rgba(6,182,212,0.3)'   },
  { key: 'vip',      label: 'VIP',      emoji: '👑', color: '#6366F1', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)'  },
] as const;

type LevelKey = 'silver' | 'gold' | 'platinum' | 'vip';
const LEVEL_MAP = Object.fromEntries(LEVELS.map(l => [l.key, l])) as Record<LevelKey, typeof LEVELS[number]>;

// ── Inline member editor ──────────────────────────────────────────────────────
function MemberEditor({
  card,
  onSave,
  onCancel,
}: {
  card: Partial<MemberCardDoc>;
  onSave:   (data: Partial<MemberCardDoc>) => Promise<void>;
  onCancel: () => void;
}) {
  const [draft,     setDraft]     = useState<Partial<MemberCardDoc>>(card);
  const [saving,    setSaving]    = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef<HTMLInputElement>(null);

  const inputCss: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 };

  async function uploadPhoto(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch('/api/upload?folder=memberPhotos', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    if (data.url) setDraft(p => ({ ...p, photoUrl: data.url }));
    setUploading(false);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(draft);
    setSaving(false);
  }

  const currentLevel = LEVEL_MAP[draft.level ?? 'silver'];

  return (
    <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Photo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <input ref={photoRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={e => { const f = e.target.files?.[0]; if (f) { uploadPhoto(f); e.target.value = ''; } }} />
        <button onClick={() => photoRef.current?.click()} disabled={uploading}
          style={{ width: 52, height: 52, borderRadius: '50%', border: `2px dashed ${currentLevel.border}`, background: draft.photoUrl ? 'none' : currentLevel.bg, cursor: 'pointer', overflow: 'hidden', flexShrink: 0, padding: 0 }}>
          {draft.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={draft.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: uploading ? 12 : 20, color: currentLevel.color }}>{uploading ? '⏳' : '+'}</span>
          }
        </button>
        <div style={{ flex: 1 }}>
          <p style={lbl}>Photo du membre (optionnel)</p>
          <p style={{ color: '#6B7280', fontSize: 11, margin: 0 }}>JPG / PNG</p>
        </div>
      </div>

      <div>
        <p style={lbl}>Nom du membre</p>
        <input style={inputCss} placeholder="Kofi Mensah"
          value={draft.memberName || ''} onChange={e => setDraft(p => ({ ...p, memberName: e.target.value }))} />
      </div>
      <div>
        <p style={lbl}>Numéro de membre</p>
        <input style={inputCss} placeholder="CDE-2025-001"
          value={draft.memberId || ''} onChange={e => setDraft(p => ({ ...p, memberId: e.target.value }))} />
      </div>

      {/* Level selector */}
      <div>
        <p style={lbl}>Niveau</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {LEVELS.map(l => (
            <button key={l.key} onClick={() => setDraft(p => ({ ...p, level: l.key }))}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 6, border: `1px solid ${draft.level === l.key ? l.border : 'rgba(255,255,255,0.08)'}`, background: draft.level === l.key ? l.bg : 'transparent', color: draft.level === l.key ? l.color : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase' }}>
              {l.emoji} {l.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p style={lbl}>Date d&apos;expiration (optionnel)</p>
        <input type="date" style={inputCss}
          value={draft.expiryDate || ''} onChange={e => setDraft(p => ({ ...p, expiryDate: e.target.value }))} />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ flex: 1, padding: '9px 0', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontFamily: 'Syne, sans-serif', fontWeight: 700, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'Enregistrement…' : '✓ Enregistrer'}
        </button>
        <button onClick={onCancel}
          style={{ padding: '9px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#6B7280', fontSize: 13, cursor: 'pointer' }}>
          Annuler
        </button>
      </div>
    </div>
  );
}

// ── Card preview ─────────────────────────────────────────────────────────────
function CardPreview({ card, clubName, benefits }: { card: Partial<MemberCardDoc> | null; clubName: string; benefits: string }) {
  const level = LEVEL_MAP[(card?.level ?? 'silver') as LevelKey];
  const bens  = benefits.split('\n').filter(Boolean);

  return (
    <div style={{ background: `linear-gradient(135deg, #0D0E14, #181B26)`, border: `1px solid ${level.border}`, borderRadius: 14, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: level.color, textTransform: 'uppercase', marginBottom: 6 }}>Carte Membre</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', margin: 0 }}>
            {clubName || 'Club / Organisation'}
          </p>
        </div>
        <div style={{ background: level.bg, border: `1px solid ${level.border}`, borderRadius: 6, padding: '5px 12px', flexShrink: 0 }}>
          <span style={{ color: level.color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12 }}>{level.emoji} {level.label}</span>
        </div>
      </div>

      {/* Member info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: level.bg, border: `1px solid ${level.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {card?.photoUrl
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={card.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 20 }}>👤</span>
          }
        </div>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', margin: '0 0 2px' }}>
            {card?.memberName || 'Nom du membre'}
          </p>
          {card?.memberId && (
            <p style={{ color: level.color, fontSize: 11, fontFamily: 'Space Mono, monospace', margin: 0 }}>#{card.memberId}</p>
          )}
        </div>
      </div>

      {card?.expiryDate && (
        <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginBottom: 12 }}>
          Valable jusqu&apos;au {new Date(card.expiryDate).toLocaleDateString('fr-FR')}
        </p>
      )}

      {bens.length > 0 && (
        <div style={{ borderTop: `1px solid ${level.border}33`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bens.slice(0, 4).map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: level.color, flexShrink: 0, fontSize: 12 }}>✦</span>
              <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0 }}>{b}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
export default function MemberDashboard({
  initialConfig,
  initialCards,
  username,
}: {
  initialConfig: ClubConfig;
  initialCards:  MemberCardDoc[];
  username:      string;
}) {
  const router  = useRouter();
  const [config,  setConfig]  = useState<ClubConfig>(initialConfig);
  const [cards,   setCards]   = useState<MemberCardDoc[]>(initialCards);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [preview, setPreview] = useState<Partial<MemberCardDoc> | null>(initialCards[0] ?? null);
  const clubPhotoRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Member CRUD state
  const [addingCard,  setAddingCard]  = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [copied,      setCopied]      = useState<string | null>(null);

  // NFC assignment state
  const [assigningCard, setAssigningCard] = useState<string | null>(null);
  const [nfcInput,      setNfcInput]      = useState('');
  const [nfcError,      setNfcError]      = useState('');
  const [nfcScanning,   setNfcScanning]   = useState(false);
  const [nfcSaving,     setNfcSaving]     = useState(false);

  // ── Club save ──────────────────────────────────────────────────────────────
  async function saveClub() {
    setSaving(true);
    await fetch('/api/modules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'member', config }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch('/api/upload?folder=memberLogos', { method: 'POST', body: fd });
    const data = await res.json() as { url?: string };
    if (data.url) setConfig(p => ({ ...p, clubPhoto: data.url ?? '' }));
    setUploadingLogo(false);
  }

  // ── Member CRUD ────────────────────────────────────────────────────────────
  async function createCard(data: Partial<MemberCardDoc>) {
    const res  = await fetch('/api/member/cards', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json() as { card: MemberCardDoc };
    setCards(p => [...p, json.card]);
    setPreview(json.card);
    setAddingCard(false);
  }

  async function updateCard(id: string, data: Partial<MemberCardDoc>) {
    await fetch(`/api/member/cards?id=${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setCards(p => p.map(c => c.id === id ? { ...c, ...data } : c));
    setEditingCard(null);
  }

  async function deleteCard(id: string) {
    if (!confirm('Supprimer ce membre ?')) return;
    await fetch(`/api/member/cards?id=${id}`, { method: 'DELETE' });
    setCards(p => {
      const next = p.filter(c => c.id !== id);
      if (preview && (preview as MemberCardDoc).id === id) setPreview(next[0] ?? null);
      return next;
    });
  }

  function copyLink(cardId: string) {
    const url = `${window.location.origin}/m/${username}/member?card=${cardId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(cardId);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  // ── NFC assignment ─────────────────────────────────────────────────────────
  async function assignNfc(porteurId: string) {
    const code = nfcInput.trim().toUpperCase();
    if (!code) { setNfcError('Entre le code NFC de la carte.'); return; }
    setNfcSaving(true);
    setNfcError('');
    const res  = await fetch(`/api/member/cards?id=${porteurId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfcId: code }),
    });
    const data = await res.json() as { error?: string };
    setNfcSaving(false);
    if (!res.ok) { setNfcError(data.error ?? "Erreur lors de l'assignation."); return; }
    setCards(p => p.map(c => c.id === porteurId ? { ...c, nfcId: code } : c));
    setAssigningCard(null);
    setNfcInput('');
  }

  async function unlinkNfc(porteurId: string) {
    if (!confirm('Désassigner cette carte NFC du membre ?')) return;
    await fetch(`/api/member/cards?id=${porteurId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unlink: true }),
    });
    setCards(p => p.map(c => c.id === porteurId ? { ...c, nfcId: undefined } : c));
  }

  async function scanNfc(porteurId: string) {
    type NDEFReader = {
      scan: () => Promise<void>;
      addEventListener: (event: string, handler: (e: { serialNumber: string }) => void) => void;
    };
    const NDEFReaderCtor = (window as unknown as Record<string, unknown>).NDEFReader as (new () => NDEFReader) | undefined;
    if (!NDEFReaderCtor) { setNfcError('Web NFC non disponible sur cet appareil/navigateur.'); return; }
    setNfcScanning(true);
    setNfcError('');
    try {
      const reader = new NDEFReaderCtor();
      await reader.scan();
      reader.addEventListener('reading', (event: { serialNumber: string }) => {
        const id = event.serialNumber.replace(/:/g, '').toUpperCase();
        setNfcInput(id);
        setNfcScanning(false);
        void assignNfc(porteurId);
      });
    } catch {
      setNfcScanning(false);
      setNfcError('Scan annulé ou permission refusée.');
    }
  }

  const lbl: React.CSSProperties = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 };
  const sHead: React.CSSProperties = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', margin: 0 };
  const inputCss: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <button className="module-back-btn" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, lineHeight: 1, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>🎫 Carte Membre</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Adhésions multi-membres — 1 carte NFC par membre</p>
        </div>
      </div>

      <div className="module-3col" style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* ── Col 1 : Club config ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ ...sHead, marginBottom: 18 }}>Club / Organisation</h3>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <input ref={clubPhotoRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) { uploadLogo(f); e.target.value = ''; } }} />
              <button onClick={() => clubPhotoRef.current?.click()} disabled={uploadingLogo}
                style={{ width: 52, height: 52, borderRadius: 10, border: '2px dashed rgba(99,102,241,0.3)', background: config.clubPhoto ? 'none' : 'rgba(99,102,241,0.06)', cursor: 'pointer', overflow: 'hidden', flexShrink: 0, padding: 0 }}>
                {config.clubPhoto
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={config.clubPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontSize: uploadingLogo ? 12 : 22, color: '#818CF8' }}>{uploadingLogo ? '⏳' : '🏛️'}</span>
                }
              </button>
              <div>
                <p style={{ color: '#F8F9FC', fontSize: 13, margin: 0 }}>Logo (optionnel)</p>
                <p style={{ color: '#6B7280', fontSize: 11, margin: 0 }}>JPG / PNG</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <p style={lbl}>Nom du club</p>
                <input style={inputCss} placeholder="Cercle des Entrepreneurs"
                  value={config.clubName} onChange={e => setConfig(p => ({ ...p, clubName: e.target.value }))} />
              </div>
              <div>
                <p style={lbl}>Site web (optionnel)</p>
                <input style={inputCss} placeholder="https://monclub.com"
                  value={config.website} onChange={e => setConfig(p => ({ ...p, website: e.target.value }))} />
              </div>
              <div>
                <p style={lbl}>Avantages membres (partagés)</p>
                <textarea value={config.benefits} onChange={e => setConfig(p => ({ ...p, benefits: e.target.value }))} rows={4}
                  placeholder="- 20% de réduction sur tous les services&#10;- Accès VIP aux événements&#10;- Support prioritaire"
                  style={{ ...inputCss, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
            </div>
          </Card>

          <Button variant="gradient" size="lg" loading={saving} onClick={saveClub} style={{ width: '100%' }}>
            {saved ? '✓ Club sauvegardé !' : 'Sauvegarder le club'}
          </Button>
        </div>

        {/* ── Col 2 : Membres list ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div>
                <h3 style={sHead}>Membres</h3>
                <p style={{ color: '#6B7280', fontSize: 11, margin: '2px 0 0' }}>{cards.length} membre{cards.length !== 1 ? 's' : ''} · 1 carte NFC chacun</p>
              </div>
              {!addingCard && (
                <button onClick={() => { setAddingCard(true); setEditingCard(null); }}
                  style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, padding: '6px 12px', color: '#818CF8', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  + Nouveau
                </button>
              )}
            </div>

            {addingCard && (
              <div style={{ marginBottom: 16 }}>
                <MemberEditor
                  card={{ level: 'silver', memberName: '', memberId: '' }}
                  onSave={createCard}
                  onCancel={() => setAddingCard(false)}
                />
              </div>
            )}

            {cards.length === 0 && !addingCard ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>🎫</p>
                <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 16 }}>Aucun membre encore</p>
                <button onClick={() => setAddingCard(true)}
                  style={{ padding: '9px 18px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#818CF8', fontSize: 12, fontFamily: 'Space Mono, monospace', cursor: 'pointer' }}>
                  + Ajouter le premier membre
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map(card => {
                  const lvl = LEVEL_MAP[card.level];
                  return (
                    <div key={card.id}>
                      {/* Member row */}
                      <div
                        onClick={() => setPreview(card)}
                        style={{ background: preview && (preview as MemberCardDoc).id === card.id ? 'rgba(99,102,241,0.07)' : '#181B26', border: `1px solid ${preview && (preview as MemberCardDoc).id === card.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '12px 14px', cursor: 'pointer' }}>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Avatar */}
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: lvl.bg, border: `1px solid ${lvl.border}`, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {card.photoUrl
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={card.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : <span style={{ fontSize: 18 }}>👤</span>
                            }
                          </div>
                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <p style={{ color: '#F8F9FC', fontSize: 13, fontWeight: 600, margin: 0, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {card.memberName || 'Sans nom'}
                              </p>
                              <span style={{ fontSize: 11, background: lvl.bg, color: lvl.color, borderRadius: 4, padding: '1px 6px', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>{lvl.emoji} {lvl.label}</span>
                            </div>
                            {card.memberId && (
                              <p style={{ color: '#4B5563', fontSize: 11, margin: 0, fontFamily: 'Space Mono, monospace' }}>#{card.memberId}</p>
                            )}
                          </div>
                          {/* Actions */}
                          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => copyLink(card.id)} title="Copier le lien"
                              style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid rgba(255,255,255,0.1)', background: copied === card.id ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', color: copied === card.id ? '#10B981' : '#9CA3AF', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {copied === card.id ? '✓' : '🔗'}
                            </button>
                            <button onClick={() => setEditingCard(editingCard === card.id ? null : card.id)} title="Modifier"
                              style={{ width: 28, height: 28, borderRadius: 5, border: `1px solid ${editingCard === card.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`, background: editingCard === card.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)', color: editingCard === card.id ? '#818CF8' : '#9CA3AF', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              ✎
                            </button>
                            <button onClick={() => deleteCard(card.id)} title="Supprimer"
                              style={{ width: 28, height: 28, borderRadius: 5, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', color: '#EF4444', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              ×
                            </button>
                          </div>
                        </div>

                        {/* Link hint */}
                        <p style={{ color: '#374151', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          /m/{username}/member?card={card.id}
                        </p>

                        {/* NFC status */}
                        <div onClick={e => e.stopPropagation()}>
                          {card.nfcId ? (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '6px 10px' }}>
                              <span style={{ color: '#10B981', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
                                🔗 NFC: {card.nfcId.slice(0, 8)}{card.nfcId.length > 8 ? '…' : ''}
                              </span>
                              <button onClick={() => unlinkNfc(card.id)}
                                style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: 11, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                                Désassigner
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => { setAssigningCard(assigningCard === card.id ? null : card.id); setNfcInput(''); setNfcError(''); }}
                              style={{ marginTop: 8, width: '100%', padding: '6px 0', background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.25)', borderRadius: 6, color: '#818CF8', fontSize: 11, fontFamily: 'Space Mono, monospace', cursor: 'pointer', letterSpacing: 1 }}>
                              ⚡ LIER UNE CARTE NFC
                            </button>
                          )}
                        </div>
                      </div>

                      {/* NFC assignment panel */}
                      {assigningCard === card.id && (
                        <div style={{ marginTop: 8, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 14 }}>
                          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 10 }}>Lier une carte NFC</p>
                          <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 10, lineHeight: 1.6 }}>
                            Entre le code NFC de la carte physique (imprimé au dos), ou scanne-la depuis Android Chrome.
                          </p>
                          <div style={{ display: 'flex', gap: 8, marginBottom: nfcError ? 8 : 0 }}>
                            <input value={nfcInput}
                              onChange={e => { setNfcInput(e.target.value.toUpperCase()); setNfcError(''); }}
                              placeholder="Ex: A1B2C3D4E5"
                              style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '8px 10px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 11, outline: 'none', letterSpacing: 2 }} />
                            <button onClick={() => scanNfc(card.id)} disabled={nfcScanning}
                              style={{ padding: '8px 10px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#818CF8', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              {nfcScanning ? '📡…' : '📡'}
                            </button>
                            <button onClick={() => assignNfc(card.id)} disabled={nfcSaving || !nfcInput}
                              style={{ padding: '8px 14px', background: nfcInput ? 'linear-gradient(135deg, #4338CA, #6366F1)' : 'rgba(255,255,255,0.04)', border: 'none', borderRadius: 6, color: nfcInput ? '#fff' : '#4B5563', fontSize: 12, cursor: nfcInput ? 'pointer' : 'not-allowed', fontFamily: 'Space Mono, monospace' }}>
                              {nfcSaving ? '…' : '✓'}
                            </button>
                          </div>
                          {nfcError && <p style={{ color: '#EF4444', fontSize: 12, margin: 0 }}>{nfcError}</p>}
                        </div>
                      )}

                      {/* Inline edit form */}
                      {editingCard === card.id && (
                        <div style={{ marginTop: 8 }}>
                          <MemberEditor
                            card={card}
                            onSave={data => updateCard(card.id, data)}
                            onCancel={() => setEditingCard(null)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Col 3 : Aperçu ── */}
        <div style={{ position: 'sticky', top: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <p style={{ ...lbl, marginBottom: 16 }}>Aperçu carte</p>
            <CardPreview card={preview} clubName={config.clubName} benefits={config.benefits} />
            {!preview && (
              <p style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
                Cliquez sur un membre pour le prévisualiser
              </p>
            )}
          </Card>

          <div style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 14 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 8 }}>Comment ça marche</p>
            <p style={{ color: '#6B7280', fontSize: 12, lineHeight: 1.7, margin: 0 }}>
              Chaque membre a son propre lien 🔗. Liez-le à sa carte NFC physique via le bouton ⚡. Quand il tape la carte, il voit sa carte membre personnalisée.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
