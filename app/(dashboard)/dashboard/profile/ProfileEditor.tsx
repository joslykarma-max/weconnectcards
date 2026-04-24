'use client';

import { useState } from 'react';
import { Input, Textarea } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

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
  const [links, setLinks] = useState<Link[]>(profile?.links ?? []);
  const [saving, setSaving]        = useState(false);
  const [newLinkType, setNewLinkType] = useState('phone');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl]   = useState('');
  const [saved, setSaved] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

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

  return (
    <div style={{ maxWidth: 840, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, alignItems: 'start' }}>
      {/* Profile form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
            Informations du profil
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input label="Nom affiché" value={form.displayName} onChange={set('displayName')} placeholder="Sophie Martin" />
            <Input label="Titre / Poste" value={form.title} onChange={set('title')} placeholder="CEO & Founder" />
            <Input label="Entreprise" value={form.company} onChange={set('company')} placeholder="Acme Corp" />
            <Textarea label="Bio" value={form.bio} onChange={set('bio')} placeholder="Une courte présentation..." style={{ minHeight: 80 }} />
            <Input label="Nom d'utilisateur" value={form.username} onChange={set('username')} hint={`weconnect.io/${form.username}`} />
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

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
            Liens ({links.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {links.map((link) => (
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
                </div>
                <button
                  onClick={() => deleteLink(link.id)}
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
              weconnect.io/{profile.username}
            </a>
          </Card>
        )}
      </div>
    </div>
  );
}
