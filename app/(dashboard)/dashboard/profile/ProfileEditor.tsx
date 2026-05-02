'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

const LS_SPLIT  = 'profile-split-pct';
const LS_WIDTH  = 'profile-total-width';

function useResizableLayout(initialSplit = 50, initialWidth = 1100) {
  const [pct, setPct]       = useState(initialSplit);
  const [width, setWidth]   = useState(initialWidth);
  const containerRef        = useRef<HTMLDivElement>(null);
  const dragModeRef         = useRef<'split' | 'width' | null>(null);
  const startXRef           = useRef(0);
  const startWidthRef       = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const s = window.localStorage.getItem(LS_SPLIT);
    if (s) { const n = parseFloat(s); if (!isNaN(n) && n >= 25 && n <= 75) setPct(n); }
    const w = window.localStorage.getItem(LS_WIDTH);
    if (w) { const n = parseFloat(w); if (!isNaN(n) && n >= 600 && n <= 2400) setWidth(n); }
  }, []);

  function getClientX(e: MouseEvent | TouchEvent) {
    return 'touches' in e ? e.touches[0].clientX : e.clientX;
  }

  useEffect(() => {
    function onMove(e: MouseEvent | TouchEvent) {
      if (!dragModeRef.current || !containerRef.current) return;
      const x = getClientX(e);
      if (dragModeRef.current === 'split') {
        const rect = containerRef.current.getBoundingClientRect();
        setPct(Math.max(25, Math.min(75, ((x - rect.left) / rect.width) * 100)));
      } else if (dragModeRef.current === 'width') {
        setWidth(Math.max(600, Math.min(2400, startWidthRef.current + x - startXRef.current)));
      }
    }
    function onUp() {
      if (dragModeRef.current) {
        try {
          if (dragModeRef.current === 'split') window.localStorage.setItem(LS_SPLIT, String(pct));
          if (dragModeRef.current === 'width') window.localStorage.setItem(LS_WIDTH, String(width));
        } catch {}
        dragModeRef.current = null;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: true });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    };
  }, [pct, width]);

  function onSplitDown(e: React.MouseEvent | React.TouchEvent) {
    dragModeRef.current = 'split';
    if (!('touches' in e)) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }
  }

  function onWidthDown(e: React.MouseEvent | React.TouchEvent) {
    dragModeRef.current = 'width';
    startXRef.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startWidthRef.current = width;
    if (!('touches' in e)) {
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }
  }

  return { pct, width, containerRef, onSplitDown, onWidthDown };
}

type Link = { id: string; type: string; label: string; url: string; order: number; isActive: boolean };
type Profile = {
  id: string;
  username: string;
  displayName: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  avatar?: string | null;
  theme: string;
  links: Link[];
} | null;

const LINK_TYPES = [
  { value: 'phone',     label: 'Téléphone',  prefix: 'tel:' },
  { value: 'email',     label: 'Email',       prefix: 'mailto:' },
  { value: 'whatsapp',  label: 'WhatsApp',   prefix: 'https://wa.me/' },
  { value: 'linkedin',  label: 'LinkedIn',   prefix: 'https://linkedin.com/in/' },
  { value: 'instagram', label: 'Instagram',  prefix: 'https://instagram.com/' },
  { value: 'website',   label: 'Site web',   prefix: 'https://' },
  { value: 'calendly',  label: 'Calendly',   prefix: 'https://calendly.com/' },
  { value: 'portfolio', label: 'Portfolio',  prefix: 'https://' },
  { value: 'custom',    label: 'Autre lien', prefix: 'https://' },
];

const THEMES = [
  { value: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #0D0E14, #181B26)' },
  { value: 'electric', label: 'Electric', bg: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  { value: 'glass',    label: 'Glass',    bg: 'linear-gradient(135deg, #0f172a, #1e293b)' },
  { value: 'metal',    label: 'Metal',    bg: 'linear-gradient(135deg, #111827, #1f2937)' },
];

export default function ProfileEditor({ profile }: { profile: Profile }) {
  const [form, setForm] = useState({
    displayName: profile?.displayName ?? '',
    title:       profile?.title ?? '',
    company:     profile?.company ?? '',
    bio:         profile?.bio ?? '',
    username:    profile?.username ?? '',
    theme:       profile?.theme ?? 'midnight',
  });
  const [links, setLinks]          = useState<Link[]>(profile?.links ?? []);
  const [avatar, setAvatar]        = useState<string | null>(profile?.avatar ?? null);
  const [uploading, setUploading]  = useState(false);
  const fileInputRef               = useRef<HTMLInputElement>(null);
  const [saving, setSaving]        = useState(false);
  const [newLinkType, setNewLinkType] = useState('phone');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl]   = useState('');
  const [saved, setSaved] = useState(false);

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/profile/avatar', { method: 'POST', body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) setAvatar(data.url);
      else alert(data.error ?? 'Erreur lors de l\'upload.');
    } finally {
      setUploading(false);
    }
  }

  function toSlug(raw: string) {
    return raw
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'username' ? toSlug(e.target.value) : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  async function saveProfile() {
    setSaving(true);
    await fetch('/api/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addLink() {
    if (!newLinkLabel || !newLinkUrl) return;
    const res = await fetch('/api/links', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: newLinkType, label: newLinkLabel, url: newLinkUrl }),
    });
    const link = await res.json() as Link;
    setLinks((prev) => [...prev, link]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  }

  async function deleteLink(id: string) {
    await fetch(`/api/links?id=${id}`, { method: 'DELETE' });
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }

  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editType, setEditType]       = useState('phone');
  const [editLabel, setEditLabel]     = useState('');
  const [editUrl, setEditUrl]         = useState('');
  const [savingEdit, setSavingEdit]   = useState(false);

  function startEdit(link: Link) {
    setEditingId(link.id);
    setEditType(link.type);
    setEditLabel(link.label);
    setEditUrl(link.url);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel('');
    setEditUrl('');
  }

  async function saveEdit(id: string) {
    if (!editLabel.trim() || !editUrl.trim()) return;
    setSavingEdit(true);
    const res = await fetch('/api/links', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, type: editType, label: editLabel, url: editUrl }),
    });
    if (res.ok) {
      const updated = await res.json() as Link;
      setLinks((prev) => prev.map((l) => l.id === id ? { ...l, ...updated } : l));
      cancelEdit();
    }
    setSavingEdit(false);
  }

  const { pct, width, containerRef, onSplitDown, onWidthDown } = useResizableLayout(50, 1100);

  return (
    <div ref={containerRef} style={{ width, maxWidth: '100%', display: 'flex', alignItems: 'stretch', gap: 0, position: 'relative' }}>
      {/* Profile form (left column) */}
      <div style={{ flex: `0 0 calc(${pct}% - 14px)`, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
            Photo de profil
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 4 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', padding: 2, flexShrink: 0 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#12141C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {avatar ? (
                  <Image src={avatar} alt="Avatar" width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {form.displayName.charAt(0).toUpperCase() || '?'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }}
              />
              <Button variant="secondary" size="sm" loading={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? 'Upload...' : avatar ? 'Changer la photo' : 'Ajouter une photo'}
              </Button>
              <p style={{ color: '#6B7280', fontSize: 12, marginTop: 8 }}>JPG, PNG · Max 5 Mo</p>
            </div>
          </div>
        </Card>

        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
            Informations du profil
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Nom affiché" value={form.displayName} onChange={set('displayName')} placeholder="Sophie Martin" />
            <Input label="Titre / Poste" value={form.title} onChange={set('title')} placeholder="CEO & Founder" />
            <Input label="Entreprise" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
            <Textarea label="Bio" value={form.bio} onChange={set('bio')} placeholder="Une courte présentation..." style={{ minHeight: 80 }} />
            <Input label="Nom d'utilisateur" value={form.username} onChange={set('username')} hint={`weconnect.cards/${form.username || '…'}`} />
          </div>
        </Card>

        {/* Theme */}
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 16 }}>
            Thème de carte
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {THEMES.map((t) => (
              <button
                key={t.value}
                onClick={() => setForm((p) => ({ ...p, theme: t.value }))}
                style={{
                  padding: '14px 16px',
                  background:   t.bg,
                  border: `2px solid ${form.theme === t.value ? '#6366F1' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 6,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#F8F9FC' }}>{t.label}</span>
                {form.theme === t.value && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </Card>

        <Button variant="gradient" size="lg" loading={saving} onClick={saveProfile} style={{ width: '100%' }}>
          {saved ? '✓ Sauvegardé !' : saving ? 'Sauvegarde...' : 'Sauvegarder le profil'}
        </Button>
      </div>

      {/* Middle drag handle (split ratio) */}
      <div
        onMouseDown={onSplitDown}
        onTouchStart={onSplitDown}
        style={{
          width: 28,
          cursor: 'col-resize',
          position: 'relative',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
        }}
        title="Redimensionner les colonnes"
      >
        <div style={{
          width: 4,
          height: 60,
          borderRadius: 2,
          background: 'rgba(99,102,241,0.25)',
          transition: 'background 0.2s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.6)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.25)'; }}
        />
      </div>

      {/* Links */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 0 }}>
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
            Liens ({links.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {links.map((link) => editingId === link.id ? (
              <div
                key={link.id}
                style={{
                  display: 'flex', flexDirection: 'column', gap: 8,
                  padding: 12,
                  background: 'rgba(99,102,241,0.06)',
                  border: '1px solid rgba(99,102,241,0.25)',
                  borderRadius: 6,
                }}
              >
                <select
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '8px 10px',
                    color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                    outline: 'none', cursor: 'pointer',
                  }}
                >
                  {LINK_TYPES.map((t) => (
                    <option key={t.value} value={t.value} style={{ background: '#181B26' }}>{t.label}</option>
                  ))}
                </select>
                <input
                  placeholder="Label"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '8px 10px',
                    color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                    outline: 'none',
                  }}
                />
                <input
                  placeholder="URL"
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '8px 10px',
                    color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="gradient" size="sm" loading={savingEdit} onClick={() => saveEdit(link.id)} style={{ flex: 1 }}>
                    Sauvegarder
                  </Button>
                  <Button variant="ghost" size="sm" onClick={cancelEdit} style={{ flex: 1 }}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <div
                key={link.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6,
                }}
              >
                <Badge variant="electric">{link.type}</Badge>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {link.label}
                  </p>
                  <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {link.url}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(link)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#818CF8', padding: 4, flexShrink: 0,
                    opacity: 0.7, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                  title="Modifier"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#EF4444', padding: 4, flexShrink: 0,
                    opacity: 0.6, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
                  title="Supprimer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add link */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 20 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>
              Ajouter un lien
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <select
                value={newLinkType}
                onChange={(e) => setNewLinkType(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '10px 14px',
                  color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                  outline: 'none', cursor: 'pointer',
                }}
              >
                {LINK_TYPES.map((t) => (
                  <option key={t.value} value={t.value} style={{ background: '#181B26' }}>{t.label}</option>
                ))}
              </select>
              <input
                placeholder="Label (ex: Mon WhatsApp)"
                value={newLinkLabel}
                onChange={(e) => setNewLinkLabel(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '10px 14px',
                  color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                  outline: 'none',
                }}
              />
              <input
                placeholder="URL ou numéro"
                value={newLinkUrl}
                onChange={(e) => setNewLinkUrl(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '10px 14px',
                  color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                  outline: 'none',
                }}
              />
              <Button variant="secondary" size="sm" onClick={addLink} style={{ width: '100%' }}>
                + Ajouter
              </Button>
            </div>
          </div>
        </Card>

        {/* Preview */}
        {profile?.username && (
          <Card padding="sm">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>
              Aperçu
            </p>
            <a
              href={`/${profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                color: '#818CF8', textDecoration: 'none',
                fontFamily: 'DM Sans, sans-serif', fontSize: 14,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              weconnect.cards/{profile.username}
            </a>
          </Card>
        )}
      </div>

      {/* Right-edge resize handle (total width) */}
      <div
        onMouseDown={onWidthDown}
        onTouchStart={onWidthDown}
        style={{
          width: 14,
          cursor: 'ew-resize',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          userSelect: 'none',
          marginLeft: 8,
        }}
        title="Élargir / rétrécir"
      >
        <div style={{
          width: 4,
          height: 60,
          borderRadius: 2,
          background: 'rgba(99,102,241,0.25)',
          transition: 'background 0.2s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.6)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.25)'; }}
        />
      </div>
    </div>
  );
}
