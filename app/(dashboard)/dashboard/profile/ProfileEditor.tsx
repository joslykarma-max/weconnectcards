'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import { SECTORS } from '@/lib/sectors';
import st from './profile.module.css';
import { DEFAULT_DISPLAY_MODE, type DisplayMode } from '@/lib/display-mode';

type Link = { id: string; type: string; label: string; url: string; order: number; isActive: boolean };
type Profile = {
  id: string;
  username: string;
  displayName: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  tagline?: string | null;
  avatar?: string | null;
  theme: string;
  displayMode?: DisplayMode;
  hiddenFields?: string[];
  isPublic?: boolean;
  links: Link[];
} | null;

const DISPLAY_MODES: { value: DisplayMode; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    value: 'light',
    label: 'Clair',
    desc: 'Par défaut · fond clair, bulles',
    preview: (
      <svg viewBox="0 0 60 48" width="60" height="48" fill="none">
        <rect x="6" y="10" width="48" height="20" rx="5" fill="currentColor" opacity=".3"/>
        <circle cx="30" cy="11" r="8" fill="currentColor" opacity=".7"/>
        <rect x="18" y="22" width="24" height="4" rx="2" fill="currentColor" opacity=".55"/>
        <rect x="6" y="34" width="48" height="10" rx="4" fill="currentColor" opacity=".18"/>
        <circle cx="18" cy="39" r="2.5" fill="currentColor" opacity=".55"/>
        <circle cx="30" cy="39" r="2.5" fill="currentColor" opacity=".55"/>
        <circle cx="42" cy="39" r="2.5" fill="currentColor" opacity=".55"/>
      </svg>
    ),
  },
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

type ProfileOption = { id: string; label: string; username: string };

export default function ProfileEditor({ profile, profileId, isMain, profiles }: {
  profile:   Profile;
  profileId: string;
  isMain:    boolean;
  profiles:  ProfileOption[];
}) {
  const router = useRouter();
  // Targets the edited profile in API calls (main profile needs no param)
  const q = isMain ? '' : `profileId=${encodeURIComponent(profileId)}`;
  const withQ = (url: string) => q ? `${url}${url.includes('?') ? '&' : '?'}${q}` : url;
  const [form, setForm] = useState({
    displayName: profile?.displayName ?? '',
    title:       profile?.title ?? '',
    company:     profile?.company ?? '',
    bio:         profile?.bio ?? '',
    tagline:     profile?.tagline ?? '',
    username:    profile?.username ?? '',
    theme:       profile?.theme ?? 'midnight',
  });
  const [displayMode, setDisplayMode]   = useState<DisplayMode>(profile?.displayMode ?? DEFAULT_DISPLAY_MODE);
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
  const [saveError, setSaveError] = useState('');

  async function uploadAvatar(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res  = await fetch(withQ('/api/profile/avatar'), { method: 'POST', body: fd });
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
    setSaveError('');
    const res = await fetch(withQ('/api/profile'), {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...form, backgroundImage: bgImage ?? null, displayMode, hiddenFields, inDirectory, sector: sector || null }),
    });
    setSaving(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setSaveError(d.error ?? 'Erreur lors de l\'enregistrement.');
      return;
    }
    router.refresh();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function addLink() {
    if (!newLinkValue.trim() || !newLinkLabel.trim()) return;
    const cfg = LINK_FORM_CONFIG[newLinkType] ?? LINK_FORM_CONFIG['custom'];
    const url = cfg.buildUrl(newLinkValue);
    const res = await fetch(withQ('/api/links'), {
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
    await fetch(withQ(`/api/links?id=${id}`), { method: 'DELETE' });
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
    const res = await fetch(withQ('/api/links'), {
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

  // Renaming entries of the profile switcher (one per card)
  const [renamingId, setRenamingId]   = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [savingRename, setSavingRename] = useState(false);
  const [labels, setLabels]           = useState<Record<string, string>>({});

  function startRename(p: ProfileOption) {
    setRenamingId(p.id);
    setRenameValue(labels[p.id] ?? p.label);
  }

  async function saveRename(id: string) {
    setSavingRename(true);
    const res = await fetch(`/api/profile?profileId=${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: renameValue }),
    });
    setSavingRename(false);
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      alert(d.error ?? 'Erreur lors du renommage.');
      return;
    }
    const name = renameValue.trim().slice(0, 40);
    setLabels((prev) => {
      const next = { ...prev };
      if (name) next[id] = name; else delete next[id];
      return next;
    });
    setRenamingId(null);
    router.refresh();
  }

  const [tab, setTab] = useState<'infos' | 'liens' | 'style' | 'visibilite' | 'apercu'>('infos');
  const TABS = [
    { key: 'infos',      label: 'Infos' },
    { key: 'liens',      label: `Liens · ${links.length}` },
    { key: 'style',      label: 'Style' },
    { key: 'visibilite', label: 'Visibilité' },
    { key: 'apercu',     label: 'Aperçu' },
  ] as const;

  const preview = profile?.username ? (
    profile.isPublic ? (
      <iframe key={displayMode} src={`/${profile.username}?mode=${displayMode}`} className={st.previewFrame} title="Aperçu du profil" />
    ) : (
      <div className={st.previewOff}>
        <span aria-hidden>🔒</span>
        <p>Activez le profil public dans <NextLink href="/dashboard/preview">Aperçu</NextLink> pour voir la prévisualisation.</p>
      </div>
    )
  ) : null;

  return (
    <div className={st.editor}>
      <div className={st.main}>
        <div className={st.tabs} role="tablist" aria-label="Sections du profil">
          {TABS.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={tab === t.key}
              className={`${st.tab} ${tab === t.key ? st.tabOn : ''} ${t.key === 'apercu' ? st.tabPreview : ''}`}
              onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>

        <div className={st.body} role="tabpanel">
          {/* ── Infos ───────────────────────────────────────────── */}
          {tab === 'infos' && (
            <div className={st.stack}>
              {profiles.length > 1 && (
                <div className={st.switcher} aria-label="Profil en cours d'édition">
                  {profiles.map((p) => {
                    const current = p.id === profileId;
                    const label   = labels[p.id] ?? p.label;
                    if (renamingId === p.id) {
                      return (
                        <div key={p.id} className={`${st.chip} ${st.chipOn}`}>
                          <input autoFocus value={renameValue} maxLength={40} placeholder="Nom de la carte" aria-label="Nouveau nom de la carte"
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') saveRename(p.id); if (e.key === 'Escape') setRenamingId(null); }}
                            className={st.chipInput} />
                          <button type="button" onClick={() => saveRename(p.id)} disabled={savingRename} aria-label="Enregistrer le nom" className={st.chipIcon}>✓</button>
                          <button type="button" onClick={() => setRenamingId(null)} disabled={savingRename} aria-label="Annuler" className={st.chipIcon}>✕</button>
                        </div>
                      );
                    }
                    return (
                      <div key={p.id} className={`${st.chip} ${current ? st.chipOn : ''}`}>
                        <button type="button" onClick={() => startRename(p)} aria-label={`Renommer ${label}`} className={st.chipIcon}>✎</button>
                        <button type="button" className={st.chipMain}
                          onClick={() => router.push(p.id === profiles[0].id ? '/dashboard/profile' : `/dashboard/profile?profile=${p.id}`)}>
                          {label}<small>/{p.username}</small>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className={st.photoRow}>
                <div className={st.avatar}>
                  {avatar
                    ? <Image src={avatar} alt="Photo de profil" width={64} height={64} />
                    : <span>{form.displayName.charAt(0).toUpperCase() || '?'}</span>}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); }} />
                <div>
                  <button type="button" className={st.secondary} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    {uploading ? 'Envoi…' : avatar ? 'Changer la photo' : 'Ajouter une photo'}
                  </button>
                  <p className={st.hint}>JPG ou PNG · 5 Mo max</p>
                </div>
              </div>

              <div className={st.grid2}>
                <label className={st.field}><span>Nom</span><input value={form.displayName} onChange={set('displayName')} placeholder="Sophie Martin" /></label>
                <label className={st.field}><span>Poste</span><input value={form.title} onChange={set('title')} placeholder="CEO & Founder" /></label>
                <label className={st.field}><span>Entreprise</span><input value={form.company} onChange={set('company')} placeholder="Acme Corp" /></label>
                <label className={st.field}><span>Adresse du profil</span><input value={form.username} onChange={set('username')} /><small>weconnect.cards/{form.username || '…'}</small></label>
              </div>
              <label className={st.field}><span>Bio</span><textarea value={form.bio} onChange={set('bio')} placeholder="Une courte présentation…" rows={3} /></label>
              {displayMode === 'light' && (
                <label className={st.field}><span>Accroche</span><input value={form.tagline} onChange={set('tagline')} placeholder="Innover. Inspirer. Réaliser." /><small>Phrase courte affichée sous votre nom (mode Clair)</small></label>
              )}
            </div>
          )}

          {/* ── Liens ───────────────────────────────────────────── */}
          {tab === 'liens' && (
            <div className={st.stack}>
              {links.length > 0 && (
                <ul className={st.links}>
                  {links.map((link) => editingId === link.id ? (
                    <li key={link.id} className={`${st.linkRow} ${st.linkEditing}`}>
                      <select value={editType} onChange={(e) => setEditType(e.target.value)} className={st.select} aria-label="Type de lien">
                        {LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <input placeholder="Titre" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} aria-label="Titre du lien" className={st.input}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(link.id); if (e.key === 'Escape') cancelEdit(); }} />
                      <input placeholder={LINK_FORM_CONFIG[editType]?.placeholder ?? 'https://…'} value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className={st.input}
                        aria-label={LINK_FORM_CONFIG[editType]?.inputLabel ?? 'Adresse du lien'}
                        onKeyDown={(e) => { if (e.key === 'Enter') saveEdit(link.id); if (e.key === 'Escape') cancelEdit(); }} />
                      <div className={st.row}>
                        <button type="button" className={st.primarySm} onClick={() => saveEdit(link.id)} disabled={savingEdit}>{savingEdit ? '…' : 'Enregistrer'}</button>
                        <button type="button" className={st.secondary} onClick={cancelEdit}>Annuler</button>
                      </div>
                    </li>
                  ) : (
                    <li key={link.id} className={st.linkRow}>
                      <span className={st.linkType}>{LINK_TYPES.find((t) => t.value === link.type)?.label ?? link.type}</span>
                      <span className={st.linkText}><strong>{link.label}</strong><small>{link.url}</small></span>
                      <button type="button" className={st.iconBtn} onClick={() => startEdit(link)} aria-label={`Modifier ${link.label}`}>✎</button>
                      <button type="button" className={`${st.iconBtn} ${st.danger}`} onClick={() => deleteLink(link.id)} aria-label={`Supprimer ${link.label}`}>🗑</button>
                    </li>
                  ))}
                </ul>
              )}

              <div className={st.card}>
                <p className={st.cardTitle}>Ajouter un lien</p>
                <div className={st.typePills}>
                  {LINK_TYPES.map((t) => (
                    <button key={t.value} type="button" className={`${st.pill} ${newLinkType === t.value ? st.pillOn : ''}`} onClick={() => handleTypeChange(t.value)}>{t.label}</button>
                  ))}
                </div>
                {newLinkType === 'portfolio' ? (
                  <div className={st.portfolio}>
                    <p><strong>🎵 Portfolio Artiste</strong> Une page avec bannière, plateformes, bio et e-mail de booking.</p>
                    <button type="button" className={st.primarySm} onClick={() => router.push('/dashboard/modules/portfolio')}>Créer mon portfolio →</button>
                  </div>
                ) : (
                  <div className={st.grid2}>
                    <label className={st.field}><span>{LINK_FORM_CONFIG[newLinkType]?.inputLabel ?? 'Valeur'}</span>
                      <input placeholder={LINK_FORM_CONFIG[newLinkType]?.placeholder ?? ''} value={newLinkValue} onChange={(e) => setNewLinkValue(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void addLink(); }} />
                    </label>
                    <label className={st.field}><span>Titre</span>
                      <input placeholder="Ex : Mon WhatsApp pro" value={newLinkLabel} onChange={(e) => setNewLinkLabel(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void addLink(); }} />
                    </label>
                    <button type="button" className={`${st.secondary} ${st.span2}`} onClick={addLink}>+ Ajouter le lien</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Style ───────────────────────────────────────────── */}
          {tab === 'style' && (
            <div className={st.stack}>
              <div>
                <p className={st.cardTitle}>Mode d’affichage</p>
                <div className={st.modes}>
                  {DISPLAY_MODES.map((m) => (
                    <button key={m.value} type="button" className={`${st.mode} ${displayMode === m.value ? st.modeOn : ''}`} onClick={() => setDisplayMode(m.value)} aria-pressed={displayMode === m.value}>
                      {m.preview}
                      <strong>{m.label}</strong>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className={st.cardTitle}>Couleur de la carte</p>
                <div className={st.themes}>
                  {THEMES.map((t) => (
                    <button key={t.value} type="button" className={`${st.theme} ${form.theme === t.value ? st.themeOn : ''}`} style={{ background: t.bg }}
                      onClick={() => setForm((p) => ({ ...p, theme: t.value }))} aria-pressed={form.theme === t.value}>
                      {t.label}{form.theme === t.value && ' ✓'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className={st.cardTitle}>Image de fond <small>(modes sombres)</small></p>
                <input ref={bgFileInputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) { void uploadBackground(f); } e.target.value = ''; }} />
                {bgImage ? (
                  <div className={st.bgRow}>
                    <span className={st.bgThumb} style={{ backgroundImage: `url(${bgImage})` }} />
                    <button type="button" className={st.secondary} onClick={() => bgFileInputRef.current?.click()} disabled={uploadingBg}>{uploadingBg ? 'Envoi…' : 'Changer'}</button>
                    <button type="button" className={`${st.secondary} ${st.danger}`} onClick={() => setBgImage(null)}>Supprimer</button>
                  </div>
                ) : (
                  <button type="button" className={st.dashed} onClick={() => bgFileInputRef.current?.click()} disabled={uploadingBg}>{uploadingBg ? 'Envoi…' : '🖼 Ajouter une image de fond'}</button>
                )}
              </div>
            </div>
          )}

          {/* ── Visibilité ──────────────────────────────────────── */}
          {tab === 'visibilite' && (
            <div className={st.stack}>
              <div className={st.card}>
                <p className={st.cardTitle}>Champs visibles sur votre page</p>
                {VISIBILITY_FIELDS.map((f) => {
                  const visible = !hiddenFields.includes(f.key);
                  return (
                    <div key={f.key} className={st.switchRow}>
                      <span>{f.label}</span>
                      <button type="button" role="switch" aria-checked={visible} aria-label={`${f.label} visible`} className={st.switchBtn} onClick={() => toggleField(f.key)}>
                        <span className={st.switch}><span className={st.knob} /></span>
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className={st.card}>
                <div className={st.switchRow}>
                  <span><strong>Annuaire We Connect</strong><small>{inDirectory ? 'Votre profil est visible dans l’annuaire' : 'Votre profil est masqué de l’annuaire'}</small></span>
                  <button type="button" role="switch" aria-checked={inDirectory} aria-label="Visible dans l’annuaire" className={st.switchBtn} onClick={() => setInDirectory((v) => !v)}>
                    <span className={st.switch}><span className={st.knob} /></span>
                  </button>
                </div>
                {inDirectory && (
                  <label className={st.field}><span>Secteur d’activité</span>
                    <select value={sector} onChange={(e) => setSector(e.target.value)}>
                      <option value="">Choisir un secteur…</option>
                      {SECTORS.map((sec) => <option key={sec} value={sec}>{sec}</option>)}
                    </select>
                    {!sector && <small className={st.warn}>Choisissez un secteur pour apparaître dans les filtres.</small>}
                  </label>
                )}
              </div>
            </div>
          )}

          {/* ── Aperçu (phones; always visible on the right on desktop) ── */}
          {tab === 'apercu' && <div className={st.previewTab}>{preview}</div>}
        </div>

        <div className={st.saveBar}>
          {saveError && <p className={st.error} role="alert">{saveError}</p>}
          <button type="button" className={st.primary} onClick={saveProfile} disabled={saving}>
            {saved ? '✓ Enregistré' : saving ? 'Enregistrement…' : 'Enregistrer le profil'}
          </button>
        </div>
      </div>

      {preview && (
        <aside className={st.side} aria-label="Aperçu en direct">
          <div className={st.sideHead}>
            <span>Aperçu · {DISPLAY_MODES.find((m) => m.value === displayMode)?.label}</span>
            <a href={`/${profile?.username}`} target="_blank" rel="noopener noreferrer">Ouvrir ↗</a>
          </div>
          {preview}
        </aside>
      )}
    </div>
  );
}
