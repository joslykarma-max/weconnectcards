'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { SECTORS } from '@/lib/sectors';

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
type DisplayMode = 'classic' | 'grid' | 'card';
type Profile = {
  id: string;
  username: string;
  displayName: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  avatar?: string | null;
  theme: string;
  displayMode?: DisplayMode;
  links: Link[];
} | null;

const DISPLAY_MODES: { value: DisplayMode; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    value: 'classic',
    label: 'Classique',
    desc: 'Liens en liste verticale',
    preview: (
      <svg viewBox="0 0 60 48" width="60" height="48" fill="none">
        <rect x="4" y="6" width="52" height="8" rx="3" fill="currentColor" opacity=".5"/>
        <rect x="4" y="20" width="52" height="8" rx="3" fill="currentColor" opacity=".5"/>
        <rect x="4" y="34" width="52" height="8" rx="3" fill="currentColor" opacity=".5"/>
      </svg>
    ),
  },
  {
    value: 'grid',
    label: 'Grille sociale',
    desc: 'Icônes en grille colorée',
    preview: (
      <svg viewBox="0 0 60 48" width="60" height="48" fill="none">
        <rect x="4"  y="4"  width="16" height="16" rx="4" fill="currentColor" opacity=".6"/>
        <rect x="22" y="4"  width="16" height="16" rx="4" fill="currentColor" opacity=".6"/>
        <rect x="40" y="4"  width="16" height="16" rx="4" fill="currentColor" opacity=".6"/>
        <rect x="4"  y="24" width="16" height="16" rx="4" fill="currentColor" opacity=".4"/>
        <rect x="22" y="24" width="16" height="16" rx="4" fill="currentColor" opacity=".4"/>
        <rect x="40" y="24" width="16" height="16" rx="4" fill="currentColor" opacity=".4"/>
      </svg>
    ),
  },
  {
    value: 'card',
    label: 'Carte Pro',
    desc: 'Style carte de visite',
    preview: (
      <svg viewBox="0 0 60 48" width="60" height="48" fill="none">
        <rect x="4" y="4" width="52" height="22" rx="4" fill="currentColor" opacity=".3"/>
        <circle cx="18" cy="15" r="8" fill="currentColor" opacity=".6"/>
        <rect x="30" y="9"  width="22" height="4" rx="2" fill="currentColor" opacity=".5"/>
        <rect x="30" y="16" width="16" height="3" rx="1.5" fill="currentColor" opacity=".35"/>
        <rect x="4"  y="32" width="12" height="12" rx="3" fill="currentColor" opacity=".4"/>
        <rect x="19" y="32" width="12" height="12" rx="3" fill="currentColor" opacity=".4"/>
        <rect x="34" y="32" width="12" height="12" rx="3" fill="currentColor" opacity=".4"/>
      </svg>
    ),
  },
];

const LINK_TYPES = [
  { value: 'phone',     label: 'Téléphone'    },
  { value: 'email',     label: 'Email'        },
  { value: 'whatsapp',  label: 'WhatsApp'     },
  { value: 'linkedin',  label: 'LinkedIn'     },
  { value: 'instagram', label: 'Instagram'    },
  { value: 'website',   label: 'Site web'     },
  { value: 'location',  label: 'Localisation' },
  { value: 'calendly',  label: 'Calendly'     },
  { value: 'portfolio', label: 'Portfolio'    },
  { value: 'custom',    label: 'Autre lien'   },
];

const VISIBILITY_FIELDS = [
  { key: 'avatar',  label: 'Photo de profil' },
  { key: 'title',   label: 'Titre / Poste'   },
  { key: 'company', label: 'Entreprise'      },
  { key: 'bio',     label: 'Bio'             },
];

// Per-type form config: what to ask + how to build the stored URL
const LINK_FORM_CONFIG: Record<string, {
  inputLabel: string;
  placeholder: string;
  autoLabel: string;
  buildUrl: (val: string) => string;
  module?: string;  // redirect to module instead of showing a URL input
}> = {
  phone: {
    inputLabel: 'Numéro de téléphone',
    placeholder: '+229 97 00 00 00',
    autoLabel: 'Téléphone',
    buildUrl: (v) => `tel:${v.trim()}`,
  },
  email: {
    inputLabel: 'Adresse email',
    placeholder: 'contact@exemple.com',
    autoLabel: 'Email',
    buildUrl: (v) => `mailto:${v.trim()}`,
  },
  whatsapp: {
    inputLabel: 'Numéro WhatsApp (avec indicatif)',
    placeholder: '+229 97 00 00 00',
    autoLabel: 'WhatsApp',
    buildUrl: (v) => `https://wa.me/${v.trim().replace(/[^0-9]/g, '')}`,
  },
  linkedin: {
    inputLabel: 'Lien du profil LinkedIn',
    placeholder: 'https://linkedin.com/in/votre-profil',
    autoLabel: 'LinkedIn',
    buildUrl: (v) => /^https?:/.test(v) ? v : `https://linkedin.com/in/${v.trim().replace(/^\//, '')}`,
  },
  instagram: {
    inputLabel: 'Lien du profil Instagram',
    placeholder: 'https://instagram.com/votre_compte',
    autoLabel: 'Instagram',
    buildUrl: (v) => /^https?:/.test(v) ? v : `https://instagram.com/${v.trim().replace(/^@/, '')}`,
  },
  website: {
    inputLabel: 'URL du site',
    placeholder: 'https://monsite.com',
    autoLabel: 'Site web',
    buildUrl: (v) => v.trim(),
  },
  location: {
    inputLabel: 'Adresse ou lien Google Maps',
    placeholder: 'Ex : Cotonou, Bénin ou https://maps.app.goo.gl/...',
    autoLabel: 'Localisation',
    buildUrl: (v) => /^https?:/.test(v.trim()) ? v.trim() : `https://maps.google.com/?q=${encodeURIComponent(v.trim())}`,
  },
  calendly: {
    inputLabel: 'Lien Calendly',
    placeholder: 'https://calendly.com/votre-nom',
    autoLabel: 'Calendly',
    buildUrl: (v) => /^https?:/.test(v) ? v : `https://calendly.com/${v.trim().replace(/^\//, '')}`,
  },
  portfolio: {
    inputLabel: '',
    placeholder: '',
    autoLabel: 'Portfolio',
    buildUrl: (v) => v,
    module: '/dashboard/modules/portfolio',
  },
  custom: {
    inputLabel: 'URL',
    placeholder: 'https://...',
    autoLabel: '',
    buildUrl: (v) => v.trim(),
  },
};

const THEMES = [
  { value: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #0D0E14, #181B26)' },
  { value: 'electric', label: 'Electric', bg: 'linear-gradient(135deg, #1e1b4b, #312e81)' },
  { value: 'glass',    label: 'Glass',    bg: 'linear-gradient(135deg, #0f172a, #1e293b)' },
  { value: 'metal',    label: 'Metal',    bg: 'linear-gradient(135deg, #111827, #1f2937)' },
];

export default function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [form, setForm] = useState({
    displayName: profile?.displayName ?? '',
    title:       profile?.title ?? '',
    company:     profile?.company ?? '',
    bio:         profile?.bio ?? '',
    username:    profile?.username ?? '',
    theme:       profile?.theme ?? 'midnight',
  });
  const [displayMode, setDisplayMode]   = useState<DisplayMode>(profile?.displayMode ?? 'classic');
  const [hiddenFields, setHiddenFields] = useState<string[]>((profile as Record<string, unknown> & { hiddenFields?: string[] })?.hiddenFields ?? []);
  const [inDirectory, setInDirectory]   = useState<boolean>((profile as Record<string, unknown> & { inDirectory?: boolean })?.inDirectory ?? false);
  const [sector, setSector]             = useState<string>((profile as Record<string, unknown> & { sector?: string })?.sector ?? '');

  function toggleField(key: string) {
    setHiddenFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  }
  const [links, setLinks]             = useState<Link[]>(profile?.links ?? []);
  const [avatar, setAvatar]           = useState<string | null>(profile?.avatar ?? null);
  const [bgImage, setBgImage]         = useState<string | null>((profile as Record<string, unknown> & { backgroundImage?: string })?.backgroundImage ?? null);
  const [uploading, setUploading]     = useState(false);
  const [uploadingBg, setUploadingBg] = useState(false);
  const fileInputRef                  = useRef<HTMLInputElement>(null);
  const bgFileInputRef                = useRef<HTMLInputElement>(null);
  const [saving, setSaving]           = useState(false);
  const [newLinkType, setNewLinkType] = useState('phone');
  const [newLinkValue, setNewLinkValue] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState(LINK_FORM_CONFIG['phone'].autoLabel);
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

  async function uploadBackground(file: File) {
    setUploadingBg(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch('/api/upload?folder=backgrounds', { method: 'POST', body: fd });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) setBgImage(data.url);
      else alert(data.error ?? 'Erreur lors de l\'upload.');
    } finally {
      setUploadingBg(false);
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
      body:    JSON.stringify({ ...form, backgroundImage: bgImage ?? null, displayMode, hiddenFields, inDirectory, sector: sector || null }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addLink() {
    if (!newLinkValue.trim() || !newLinkLabel.trim()) return;
    const cfg = LINK_FORM_CONFIG[newLinkType] ?? LINK_FORM_CONFIG['custom'];
    const url = cfg.buildUrl(newLinkValue);
    const res = await fetch('/api/links', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: newLinkType, label: newLinkLabel, url }),
    });
    const link = await res.json() as Link;
    setLinks((prev) => [...prev, link]);
    setNewLinkValue('');
    setNewLinkLabel(cfg.autoLabel);
  }

  function handleTypeChange(type: string) {
    setNewLinkType(type);
    setNewLinkValue('');
    setNewLinkLabel(LINK_FORM_CONFIG[type]?.autoLabel ?? '');
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

          {/* Visibility toggles */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, marginTop: 8 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>
              Champs visibles sur la page publique
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {VISIBILITY_FIELDS.map((f) => {
                const visible = !hiddenFields.includes(f.key);
                return (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: visible ? '#D1D5DB' : '#4B5563' }}>
                      {f.label}
                    </span>
                    <button
                      onClick={() => toggleField(f.key)}
                      style={{
                        width: 40, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', position: 'relative',
                        background: visible ? '#6366F1' : 'rgba(255,255,255,0.1)',
                        transition: 'background 0.2s',
                        flexShrink: 0,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, width: 16, height: 16, borderRadius: '50%', background: '#fff',
                        left: visible ? 21 : 3,
                        transition: 'left 0.2s',
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Theme */}
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 16 }}>
            Thème de carte
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
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

          {/* Display mode selector */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, marginTop: 4 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>
              Mode d'affichage
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {DISPLAY_MODES.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setDisplayMode(m.value)}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 8px',
                    border: `2px solid ${displayMode === m.value ? '#6366F1' : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 8,
                    background: displayMode === m.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    color: displayMode === m.value ? '#818CF8' : '#6B7280',
                    transition: 'all 0.2s',
                  }}
                >
                  {m.preview}
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: displayMode === m.value ? '#818CF8' : '#9CA3AF' }}>
                    {m.label}
                  </span>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#4B5563', textAlign: 'center', lineHeight: 1.3 }}>
                    {m.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Background image */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>
              Image de fond (optionnel)
            </p>
            <input
              ref={bgFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { void uploadBackground(f); } e.target.value = ''; }}
            />
            {bgImage ? (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 72, height: 48, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                  backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Image définie
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" size="sm" loading={uploadingBg} onClick={() => bgFileInputRef.current?.click()}>
                      Changer
                    </Button>
                    <button onClick={() => setBgImage(null)}
                      style={{ padding: '5px 10px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 5, color: '#EF4444', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button onClick={() => bgFileInputRef.current?.click()} disabled={uploadingBg}
                style={{
                  width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: 6, color: '#6B7280', cursor: uploadingBg ? 'wait' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                }}>
                {uploadingBg ? '⏳ Upload...' : '🖼 Ajouter une image de fond'}
              </button>
            )}
            <p style={{ color: '#4B5563', fontSize: 11, marginTop: 8, fontFamily: 'DM Sans, sans-serif' }}>
              Une overlay sombre est ajoutée automatiquement pour que le texte reste lisible.
            </p>
          </div>
        </Card>

        {/* Annuaire */}
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 4 }}>
            Annuaire We Connect
          </h3>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginBottom: 16 }}>
            Apparaissez dans l'annuaire public des membres du réseau.
          </p>

          {/* Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: inDirectory ? 16 : 0 }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#F8F9FC', fontWeight: 600 }}>
                Visible dans l'annuaire
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                {inDirectory ? "Votre profil est visible dans l'annuaire" : "Votre profil est masqué de l'annuaire"}
              </p>
            </div>
            <button
              onClick={() => setInDirectory((v) => !v)}
              style={{
                width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: inDirectory ? 'linear-gradient(90deg, #6366F1, #06B6D4)' : 'rgba(255,255,255,0.1)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 3, left: inDirectory ? 23 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 0.2s', display: 'block',
              }} />
            </button>
          </div>

          {/* Sector selector — only when visible */}
          {inDirectory && (
            <div>
              <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', display: 'block', marginBottom: 6 }}>
                Secteur d'activité
              </label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${sector ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 8, color: sector ? '#F8F9FC' : '#6B7280',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                  outline: 'none', cursor: 'pointer', appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  paddingRight: 36,
                }}
              >
                <option value="" style={{ background: '#181B26', color: '#6B7280' }}>Choisir un secteur…</option>
                {SECTORS.map((s) => (
                  <option key={s} value={s} style={{ background: '#181B26' }}>{s}</option>
                ))}
              </select>
              {!sector && (
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#EF4444', marginTop: 6 }}>
                  Sélectionnez un secteur pour apparaître dans les filtres de l'annuaire.
                </p>
              )}
            </div>
          )}
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
                  placeholder="Nom affiché"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(link.id); if (e.key === 'Escape') cancelEdit(); }}
                  aria-label="Label du lien"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 4, padding: '8px 10px',
                    color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                    outline: 'none',
                  }}
                />
                <input
                  placeholder={LINK_FORM_CONFIG[editType]?.placeholder ?? 'https://...'}
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(link.id); if (e.key === 'Escape') cancelEdit(); }}
                  aria-label={LINK_FORM_CONFIG[editType]?.inputLabel ?? 'URL du lien'}
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
                  aria-label={`Modifier le lien ${link.label}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#818CF8', padding: 4, flexShrink: 0,
                    opacity: 0.7, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button
                  onClick={() => deleteLink(link.id)}
                  aria-label={`Supprimer le lien ${link.label}`}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#EF4444', padding: 4, flexShrink: 0,
                    opacity: 0.6, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.6')}
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

              {/* Type selector as pill grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                {LINK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => handleTypeChange(t.value)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: 6,
                      border: `1px solid ${newLinkType === t.value ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.07)'}`,
                      background: newLinkType === t.value ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)',
                      color: newLinkType === t.value ? '#818CF8' : '#9CA3AF',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: 12,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Portfolio → redirect to module builder */}
              {newLinkType === 'portfolio' ? (
                <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '16px', textAlign: 'center' }}>
                  <p style={{ color: '#818CF8', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
                    🎵 Portfolio Artiste
                  </p>
                  <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 14, fontFamily: 'DM Sans, sans-serif' }}>
                    Crée une page portfolio avec bannière, liens plateformes, bio et email de booking.
                  </p>
                  <Button variant="gradient" size="sm" onClick={() => router.push('/dashboard/modules/portfolio')} style={{ width: '100%' }}>
                    Créer mon portfolio →
                  </Button>
                </div>
              ) : (
                <>
                  {/* Dynamic input based on type */}
                  <div>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1.5, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
                      {LINK_FORM_CONFIG[newLinkType]?.inputLabel ?? 'Valeur'}
                    </p>
                    <input
                      placeholder={LINK_FORM_CONFIG[newLinkType]?.placeholder ?? ''}
                      value={newLinkValue}
                      onChange={(e) => setNewLinkValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void addLink(); }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, padding: '10px 14px',
                        color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* Label (editable, pre-filled with auto-label) */}
                  <div>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1.5, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
                      Nom affiché
                    </p>
                    <input
                      placeholder="Ex: Mon WhatsApp pro"
                      value={newLinkLabel}
                      onChange={(e) => setNewLinkLabel(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') void addLink(); }}
                      style={{
                        width: '100%', boxSizing: 'border-box',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 6, padding: '10px 14px',
                        color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
                        outline: 'none',
                      }}
                    />
                  </div>

                  <Button variant="secondary" size="sm" onClick={addLink} style={{ width: '100%' }}>
                    + Ajouter
                  </Button>
                </>
              )}
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
