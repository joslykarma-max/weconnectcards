import { adminDb } from '@/lib/firebase-admin';
import type { UserDoc, CardDoc } from '@/lib/types';
import Link from 'next/link';

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div style={{
      background: 'var(--t-surface)',
      border: `1px solid ${color}22`,
      borderRadius: 8,
      padding: '20px 24px',
    }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color, textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </p>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: 'var(--t-text)', lineHeight: 1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)', marginTop: 6 }}>{sub}</p>
      )}
    </div>
  );
}

export default async function AdminOverviewPage() {
  const [usersSnap, cardsSnap] = await Promise.all([
    adminDb.collection('users').get(),
    adminDb.collection('cards').get(),
  ]);

  const users = usersSnap.docs.map(d => ({ uid: d.id, ...(d.data() as UserDoc) }));
  const cards = cardsSnap.docs.map(d => ({ id: d.id, ...(d.data() as CardDoc) }));

  const byPlan = {
    essentiel: users.filter(u => u.plan === 'essentiel').length,
    pro:       users.filter(u => u.plan === 'pro').length,
    equipe:    users.filter(u => u.plan === 'equipe').length,
  };

  const byStatus = {
    pending:  cards.filter(c => c.status === 'pending').length,
    shipped:  cards.filter(c => c.status === 'shipped').length,
    active:   cards.filter(c => c.status === 'active').length,
  };

  // Latest pending orders (need action)
  const userMap: Record<string, UserDoc> = {};
  users.forEach(u => { userMap[u.uid] = u; });

  const pendingOrders = cards
    .filter(c => c.status === 'pending' && !!c.userId)
    .sort((a, b) => new Date(b.orderedAt ?? 0).getTime() - new Date(a.orderedAt ?? 0).getTime())
    .slice(0, 8)
    .map(c => ({ ...c, user: userMap[c.userId!] ?? null }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 8 }}>
          Admin Panel
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--t-text)', marginBottom: 4 }}>
          Vue d&apos;ensemble
        </h1>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <StatCard label="Utilisateurs" value={users.length} sub={`Essentiel ${byPlan.essentiel} · Pro ${byPlan.pro} · Équipe ${byPlan.equipe}`} color="#6366F1" />
        <StatCard label="Commandes en attente" value={byStatus.pending} sub="Cartes à configurer" color="#EF4444" />
        <StatCard label="Cartes expédiées" value={byStatus.shipped} sub="En transit chez les clients" color="#F59E0B" />
        <StatCard label="Cartes activées" value={byStatus.active} sub="Clients opérationnels" color="#10B981" />
      </div>

      {/* Plan breakdown */}
      <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 8, padding: '20px 24px' }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-sub)', textTransform: 'uppercase', marginBottom: 16 }}>
          Répartition par plan
        </p>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Essentiel', count: byPlan.essentiel, color: 'var(--t-text-sub)' },
            { label: 'Pro',       count: byPlan.pro,       color: '#6366F1' },
            { label: 'Équipe',    count: byPlan.equipe,    color: '#06B6D4' },
          ].map(p => (
            <div key={p.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text-sub)' }}>{p.label}</span>
              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--t-text)' }}>{p.count}</span>
              {users.length > 0 && (
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563' }}>
                  {Math.round(p.count / users.length * 100)}%
                </span>
              )}
            </div>
          ))}
        </div>
        {users.length > 0 && (
          <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 16, gap: 1 }}>
            {byPlan.essentiel > 0 && <div style={{ flex: byPlan.essentiel, background: '#9CA3AF' }} />}
            {byPlan.pro > 0       && <div style={{ flex: byPlan.pro,       background: '#6366F1' }} />}
            {byPlan.equipe > 0    && <div style={{ flex: byPlan.equipe,    background: '#06B6D4' }} />}
          </div>
        )}
      </div>

      {/* Pending orders */}
      <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 8, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase' }}>
            Commandes à traiter
          </p>
          {byStatus.pending > 8 && (
            <Link href="/admin/cards" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6366F1', textDecoration: 'none' }}>
              Voir toutes ({byStatus.pending}) →
            </Link>
          )}
        </div>

        {pendingOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 24, marginBottom: 8 }}>✅</p>
            <p style={{ color: '#10B981', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
              Aucune commande en attente — tout est traité !
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 140px', gap: 12, padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {['Client', 'Email', 'Plan', 'Commandée le'].map(h => (
                <span key={h} style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase' }}>{h}</span>
              ))}
            </div>
            {pendingOrders.map((order) => (
              <Link
                key={order.id}
                href="/admin/cards"
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 100px 140px', gap: 12,
                  padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.04)',
                  textDecoration: 'none', borderRadius: 4,
                  transition: 'background 0.15s',
                }}
                onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)' }}>
                  {order.user?.displayName ?? '—'}
                </span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--t-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {order.user?.email ?? (order.userId ?? '').slice(0, 12) + '…'}
                </span>
                <span style={{
                  fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1,
                  color: order.user?.plan === 'pro' ? '#818CF8' : order.user?.plan === 'equipe' ? '#06B6D4' : '#9CA3AF',
                  textTransform: 'uppercase',
                }}>
                  {order.user?.plan ?? '—'}
                </span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#4B5563' }}>
                  {order.orderedAt ? new Date(order.orderedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '—'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Link
          href="/admin/cards"
          style={{
            flex: 1, padding: '16px 20px', background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5">
            <rect x="1" y="4" width="22" height="16" rx="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', fontWeight: 500 }}>Gérer les cartes</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#EF4444', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Configurer · Expédier</p>
          </div>
        </Link>
        <Link
          href="/admin/clients"
          style={{
            flex: 1, padding: '16px 20px', background: 'rgba(99,102,241,0.07)',
            border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8,
            textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', fontWeight: 500 }}>Gérer les clients</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6366F1', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>Plans · Comptes</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
