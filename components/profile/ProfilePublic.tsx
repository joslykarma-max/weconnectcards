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
  user: { name: string | null };
};

const LINK_ICONS: Record<string, React.ReactNode> = {
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12.4 19.79 19.79 0 0 1 1.58 3.87 2 2 0 0 1 3.55 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l.88-.88a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
  website: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  calendly: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

const defaultIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);

const THEME_COLORS: Record<string, { bg: string; accent: string; border: string }> = {
  midnight: { bg: 'linear-gradient(180deg, #0D0E14 0%, #181B26 100%)', accent: '#6366F1', border: 'rgba(99,102,241,0.2)' },
  electric: { bg: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 100%)',  accent: '#818CF8', border: 'rgba(129,140,248,0.3)' },
  glass:    { bg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',  accent: '#06B6D4', border: 'rgba(6,182,212,0.2)' },
  metal:    { bg: 'linear-gradient(180deg, #111827 0%, #1f2937 100%)',  accent: '#9CA3AF', border: 'rgba(156,163,175,0.2)' },
};

function logLinkClick(linkId: string) {
  fetch('/api/links/click', { method: 'POST', body: JSON.stringify({ linkId }), headers: { 'Content-Type': 'application/json' } }).catch(() => {});
}

export default function ProfilePublic({ profile }: { profile: Profile }) {
  const [saving, setSaving] = useState(false);
  const theme = THEME_COLORS[profile.theme] ?? THEME_COLORS.midnight;

  const handleSaveContact = () => {
    setSaving(true);
    const vcard = generateVCard({
      displayName: profile.displayName,
      title:       profile.title,
      company:     profile.company,
      avatar:      profile.avatar,
      username:    profile.username,
      links:       profile.links,
    });
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${profile.username}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    setSaving(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px 80px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Avatar */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 96, height: 96,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            padding: 2,
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#12141C' }}>
              {profile.avatar ? (
                <Image src={profile.avatar} alt={profile.displayName} width={96} height={96} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))' }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {profile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
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
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => logLinkClick(link.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 20px',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${theme.border}`,
                borderRadius: 8,
                textDecoration: 'none',
                color: '#F8F9FC',
                transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `rgba(${theme.accent === '#6366F1' ? '99,102,241' : '6,182,212'},0.1)`;
                e.currentTarget.style.borderColor = theme.accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = theme.border;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span style={{ color: theme.accent, flexShrink: 0 }}>
                {LINK_ICONS[link.type] ?? defaultIcon}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500 }}>
                {link.label}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginLeft: 'auto', color: '#6B7280', flexShrink: 0 }}>
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          ))}
        </div>

        {/* Save Contact */}
        <button
          onClick={handleSaveContact}
          disabled={saving}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #4338CA, #6366F1, #818CF8)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 15,
            cursor: saving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
            opacity: saving ? 0.7 : 1,
          }}
          onMouseEnter={(e) => { if (!saving) (e.currentTarget).style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { (e.currentTarget).style.transform = 'translateY(0)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {saving ? 'Téléchargement...' : 'Enregistrer le contact'}
        </button>

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
