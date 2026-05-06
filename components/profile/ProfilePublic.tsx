'use client';

import { useState } from 'react';
import Image from 'next/image';
import LogoStacked from '@/components/logo/LogoStacked';
import { generateVCard } from '@/lib/utils';

type Link = {
  id: string;
  type: string;
  label: string;
  url: string;
  icon?: string | null;
};

type ActiveModule = { type: string; emoji: string; name: string };

type Profile = {
  id: string;
  username: string;
  displayName: string;
  title?: string | null;
  company?: string | null;
  bio?: string | null;
  avatar?: string | null;
  backgroundImage?: string | null;
  theme: string;
  displayMode?: 'classic' | 'grid' | 'card';
  links: Link[];
  modules: ActiveModule[];
  user: { name: string | null };
};

// ── Icons ─────────────────────────────────────────────────────────────────────

const LINK_ICONS: Record<string, React.ReactNode> = {
  phone: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12.4 19.79 19.79 0 0 1 1.58 3.87 2 2 0 0 1 3.55 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.88-.88a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  email: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  whatsapp: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  linkedin: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  website: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  calendly: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

const defaultIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

// ── Theme & platform colors ───────────────────────────────────────────────────

const THEME_COLORS: Record<string, { bg: string; accent: string; border: string }> = {
  midnight: { bg: 'linear-gradient(180deg, #0D0E14 0%, #181B26 100%)', accent: '#6366F1', border: 'rgba(99,102,241,0.2)' },
  electric: { bg: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',  accent: '#818CF8', border: 'rgba(129,140,248,0.3)' },
  glass:    { bg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',  accent: '#06B6D4', border: 'rgba(6,182,212,0.2)' },
  metal:    { bg: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',  accent: '#9CA3AF', border: 'rgba(156,163,175,0.2)' },
};

// Solid background per platform (for grid mode tiles)
const PLATFORM_BG: Record<string, string> = {
  phone:     '#059669',
  email:     '#6366F1',
  whatsapp:  '#16A34A',
  linkedin:  '#0A66C2',
  instagram: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
  website:   '#0284C7',
  calendly:  '#0052CC',
};

function platformBg(type: string): string {
  return PLATFORM_BG[type] ?? 'linear-gradient(135deg, #4338CA, #6366F1)';
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function logLinkClick(linkId: string, profileId: string) {
  fetch('/api/links/click', { method: 'POST', body: JSON.stringify({ linkId, profileId }), headers: { 'Content-Type': 'application/json' } }).catch(() => {});
}

function ensureScheme(url: string, type?: string): string {
  if (!url) return '#';
  if (/^[a-zA-Z][a-zA-Z0-9+\-.]*:/.test(url)) return url;
  if (type === 'phone') return `tel:${url}`;
  return `https://${url}`;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Avatar({ src, name, size = 96 }: { src?: string | null; name: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', padding: 2, flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#12141C' }}>
        {src ? (
          <Image src={src} alt={name} width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))' }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.38, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleButtons({ profile, theme }: { profile: Profile; theme: { accent: string; border: string } }) {
  if (!profile.modules.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
      {profile.modules.map((mod) => (
        <a key={mod.type} href={`/m/${profile.username}/${mod.type}`}
          style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(99,102,241,0.06)', border: `1px solid ${theme.border}`, borderRadius: 8, textDecoration: 'none', color: '#F8F9FC', transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.06)'; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          <span style={{ fontSize: 20, flexShrink: 0 }}>{mod.emoji}</span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500 }}>{mod.name}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 'auto', color: '#6B7280', flexShrink: 0 }}>
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      ))}
    </div>
  );
}

function SaveContactBlock({
  profile, saving, showForm, submitted, contactForm, setContactForm,
  onSave, onLeaveInfo, theme,
}: {
  profile: Profile; saving: boolean; showForm: boolean; submitted: boolean;
  contactForm: { name: string; email: string; phone: string };
  setContactForm: React.Dispatch<React.SetStateAction<{ name: string; email: string; phone: string }>>;
  onSave: () => void; onLeaveInfo: () => void;
  theme: { border: string };
}) {
  return (
    <>
      <button onClick={onSave} disabled={saving}
        style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4338CA, #6366F1, #818CF8)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)', opacity: saving ? 0.7 : 1 }}
        onMouseEnter={(e) => { if (!saving) e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        {saving ? 'Téléchargement...' : 'Enregistrer le contact'}
      </button>

      {showForm && !submitted && (
        <div style={{ marginTop: 16, padding: 20, background: 'rgba(99,102,241,0.06)', border: `1px solid ${theme.border}`, borderRadius: 8 }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 4 }}>Laissez vos coordonnées</p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Partagez vos infos pour rester en contact.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(['name', 'email', 'phone'] as const).map((field) => (
              <input key={field}
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                placeholder={field === 'name' ? 'Votre nom' : field === 'email' ? 'Votre e-mail' : 'Votre téléphone'}
                value={contactForm[field]}
                onChange={(e) => setContactForm((prev) => ({ ...prev, [field]: e.target.value }))}
                style={{ width: '100%', padding: '12px 14px', background: 'rgba(255,255,255,0.05)', border: `1px solid ${theme.border}`, borderRadius: 6, color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              />
            ))}
            <button onClick={onLeaveInfo} disabled={!contactForm.name && !contactForm.email}
              style={{ marginTop: 4, padding: '12px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: (!contactForm.name && !contactForm.email) ? 'not-allowed' : 'pointer', opacity: (!contactForm.name && !contactForm.email) ? 0.5 : 1 }}>
              Envoyer
            </button>
          </div>
        </div>
      )}

      {submitted && (
        <div style={{ marginTop: 16, padding: 20, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, textAlign: 'center' }}>
          <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>✅</span>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#34D399', marginBottom: 4 }}>Merci !</p>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF' }}>Vos coordonnées ont été transmises.</p>
        </div>
      )}
    </>
  );
}

// ── Layout: Classic ──────────────────────────────────────────────────────────

function LayoutClassic({ profile, theme, saveContactProps }: {
  profile: Profile;
  theme: { accent: string; border: string };
  saveContactProps: React.ComponentProps<typeof SaveContactBlock>;
}) {
  return (
    <>
      {/* Avatar + header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{ margin: '0 auto 16px', width: 96 }}>
          <Avatar src={profile.avatar} name={profile.displayName} size={96} />
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 6, letterSpacing: '-0.5px' }}>
          {profile.displayName}
        </h1>
        {(profile.title || profile.company) && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#9CA3AF', lineHeight: 1.5 }}>
            {profile.title}{profile.title && profile.company && ' · '}{profile.company}
          </p>
        )}
        {profile.bio && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginTop: 14, maxWidth: 320, margin: '14px auto 0' }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {profile.links.map((link) => (
          <a key={link.id} href={ensureScheme(link.url, link.type)} target="_blank" rel="noopener noreferrer"
            onClick={() => logLinkClick(link.id, profile.id)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, borderRadius: 8, textDecoration: 'none', color: '#F8F9FC', transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span style={{ color: theme.accent, flexShrink: 0 }}>{LINK_ICONS[link.type] ?? defaultIcon}</span>
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500 }}>{link.label}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 'auto', color: '#6B7280', flexShrink: 0 }}>
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        ))}
      </div>

      <ModuleButtons profile={profile} theme={theme} />
      <SaveContactBlock {...saveContactProps} />
    </>
  );
}

// ── Layout: Grid ─────────────────────────────────────────────────────────────

function LayoutGrid({ profile, theme, saveContactProps }: {
  profile: Profile;
  theme: { accent: string; border: string };
  saveContactProps: React.ComponentProps<typeof SaveContactBlock>;
}) {
  return (
    <>
      {/* Avatar + header (compact) */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ margin: '0 auto 14px', width: 88 }}>
          <Avatar src={profile.avatar} name={profile.displayName} size={88} />
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', marginBottom: 4, letterSpacing: '-0.5px' }}>
          {profile.displayName}
        </h1>
        {(profile.title || profile.company) && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9CA3AF' }}>
            {profile.title}{profile.title && profile.company && ' · '}{profile.company}
          </p>
        )}
        {profile.bio && (
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', lineHeight: 1.6, marginTop: 10, maxWidth: 300, margin: '10px auto 0' }}>
            {profile.bio}
          </p>
        )}
      </div>

      {/* Icon grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {profile.links.map((link) => (
          <a key={link.id} href={ensureScheme(link.url, link.type)} target="_blank" rel="noopener noreferrer"
            onClick={() => logLinkClick(link.id, profile.id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '20px 8px', background: platformBg(link.type), borderRadius: 14, textDecoration: 'none', color: '#fff', aspectRatio: '1', transition: 'transform 0.2s, opacity 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.opacity = '0.92'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.opacity = '1'; }}
          >
            {LINK_ICONS[link.type] ?? defaultIcon}
            <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, textAlign: 'center', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', padding: '0 4px' }}>
              {link.label}
            </span>
          </a>
        ))}
      </div>

      <ModuleButtons profile={profile} theme={theme} />
      <SaveContactBlock {...saveContactProps} />
    </>
  );
}

// ── Layout: Card (business card style) ───────────────────────────────────────

function LayoutCard({ profile, theme, saveContactProps }: {
  profile: Profile;
  theme: { accent: string; border: string };
  saveContactProps: React.ComponentProps<typeof SaveContactBlock>;
}) {
  // Separate contact links (phone, email, whatsapp) from social links
  const contactTypes = new Set(['phone', 'email', 'whatsapp']);
  const contactLinks = profile.links.filter((l) => contactTypes.has(l.type));
  const socialLinks  = profile.links.filter((l) => !contactTypes.has(l.type));

  return (
    <>
      {/* Business card header */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${theme.border}`, borderRadius: 16, padding: '24px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 20 }}>
        <Avatar src={profile.avatar} name={profile.displayName} size={76} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', letterSpacing: '-0.3px', margin: 0 }}>
            {profile.displayName}
          </h1>
          {profile.title && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: theme.accent, marginTop: 4 }}>{profile.title}</p>
          )}
          {profile.company && (
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', marginTop: 2 }}>{profile.company}</p>
          )}
        </div>
      </div>

      {profile.bio && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 16, paddingLeft: 4 }}>
          {profile.bio}
        </p>
      )}

      {/* Contact info rows */}
      {contactLinks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {contactLinks.map((link) => (
            <a key={link.id} href={ensureScheme(link.url, link.type)} target="_blank" rel="noopener noreferrer"
              onClick={() => logLinkClick(link.id, profile.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}`, borderRadius: 10, textDecoration: 'none', color: '#D1D5DB', transition: 'all 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.accent; e.currentTarget.style.color = '#F8F9FC'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.color = '#D1D5DB'; }}
            >
              <span style={{ color: theme.accent, flexShrink: 0 }}>{LINK_ICONS[link.type] ?? defaultIcon}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>{link.url.replace(/^(tel:|mailto:)/, '')}</span>
            </a>
          ))}
        </div>
      )}

      {/* Social icon row */}
      {socialLinks.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {socialLinks.map((link) => (
            <a key={link.id} href={ensureScheme(link.url, link.type)} target="_blank" rel="noopener noreferrer"
              onClick={() => logLinkClick(link.id, profile.id)}
              title={link.label}
              style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 12, background: platformBg(link.type), color: '#fff', textDecoration: 'none', flexShrink: 0, transition: 'transform 0.2s, opacity 0.2s' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.opacity = '1'; }}
            >
              {LINK_ICONS[link.type] ?? defaultIcon}
            </a>
          ))}
        </div>
      )}

      <ModuleButtons profile={profile} theme={theme} />
      <SaveContactBlock {...saveContactProps} />
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ProfilePublic({ profile }: { profile: Profile }) {
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '' });

  const theme       = THEME_COLORS[profile.theme] ?? THEME_COLORS.midnight;
  const displayMode = profile.displayMode ?? 'classic';

  const downloadVCard = () => {
    const vcard = generateVCard({ displayName: profile.displayName, title: profile.title, company: profile.company, avatar: profile.avatar, username: profile.username, links: profile.links });
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${profile.username}.vcf`; a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveContact = () => {
    setSaving(true);
    downloadVCard();
    fetch('/api/contacts/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId: profile.id }) }).catch(() => {});
    setSaving(false);
    setShowForm(true);
  };

  const handleLeaveInfo = async () => {
    if (!contactForm.name && !contactForm.email) return;
    await fetch('/api/contacts/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ profileId: profile.id, ...contactForm }) }).catch(() => {});
    setSubmitted(true);
  };

  const bgStyle: React.CSSProperties = profile.backgroundImage
    ? { backgroundImage: `url(${profile.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }
    : { background: theme.bg };

  const saveContactProps = { profile, saving, showForm, submitted, contactForm, setContactForm, onSave: handleSaveContact, onLeaveInfo: handleLeaveInfo, theme };

  const layoutProps = { profile, theme, saveContactProps };

  return (
    <div style={{ minHeight: '100vh', ...bgStyle, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '48px 16px 100px', position: 'relative' }}>
      {profile.backgroundImage && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 0, pointerEvents: 'none' }} />
      )}
      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>

        {displayMode === 'classic' && <LayoutClassic {...layoutProps} />}
        {displayMode === 'grid'    && <LayoutGrid    {...layoutProps} />}
        {displayMode === 'card'    && <LayoutCard    {...layoutProps} />}

        {/* Powered by */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <LogoStacked symbolSize="sm" className="mx-auto" />
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#6B7280', marginTop: 8, textTransform: 'uppercase' }}>
            Powered by We Connect · NFC Platform
          </p>
        </div>
      </div>
    </div>
  );
}
