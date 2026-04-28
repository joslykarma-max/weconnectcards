'use client';

import { useState } from 'react';
import Link from 'next/link';
import LogoStacked from '@/components/logo/LogoStacked';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

function Shell({ children, backHref }: { children: React.ReactNode; backHref: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#08090C', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px 100px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13, textDecoration: 'none', marginBottom: 32, fontFamily: 'DM Sans, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Voir le profil
        </Link>
        {children}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <LogoStacked symbolSize="sm" className="mx-auto" />
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#6B7280', marginTop: 8, textTransform: 'uppercase' }}>
            Powered by We Connect
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── LOYALTY ────────────────────────────────────────────────────────────────
function LoyaltyModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const stampGoal = Number(config.stampGoal) || 10;
  const stamps    = Array.from({ length: stampGoal });

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Carte de fidélité</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 6 }}>
          {String(config.businessName || 'Mon Commerce')}
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 15 }}>
          Collectez {stampGoal} tampons et gagnez : <strong style={{ color: '#F8F9FC' }}>{String(config.reward || 'une récompense')}</strong>
        </p>
      </div>

      <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 28, marginBottom: 24 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20, textAlign: 'center' }}>
          Votre carte
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {stamps.map((_, i) => (
            <div key={i} style={{ aspectRatio: '1', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, opacity: 0.3 }}>
              {String(config.stampEmoji || '⭐')}
            </div>
          ))}
        </div>
        <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 20, fontFamily: 'DM Sans, sans-serif' }}>
          Présentez cette carte à chaque visite pour obtenir votre tampon
        </p>
      </div>

      <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '16px 20px', textAlign: 'center' }}>
        <p style={{ color: '#818CF8', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
          🎁 Récompense après {stampGoal} tampons : <strong>{String(config.reward || 'récompense')}</strong>
        </p>
        {!!config.expiryDays && (
          <p style={{ color: '#6B7280', fontSize: 12, marginTop: 6, fontFamily: 'Space Mono, monospace' }}>
            Valable {String(config.expiryDays)} jours
          </p>
        )}
      </div>
    </Shell>
  );
}

// ─── MENU ────────────────────────────────────────────────────────────────────
function MenuModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Menu</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 6 }}>
          {String(config.restaurantName || 'Notre Restaurant')}
        </h1>
        {!!config.address && <p style={{ color: '#9CA3AF', fontSize: 14 }}>📍 {String(config.address)}</p>}
        {!!config.openHours && <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4, fontFamily: 'Space Mono, monospace' }}>🕐 {String(config.openHours)}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {!!config.menuUrl && (
          <a href={String(config.menuUrl)} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 24px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 10, textDecoration: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17 }}>
            🍽️ Voir le menu
          </a>
        )}
        {!!config.whatsapp && (
          <a href={`https://wa.me/${String(config.whatsapp).replace(/\D/g, '')}?text=Bonjour, je souhaite passer une commande`}
            target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 24px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, textDecoration: 'none', color: '#10B981', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
            💬 Commander sur WhatsApp
          </a>
        )}
      </div>
    </Shell>
  );
}

// ─── REVIEW ──────────────────────────────────────────────────────────────────
function ReviewModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const stars = Number(config.targetStars) || 5;

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>
          {'⭐'.repeat(stars)}
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 12 }}>
          {String(config.businessName || 'Notre commerce')}
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 1.6, marginBottom: 36, maxWidth: 320, margin: '0 auto 36px' }}>
          {String(config.message || 'Votre avis compte beaucoup pour nous !')}
        </p>
        {config.googleUrl ? (
          <a href={String(config.googleUrl)} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 10, textDecoration: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17 }}>
            ⭐ Laisser un avis Google
          </a>
        ) : (
          <p style={{ color: '#6B7280', fontSize: 14 }}>Lien Google Reviews non configuré.</p>
        )}
      </div>
    </Shell>
  );
}

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
function PortfolioModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const links = [
    { key: 'instagramUrl',   icon: '📸', label: 'Instagram',  color: '#E1306C', bg: 'rgba(225,48,108,0.1)',  border: 'rgba(225,48,108,0.25)' },
    { key: 'spotifyUrl',     icon: '🎵', label: 'Spotify',    color: '#1DB954', bg: 'rgba(29,185,84,0.1)',   border: 'rgba(29,185,84,0.25)'  },
    { key: 'youtubeUrl',     icon: '▶️', label: 'YouTube',    color: '#FF0000', bg: 'rgba(255,0,0,0.1)',     border: 'rgba(255,0,0,0.25)'    },
    { key: 'soundcloudUrl',  icon: '☁️', label: 'SoundCloud', color: '#FF5500', bg: 'rgba(255,85,0,0.1)',    border: 'rgba(255,85,0,0.25)'   },
    { key: 'websiteUrl',     icon: '🌐', label: 'Site web',   color: '#818CF8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
  ].filter(l => config[l.key]);

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>
          {String(config.discipline || 'Portfolio')}
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 12 }}>
          {String(config.artistName || 'Mon Portfolio')}
        </h1>
        {!!config.bio && (
          <p style={{ color: '#9CA3AF', fontSize: 15, lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
            {String(config.bio)}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {links.map(l => (
          <a key={l.key} href={String(config[l.key])} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: l.bg, border: `1px solid ${l.border}`, borderRadius: 10, textDecoration: 'none', color: l.color, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500 }}>
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            {l.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        ))}
      </div>

      {!!config.bookingEmail && (
        <a href={`mailto:${String(config.bookingEmail)}?subject=Booking`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textDecoration: 'none', color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
          📩 Contact booking
        </a>
      )}
    </Shell>
  );
}

// ─── EVENT ───────────────────────────────────────────────────────────────────
function EventModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const dateStr = config.date
    ? new Date(String(config.date)).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Événement</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 8 }}>
          {String(config.eventName || 'Événement')}
        </h1>
        {!!config.organizer && <p style={{ color: '#9CA3AF', fontSize: 14 }}>Organisé par <strong style={{ color: '#F8F9FC' }}>{String(config.organizer)}</strong></p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {dateStr && (
          <div style={{ display: 'flex', gap: 14, padding: '14px 18px', background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
            <span style={{ fontSize: 20 }}>📅</span>
            <div>
              <p style={{ color: '#F8F9FC', fontSize: 14, fontWeight: 600, fontFamily: 'Syne, sans-serif', textTransform: 'capitalize' }}>{dateStr}</p>
              {!!config.time && <p style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{String(config.time)}</p>}
            </div>
          </div>
        )}
        {!!config.venue && (
          <div style={{ display: 'flex', gap: 14, padding: '14px 18px', background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
            <span style={{ fontSize: 20 }}>📍</span>
            <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{String(config.venue)}</p>
          </div>
        )}
        {!!config.price && (
          <div style={{ display: 'flex', gap: 14, padding: '14px 18px', background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
            <span style={{ fontSize: 20 }}>🎟️</span>
            <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{String(config.price)} FCFA</p>
          </div>
        )}
      </div>

      {!!config.description && (
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
          {String(config.description)}
        </p>
      )}

      {!!config.capacity && (
        <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 20 }}>
          Capacité : {String(config.capacity)} personnes
        </p>
      )}
    </Shell>
  );
}

// ─── CERTIFICATE ─────────────────────────────────────────────────────────────
function CertificateModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  return (
    <Shell backHref={`/${username}`}>
      <div style={{ background: 'linear-gradient(135deg, #0D0E14, #181B26)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#10B981', textTransform: 'uppercase' }}>Produit authentique</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>Certificat We Connect</p>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', marginBottom: 4 }}>
          {String(config.productName || 'Produit')}
        </h1>
        {!!config.brand && <p style={{ color: '#818CF8', fontSize: 14, marginBottom: 20 }}>par {String(config.brand)}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Numéro de série', value: config.serialNumber },
            { label: 'Origine',         value: config.origin        },
            { label: 'Fabrication',     value: config.purchaseDate  },
            { label: 'Garantie',        value: config.warranty      },
          ].filter(r => r.value).map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{row.label}</span>
              <span style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{String(row.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {!!config.description && (
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>{String(config.description)}</p>
      )}
    </Shell>
  );
}

// ─── MEMBER ──────────────────────────────────────────────────────────────────
const LEVEL_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  silver:   { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.3)', label: '🥈 Silver'   },
  gold:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: '🥇 Gold'     },
  platinum: { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   label: '💎 Platinum' },
  vip:      { color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  label: '👑 VIP'      },
};

function MemberModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const level = LEVEL_STYLES[String(config.level ?? 'silver')] ?? LEVEL_STYLES.silver;
  const benefits = String(config.benefits || '').split('\n').filter(Boolean);

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ background: `linear-gradient(135deg, ${level.bg.replace('0.12', '0.2')}, #12141C)`, border: `1px solid ${level.border}`, borderRadius: 16, padding: 32, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: level.color, textTransform: 'uppercase', marginBottom: 8 }}>Carte Membre</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC' }}>
              {String(config.clubName || 'Club')}
            </h1>
          </div>
          <div style={{ background: level.bg, border: `1px solid ${level.border}`, borderRadius: 8, padding: '6px 14px' }}>
            <p style={{ color: level.color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>{level.label}</p>
          </div>
        </div>

        {!!config.memberName && (
          <div>
            <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: 2, marginBottom: 4 }}>MEMBRE</p>
            <p style={{ color: '#F8F9FC', fontSize: 18, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{String(config.memberName)}</p>
          </div>
        )}
        {!!config.memberId && (
          <p style={{ color: level.color, fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 8 }}>#{String(config.memberId)}</p>
        )}
        {!!config.expiryDate && (
          <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 16 }}>
            Valable jusqu&apos;au {new Date(String(config.expiryDate)).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      {benefits.length > 0 && (
        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Vos avantages</p>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ color: level.color, flexShrink: 0 }}>✦</span>
              <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{b}</p>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

// ─── ACCESS ──────────────────────────────────────────────────────────────────
function AccessModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const [pin, setPin]         = useState('');
  const [granted, setGranted] = useState(false);
  const [denied, setDenied]   = useState(false);
  const storedPin = String(config.pin || '');
  const days      = (config.days as string[]) ?? [];

  function checkPin() {
    if (pin === storedPin) { setGranted(true); setDenied(false); }
    else                   { setDenied(true); setGranted(false); setPin(''); }
  }

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Contrôle d'accès</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 8 }}>
          {String(config.zoneName || 'Zone sécurisée')}
        </h1>
        {!!config.description && <p style={{ color: '#9CA3AF', fontSize: 14 }}>{String(config.description)}</p>}
      </div>

      {!!(config.startTime && config.endTime) && (
        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '14px 20px', marginBottom: 24, textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
            Accès autorisé : <strong style={{ color: '#F8F9FC' }}>{`${String(config.startTime)} – ${String(config.endTime)}`}</strong>
          </p>
          {days.length > 0 && (
            <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 6 }}>
              {days.join(' · ').toUpperCase()}
            </p>
          )}
        </div>
      )}

      {granted ? (
        <div style={{ textAlign: 'center', padding: 32, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 12 }}>🔓</span>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#10B981' }}>Accès accordé</p>
        </div>
      ) : (
        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 28 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Entrez votre PIN</p>
          <input
            type="password"
            inputMode="numeric"
            maxLength={8}
            value={pin}
            onChange={e => setPin(e.target.value)}
            placeholder="••••"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${denied ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '14px 20px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 24, textAlign: 'center', outline: 'none', letterSpacing: 8, boxSizing: 'border-box', marginBottom: 14 }}
            onKeyDown={e => { if (e.key === 'Enter') checkPin(); }}
          />
          {denied && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>PIN incorrect. Réessayez.</p>}
          <button onClick={checkPin} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            Vérifier
          </button>
        </div>
      )}
    </Shell>
  );
}

// ─── MEDICAL ─────────────────────────────────────────────────────────────────
function MedicalModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const [pin, setPin]         = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [denied, setDenied]   = useState(false);
  const storedPin = String(config.pin || '');
  const hasPin    = storedPin.length > 0;

  function checkPin() {
    if (pin === storedPin) { setUnlocked(true); setDenied(false); }
    else                   { setDenied(true); setPin(''); }
  }

  const rows = [
    { label: 'Groupe sanguin', value: config.bloodType,   icon: '🩸', urgent: true  },
    { label: 'Allergies',      value: config.allergies,   icon: '⚠️', urgent: true  },
    { label: 'Pathologies',    value: config.conditions,  icon: '🏥', urgent: false },
    { label: 'Médicaments',    value: config.medications, icon: '💊', urgent: false },
    { label: 'Médecin',        value: config.doctorName,  icon: '👨‍⚕️', urgent: false },
    { label: 'Tél. médecin',   value: config.doctorPhone, icon: '📞', urgent: false },
  ].filter(r => r.value);

  if (hasPin && !unlocked) {
    return (
      <Shell backHref={`/${username}`}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>🩺</span>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 8 }}>Carte Médicale</h1>
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>Informations médicales sécurisées</p>
        </div>
        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 28 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>PIN médical requis</p>
          <input
            type="password" inputMode="numeric" maxLength={8} value={pin}
            onChange={e => setPin(e.target.value)} placeholder="••••"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${denied ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '14px 20px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 24, textAlign: 'center', outline: 'none', letterSpacing: 8, boxSizing: 'border-box', marginBottom: 14 }}
            onKeyDown={e => { if (e.key === 'Enter') checkPin(); }}
          />
          {denied && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>PIN incorrect.</p>}
          <button onClick={checkPin} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #DC2626, #EF4444)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
            Accéder aux infos médicales
          </button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 20px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 18 }}>🚨</span>
        <p style={{ color: '#EF4444', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Informations médicales d'urgence</p>
      </div>

      {!!config.fullName && (
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC' }}>{String(config.fullName)}</h1>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
        {rows.map(row => (
          <div key={row.label} style={{ display: 'flex', gap: 14, padding: '14px 18px', background: row.urgent ? 'rgba(239,68,68,0.06)' : '#181B26', border: `1px solid ${row.urgent ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{row.icon}</span>
            <div>
              <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginBottom: 2 }}>{row.label}</p>
              <p style={{ color: row.urgent ? '#FCA5A5' : '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{String(row.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {!!(config.emergencyName || config.emergencyPhone) && (
        <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 20 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#818CF8', textTransform: 'uppercase', marginBottom: 12 }}>Contact d'urgence</p>
          {!!config.emergencyName && <p style={{ color: '#F8F9FC', fontSize: 16, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>{String(config.emergencyName)}</p>}
          {!!config.emergencyRel && <p style={{ color: '#9CA3AF', fontSize: 13 }}>{String(config.emergencyRel)}</p>}
          {!!config.emergencyPhone && (
            <a href={`tel:${String(config.emergencyPhone)}`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12, padding: '10px 20px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, textDecoration: 'none', color: '#818CF8', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
              📞 {String(config.emergencyPhone)}
            </a>
          )}
        </div>
      )}
    </Shell>
  );
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────
export default function ModulePublicClient({
  type, username, config,
}: {
  type:     string;
  username: string;
  config:   Record<string, unknown>;
}) {
  switch (type) {
    case 'loyalty':     return <LoyaltyModule     config={config} username={username} />;
    case 'menu':        return <MenuModule         config={config} username={username} />;
    case 'review':      return <ReviewModule       config={config} username={username} />;
    case 'portfolio':   return <PortfolioModule    config={config} username={username} />;
    case 'event':       return <EventModule        config={config} username={username} />;
    case 'certificate': return <CertificateModule  config={config} username={username} />;
    case 'member':      return <MemberModule       config={config} username={username} />;
    case 'access':      return <AccessModule       config={config} username={username} />;
    case 'medical':     return <MedicalModule      config={config} username={username} />;
    default:            return null;
  }
}
