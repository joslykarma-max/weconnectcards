'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { SECTORS } from '@/lib/sectors';
import type { DirectoryProfile } from '@/app/api/directory/route';

function Avatar({ src, name, size = 56 }: { src?: string | null; name: string; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', padding: 2, flexShrink: 0 }}>
      <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#12141C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {src ? (
          <Image src={src} alt={name} width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.38, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DirectoryClient({ initial }: { initial: DirectoryProfile[] }) {
  const [q,      setQ]      = useState('');
  const [sector, setSector] = useState('');

  const filtered = useMemo(() => {
    const query = q.toLowerCase().trim();
    return initial.filter((p) => {
      if (sector && p.sector !== sector) return false;
      if (!query) return true;
      return (
        p.displayName.toLowerCase().includes(query) ||
        (p.title   ?? '').toLowerCase().includes(query) ||
        (p.company ?? '').toLowerCase().includes(query) ||
        (p.sector  ?? '').toLowerCase().includes(query)
      );
    });
  }, [initial, q, sector]);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #0D0E14 0%, #181B26 100%)', padding: '0 0 80px' }}>

      {/* Header */}
      <div style={{ background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.15)', padding: '48px 24px 40px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>
          Réseau We Connect
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#F8F9FC', marginBottom: 12, letterSpacing: '-1px' }}>
          Annuaire des membres
        </h1>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#9CA3AF', maxWidth: 480, margin: '0 auto 32px' }}>
          Retrouvez les professionnels du réseau We Connect par secteur d'activité.
        </p>

        {/* Search bar */}
        <div style={{ maxWidth: 520, margin: '0 auto', position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"
            style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            type="text"
            placeholder="Nom, poste, entreprise…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '14px 16px 14px 44px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 10, color: '#F8F9FC',
              fontFamily: 'DM Sans, sans-serif', fontSize: 15,
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#6366F1'; }}
            onBlur={(e)  => { e.target.style.borderColor = 'rgba(99,102,241,0.3)'; }}
          />
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px 0' }}>

        {/* Sector filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          <button
            onClick={() => setSector('')}
            style={{
              padding: '7px 14px', borderRadius: 20, border: `1px solid ${!sector ? '#6366F1' : 'rgba(255,255,255,0.1)'}`,
              background: !sector ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
              color: !sector ? '#818CF8' : '#6B7280', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            Tous les secteurs
          </button>
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(sector === s ? '' : s)}
              style={{
                padding: '7px 14px', borderRadius: 20, border: `1px solid ${sector === s ? '#6366F1' : 'rgba(255,255,255,0.1)'}`,
                background: sector === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                color: sector === s ? '#818CF8' : '#6B7280', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
                cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Count */}
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1, color: '#4B5563', marginBottom: 20 }}>
          {filtered.length} membre{filtered.length !== 1 ? 's' : ''} trouvé{filtered.length !== 1 ? 's' : ''}
          {sector ? ` · ${sector}` : ''}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>🔍</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC', marginBottom: 8 }}>
              Aucun membre trouvé
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#6B7280' }}>
              Essayez un autre secteur ou une autre recherche.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((profile) => (
              <div
                key={profile.id}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 12,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  transition: 'border-color 0.2s, transform 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                {/* Top row: avatar + info */}
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <Avatar src={profile.avatar} name={profile.displayName} size={56} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profile.displayName}
                    </p>
                    {(profile.title || profile.company) && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {profile.title}{profile.title && profile.company && ' · '}{profile.company}
                      </p>
                    )}
                    {profile.sector && (
                      <span style={{
                        display: 'inline-block', marginTop: 6,
                        padding: '2px 8px', borderRadius: 4,
                        background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                        color: '#818CF8', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 0.5,
                      }}>
                        {profile.sector}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6B7280', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {profile.bio}
                  </p>
                )}

                {/* CTA */}
                <Link
                  href={`/${profile.username}`}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px 16px',
                    background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                    borderRadius: 8, textDecoration: 'none',
                    color: '#818CF8', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.1)'; }}
                >
                  Voir le profil
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer powered by */}
      <div style={{ textAlign: 'center', marginTop: 60, paddingBottom: 20 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#374151', textTransform: 'uppercase' }}>
          Powered by We Connect · NFC Platform
        </p>
      </div>
    </div>
  );
}
