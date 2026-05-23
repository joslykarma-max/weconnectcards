'use client';

import { useState } from 'react';
import Link from 'next/link';
import KPICard from '@/components/dashboard/KPICard';

/* ─── Types ───────────────────────────────────────────────────────────────── */
type Scan          = { device: string; scannedAt: string };
type LoyaltyEntry  = { phone: string; stamps: number; lastStampAt?: string };
type EventEntry    = { name: string; ticketTypeName: string; registeredAt: string; ticketPrice: number };
type AccessEntry   = { zoneName: string; holderName?: string; status: 'granted' | 'denied'; timestamp: string };
type MemberEntry   = { memberName: string; level: string; isActive: boolean };

export type OverviewProps = {
  profile:       { displayName: string; username: string } | null;
  totalScans:    number;
  totalClicks:   number;
  totalContacts: number;
  recentScans:   Scan[];
  activeModules: string[];
  menuStats:     { restaurantName: string; totalItems: number; totalCategories: number; currency: string; whatsapp?: string } | null;
  loyaltyStats:  { totalCards: number; totalStamps: number; recent: LoyaltyEntry[] } | null;
  eventStats:    { totalRegistrations: number; totalRevenue: number; currency: string; recent: EventEntry[] } | null;
  accessStats:   { total: number; granted: number; denied: number; recent: AccessEntry[] } | null;
  memberStats:   { total: number; active: number; byLevel: Record<string, number>; recent: MemberEntry[] } | null;
};

/* ─── Module metadata ────────────────────────────────────────────────────── */
const MODULE_META: Record<string, { label: string; icon: string }> = {
  menu:        { label: 'Menu',        icon: '🍽️' },
  loyalty:     { label: 'Fidélité',    icon: '🎯' },
  event:       { label: 'Événement',   icon: '🎟️' },
  access:      { label: 'Accès',       icon: '🔑' },
  member:      { label: 'Membres',     icon: '🎫' },
  review:      { label: 'Avis',        icon: '⭐' },
  portfolio:   { label: 'Portfolio',   icon: '🎵' },
  medical:     { label: 'Médical',     icon: '🩺' },
  certificate: { label: 'Certificat',  icon: '🦋' },
};

/* ─── Shared card ────────────────────────────────────────────────────────── */
function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 10, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--t-text)' }}>{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );
}

function StatPill({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ flex: 1, minWidth: 100, padding: '14px 16px', background: 'var(--t-row)', borderRadius: 8, textAlign: 'center' }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: accent ?? 'var(--t-text)' }}>{value}</p>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: 'var(--t-text-muted)', textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function SeeLink({ href, label = 'Gérer →' }: { href: string; label?: string }) {
  return (
    <Link href={href} style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#818CF8', textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
      {label}
    </Link>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '32px 0' }}>
      <p style={{ fontSize: 32, marginBottom: 8 }}>{icon}</p>
      <p style={{ color: 'var(--t-text-muted)', fontSize: 13 }}>{text}</p>
    </div>
  );
}

/* ─── NFC / base dashboard ───────────────────────────────────────────────── */
function NfcDashboard({ recentScans, profile }: { recentScans: Scan[]; profile: OverviewProps['profile'] }) {
  return (
    <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title="Activité récente" action={<SeeLink href="/dashboard/analytics" label="Voir tout →" />}>
        {recentScans.length === 0 ? (
          <EmptyState icon="📡" text="Pas encore de scans. Partagez votre carte !" />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentScans.map((scan, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--t-row)', borderRadius: 6 }}>
                <span style={{ fontSize: 18 }}>{scan.device === 'iOS' ? '🍎' : scan.device === 'Android' ? '🤖' : '💻'}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: 'var(--t-text)', fontSize: 13 }}>{scan.device ?? 'Appareil inconnu'}</p>
                  <p style={{ color: 'var(--t-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
                    {new Date(scan.scannedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Actions rapides">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { href: '/dashboard/profile',   icon: '✏️', label: 'Modifier mon profil',    desc: 'Photo, liens, bio' },
            { href: profile?.username ? `/${profile.username}` : '#', icon: '👁️', label: 'Voir ma page publique', desc: `weconnect.cards/${profile?.username ?? '...'}` },
            { href: '/dashboard/card',      icon: '💳', label: 'Gérer ma carte',         desc: 'NFC, QR code, activation' },
            { href: '/dashboard/analytics', icon: '📊', label: 'Voir les analytics',     desc: 'Stats détaillées 90 jours' },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', background: 'var(--t-row)', border: 'var(--t-border-full)', borderRadius: 6, textDecoration: 'none' }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <div>
                <p style={{ color: 'var(--t-text)', fontSize: 13, fontWeight: 500 }}>{a.label}</p>
                <p style={{ color: 'var(--t-text-muted)', fontSize: 11 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─── Menu dashboard ─────────────────────────────────────────────────────── */
function MenuDashboard({ stats, username }: { stats: NonNullable<OverviewProps['menuStats']>; username?: string }) {
  const publicUrl = username ? `/m/${username}/menu` : null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title={`🍽️ ${stats.restaurantName || 'Mon Menu'}`} action={<SeeLink href="/dashboard/modules/menu" />}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatPill label="Catégories" value={stats.totalCategories} accent="#F59E0B" />
          <StatPill label="Plats"      value={stats.totalItems}      accent="#F59E0B" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {publicUrl && (
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 7, textDecoration: 'none', color: '#F59E0B', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500 }}>
              🔗 Voir le menu public ↗
            </a>
          )}
          {stats.whatsapp && (
            <a href={`https://wa.me/${stats.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 7, textDecoration: 'none', color: '#10B981', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500 }}>
              💬 WhatsApp commandes
            </a>
          )}
        </div>
      </Section>

      <Section title="Accès rapide">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { href: '/dashboard/modules/menu', icon: '✏️', label: 'Modifier le menu',     desc: 'Plats, catégories, prix' },
            { href: '/dashboard/qrcode',       icon: '⬛', label: 'QR Code du menu',       desc: 'Générer et partager' },
            { href: '/dashboard/analytics',    icon: '📊', label: 'Voir les stats',        desc: 'Scans et clics' },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--t-row)', border: 'var(--t-border-full)', borderRadius: 6, textDecoration: 'none' }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <div>
                <p style={{ color: 'var(--t-text)', fontSize: 13, fontWeight: 500 }}>{a.label}</p>
                <p style={{ color: 'var(--t-text-muted)', fontSize: 11 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─── Loyalty dashboard ──────────────────────────────────────────────────── */
function LoyaltyDashboard({ stats, username }: { stats: NonNullable<OverviewProps['loyaltyStats']>; username?: string }) {
  const avg = stats.totalCards > 0 ? (stats.totalStamps / stats.totalCards).toFixed(1) : '0';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title="🎯 Fidélité" action={<SeeLink href="/dashboard/modules/loyalty" />}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatPill label="Clients"  value={stats.totalCards}  accent="#10B981" />
          <StatPill label="Tampons"  value={stats.totalStamps} accent="#10B981" />
          <StatPill label="Moy / client" value={avg}          accent="#10B981" />
        </div>
        {username && (
          <a href={`/m/${username}/loyalty`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 7, textDecoration: 'none', color: '#10B981', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500 }}>
            🔗 Page fidélité client ↗
          </a>
        )}
      </Section>

      <Section title="Derniers clients">
        {stats.recent.length === 0 ? (
          <EmptyState icon="🎯" text="Aucun client encore enregistré." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recent.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--t-row)', borderRadius: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🎯</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--t-text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.phone}</p>
                  {e.lastStampAt && (
                    <p style={{ color: 'var(--t-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
                      {new Date(e.lastStampAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </p>
                  )}
                </div>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#10B981', fontWeight: 700, flexShrink: 0 }}>
                  {e.stamps} 🟢
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ─── Event dashboard ────────────────────────────────────────────────────── */
function EventDashboard({ stats, username }: { stats: NonNullable<OverviewProps['eventStats']>; username?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title="🎟️ Événement" action={<SeeLink href="/dashboard/modules/event" />}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatPill label="Inscrits"  value={stats.totalRegistrations} accent="#8B5CF6" />
          <StatPill label={`Revenus ${stats.currency}`} value={stats.totalRevenue.toLocaleString('fr-FR')} accent="#8B5CF6" />
        </div>
        {username && (
          <a href={`/m/${username}/event`} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 7, textDecoration: 'none', color: '#8B5CF6', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500 }}>
            🔗 Page événement ↗
          </a>
        )}
      </Section>

      <Section title="Dernières inscriptions">
        {stats.recent.length === 0 ? (
          <EmptyState icon="🎟️" text="Aucune inscription pour le moment." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recent.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--t-row)', borderRadius: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🎟️</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--t-text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</p>
                  <p style={{ color: 'var(--t-text-muted)', fontSize: 11 }}>{e.ticketTypeName}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#8B5CF6' }}>{e.ticketPrice.toLocaleString('fr-FR')}</p>
                  <p style={{ color: 'var(--t-text-muted)', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>
                    {new Date(e.registeredAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ─── Access dashboard ───────────────────────────────────────────────────── */
function AccessDashboard({ stats }: { stats: NonNullable<OverviewProps['accessStats']> }) {
  const rate = stats.total > 0 ? Math.round((stats.granted / stats.total) * 100) : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title="🔑 Contrôle d'accès" action={<SeeLink href="/dashboard/modules/access" />}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatPill label="Total"    value={stats.total}   accent="#06B6D4" />
          <StatPill label="Accordés" value={stats.granted} accent="#10B981" />
          <StatPill label="Refusés"  value={stats.denied}  accent="#EF4444" />
        </div>
        <div style={{ background: 'var(--t-row)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)' }}>Taux d'accès accordé</p>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: rate >= 80 ? '#10B981' : '#EF4444' }}>{rate}%</p>
        </div>
      </Section>

      <Section title="Derniers accès">
        {stats.recent.length === 0 ? (
          <EmptyState icon="🔑" text="Aucun accès enregistré." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recent.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--t-row)', borderRadius: 6 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{e.status === 'granted' ? '✅' : '❌'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--t-text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {e.holderName ?? 'Inconnu'} · {e.zoneName}
                  </p>
                  <p style={{ color: 'var(--t-text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
                    {new Date(e.timestamp).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: e.status === 'granted' ? '#10B981' : '#EF4444', textTransform: 'uppercase', letterSpacing: 1, flexShrink: 0 }}>
                  {e.status === 'granted' ? 'Accordé' : 'Refusé'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ─── Member dashboard ───────────────────────────────────────────────────── */
const LEVEL_COLOR: Record<string, string> = { silver: '#9CA3AF', gold: '#F59E0B', platinum: '#06B6D4', vip: '#8B5CF6' };

function MemberDashboard({ stats }: { stats: NonNullable<OverviewProps['memberStats']> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title="🎫 Carte Membre" action={<SeeLink href="/dashboard/modules/member" />}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <StatPill label="Total"   value={stats.total}  accent="#6366F1" />
          <StatPill label="Actifs"  value={stats.active} accent="#10B981" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {Object.entries(stats.byLevel).map(([level, count]) => (
            <div key={level} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--t-row)', borderRadius: 6 }}>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: LEVEL_COLOR[level] ?? 'var(--t-text)', textTransform: 'capitalize', fontWeight: 600 }}>
                {level}
              </span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--t-text)' }}>{count}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Derniers membres">
        {stats.recent.length === 0 ? (
          <EmptyState icon="🎫" text="Aucun membre enregistré." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.recent.map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--t-row)', borderRadius: 6 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${LEVEL_COLOR[m.level] ?? '#6366F1'}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>🎫</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: 'var(--t-text)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.memberName}</p>
                  <p style={{ color: LEVEL_COLOR[m.level] ?? '#818CF8', fontSize: 11, textTransform: 'capitalize' }}>{m.level}</p>
                </div>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.isActive ? '#10B981' : '#EF4444', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

/* ─── Simple dashboards (review, portfolio, medical, certificate) ─────────── */
const SIMPLE_META: Record<string, { icon: string; title: string; desc: string; href: string; color: string }> = {
  review:      { icon: '⭐', title: 'Tap to Review',         desc: 'Chaque scan redirige vos clients vers votre page Google Reviews.', href: '/dashboard/modules/review',      color: '#F59E0B' },
  portfolio:   { icon: '🎵', title: 'Portfolio',             desc: 'Votre portfolio est actif et visible sur votre profil public.',      href: '/dashboard/modules/portfolio',   color: '#EC4899' },
  medical:     { icon: '🩺', title: 'Carte Médicale',        desc: 'Votre carte médicale d\'urgence est active.',                       href: '/dashboard/modules/medical',     color: '#EF4444' },
  certificate: { icon: '🦋', title: 'Certificat',            desc: 'Votre certificat d\'authenticité est disponible.',                  href: '/dashboard/modules/certificate', color: '#10B981' },
};

function SimpleDashboard({ type }: { type: string }) {
  const meta = SIMPLE_META[type];
  if (!meta) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Section title={`${meta.icon} ${meta.title}`} action={<SeeLink href={meta.href} />}>
        <div style={{ padding: '20px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: `${meta.color}18`, border: `1px solid ${meta.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 16 }}>
            {meta.icon}
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--t-text-muted)', lineHeight: 1.6, marginBottom: 20 }}>{meta.desc}</p>
          <Link href={meta.href}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: `${meta.color}18`, border: `1px solid ${meta.color}33`, borderRadius: 8, textDecoration: 'none', color: meta.color, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 13 }}>
            Gérer le module →
          </Link>
        </div>
      </Section>

      <Section title="Actions rapides">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { href: meta.href,            icon: '✏️', label: `Configurer le module`,  desc: 'Paramètres et contenu' },
            { href: '/dashboard/qrcode',  icon: '⬛', label: 'Générer un QR Code',    desc: 'Pour ce module' },
            { href: '/dashboard/analytics', icon: '📊', label: 'Voir les analytics',  desc: 'Scans et interactions' },
          ].map(a => (
            <Link key={a.label} href={a.href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--t-row)', border: 'var(--t-border-full)', borderRadius: 6, textDecoration: 'none' }}>
              <span style={{ fontSize: 16 }}>{a.icon}</span>
              <div>
                <p style={{ color: 'var(--t-text)', fontSize: 13, fontWeight: 500 }}>{a.label}</p>
                <p style={{ color: 'var(--t-text-muted)', fontSize: 11 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function OverviewClient({
  profile, totalScans, totalClicks, totalContacts, recentScans,
  activeModules, menuStats, loyaltyStats, eventStats, accessStats, memberStats,
}: OverviewProps) {
  const engagement = totalScans > 0 ? Math.min(100, Math.round((totalClicks / totalScans) * 100)) : 0;

  const tabs = [
    { id: 'nfc', label: 'Carte NFC', icon: '📡' },
    ...activeModules
      .filter(m => MODULE_META[m])
      .map(m => ({ id: m, ...MODULE_META[m] })),
  ];

  const [activeTab, setActiveTab] = useState(tabs[0]?.id ?? 'nfc');

  const kpis = [
    { label: 'Scans totaux',          value: totalScans,        description: '30 derniers jours' },
    { label: 'Liens cliqués',         value: totalClicks,       description: '30 derniers jours' },
    { label: 'Contacts sauvegardés',  value: totalContacts,     description: 'Total' },
    { label: 'Taux engagement',       value: `${engagement}%`,  description: 'Clics / Scans' },
  ];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--t-text)', marginBottom: 6 }}>
          Bonjour, {profile?.displayName?.split(' ')[0] ?? 'là'} 👋
        </h2>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>
          Voici ce qui se passe avec votre profil{profile?.username ? ` weconnect.cards/${profile.username}` : ''}.
        </p>
      </div>

      {/* KPI cards */}
      <div className="dash-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        {kpis.map(kpi => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      {/* Tab bar — only shown if at least 1 module active */}
      {tabs.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 4 }}>
          {tabs.map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${active ? '#6366F1' : 'rgba(255,255,255,0.1)'}`,
                  background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  color: active ? '#818CF8' : '#6B7280',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Dashboard content */}
      {activeTab === 'nfc'         && <NfcDashboard recentScans={recentScans} profile={profile} />}
      {activeTab === 'menu'        && menuStats    && <MenuDashboard    stats={menuStats}    username={profile?.username} />}
      {activeTab === 'loyalty'     && loyaltyStats && <LoyaltyDashboard stats={loyaltyStats} username={profile?.username} />}
      {activeTab === 'event'       && eventStats   && <EventDashboard   stats={eventStats}   username={profile?.username} />}
      {activeTab === 'access'      && accessStats  && <AccessDashboard  stats={accessStats} />}
      {activeTab === 'member'      && memberStats  && <MemberDashboard  stats={memberStats} />}
      {activeTab === 'review'      && <SimpleDashboard type="review" />}
      {activeTab === 'portfolio'   && <SimpleDashboard type="portfolio" />}
      {activeTab === 'medical'     && <SimpleDashboard type="medical" />}
      {activeTab === 'certificate' && <SimpleDashboard type="certificate" />}
    </div>
  );
}
