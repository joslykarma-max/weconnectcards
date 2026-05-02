'use client';

import { useState } from 'react';

export type AdminClient = {
  uid: string;
  displayName: string;
  email: string;
  plan: string;
  cardType: 'standard' | 'pro' | 'prestige' | null;
  cardTypesOwned: string[];
  subscriptionUntil: string | null;
  createdAt: string;
  cardCount: number;
  activeCards: number;
  lastScanAt: string | null;
};

const PLANS = ['essentiel', 'pro', 'equipe'] as const;

const PLAN_COLORS: Record<string, string> = {
  essentiel: '#9CA3AF',
  pro:       '#818CF8',
  equipe:    '#06B6D4',
};

const CARD_TYPE_COLORS: Record<string, string> = {
  standard: '#9CA3AF',
  pro:      '#6366F1',
  prestige: '#F59E0B',
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' });
}

function subStatus(subscriptionUntil: string | null) {
  if (!subscriptionUntil) return { label: '—', color: '#4B5563', expired: null as boolean | null };
  const end = new Date(subscriptionUntil);
  const now = new Date();
  const diffDays = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0)       return { label: `Expiré · ${-diffDays}j`, color: '#EF4444', expired: true };
  if (diffDays < 30)      return { label: `${diffDays}j restant`,   color: '#F59E0B', expired: false };
  return { label: `${diffDays}j restant`, color: '#10B981', expired: false };
}

export default function ClientsAdminClient({ initialClients }: { initialClients: AdminClient[] }) {
  const [clients, setClients]               = useState<AdminClient[]>(initialClients);
  const [search, setSearch]                 = useState('');
  const [planFilter, setPlanFilter]         = useState<string>('all');
  const [subFilter, setSubFilter]           = useState<'all' | 'active' | 'expiring' | 'expired'>('all');
  const [openMenu, setOpenMenu]             = useState<string | null>(null); // uid
  const [extendingUid, setExtendingUid]     = useState<string | null>(null);
  const [extendValue, setExtendValue]       = useState(1);
  const [saving, setSaving]                 = useState(false);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.displayName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchPlan   = planFilter === 'all' || c.plan === planFilter;
    let matchSub = true;
    if (subFilter !== 'all') {
      const s = subStatus(c.subscriptionUntil);
      if (subFilter === 'active'   && !(s.expired === false)) matchSub = false;
      if (subFilter === 'expiring' && !(s.color === '#F59E0B')) matchSub = false;
      if (subFilter === 'expired'  && !(s.expired === true)) matchSub = false;
    }
    return matchSearch && matchPlan && matchSub;
  });

  const counts = {
    all:       clients.length,
    expired:   clients.filter(c => subStatus(c.subscriptionUntil).expired === true).length,
    expiring:  clients.filter(c => subStatus(c.subscriptionUntil).color === '#F59E0B').length,
  };

  async function patchClient(uid: string, body: Record<string, unknown>) {
    setSaving(true);
    const res = await fetch('/api/admin/clients', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ uid, ...body }),
    });
    setSaving(false);
    if (res.ok) {
      // Optimistic local update
      setClients(prev => prev.map(c => {
        if (c.uid !== uid) return c;
        const next = { ...c };
        if (typeof body.plan === 'string')              next.plan              = body.plan;
        if (typeof body.cardType === 'string')          next.cardType          = body.cardType as AdminClient['cardType'];
        if (typeof body.subscriptionUntil === 'string') next.subscriptionUntil = body.subscriptionUntil;
        return next;
      }));
      return true;
    }
    return false;
  }

  async function handleExtend(uid: string) {
    const ok = await patchClient(uid, { extendMonths: extendValue });
    if (ok) {
      // Update subscriptionUntil locally — recompute from server
      const userRes = await fetch('/api/admin/clients').then(r => r.json()) as AdminClient[];
      const fresh = userRes.find((u) => u.uid === uid);
      if (fresh) {
        setClients(prev => prev.map(c => c.uid === uid ? { ...c, subscriptionUntil: fresh.subscriptionUntil } : c));
      }
      setExtendingUid(null);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 8 }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--t-text)', marginBottom: 4 }}>
          Clients
        </h1>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
          {clients.length} compte{clients.length > 1 ? 's' : ''} ·{' '}
          <span style={{ color: '#F59E0B' }}>{counts.expiring} expiration imminente</span> ·{' '}
          <span style={{ color: '#EF4444' }}>{counts.expired} expirés</span>
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Nom ou email…"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '8px 12px',
            color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif',
            fontSize: 13, outline: 'none', flex: 1, minWidth: 200,
          }}
        />

        <select
          value={planFilter}
          onChange={e => setPlanFilter(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '8px 12px',
            color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif',
            fontSize: 13, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all" style={{ background: '#181B26' }}>Tous les plans</option>
          {PLANS.map(p => (
            <option key={p} value={p} style={{ background: '#181B26' }}>{p}</option>
          ))}
        </select>

        <select
          value={subFilter}
          onChange={e => setSubFilter(e.target.value as typeof subFilter)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '8px 12px',
            color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif',
            fontSize: 13, outline: 'none', cursor: 'pointer',
          }}
        >
          <option value="all"      style={{ background: '#181B26' }}>Tous statuts abo</option>
          <option value="active"   style={{ background: '#181B26' }}>Actifs</option>
          <option value="expiring" style={{ background: '#181B26' }}>Expire dans 30j</option>
          <option value="expired"  style={{ background: '#181B26' }}>Expirés</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 8, overflow: 'visible' }}>
        {/* Header row */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 100px 110px 110px 70px 110px 70px',
          gap: 12, padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {['Client', 'Email', 'Plan', 'Carte', 'Abonnement', 'Cartes', 'Dernière activité', ''].map(h => (
            <span key={h} style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--t-text-muted)', fontSize: 14 }}>
            Aucun client.
          </p>
        ) : (
          <div>
            {filtered.map((client) => {
              const planColor = PLAN_COLORS[client.plan] ?? '#9CA3AF';
              const sub       = subStatus(client.subscriptionUntil);
              const cardType  = client.cardType ?? client.cardTypesOwned[0] ?? null;
              const cardColor = cardType ? CARD_TYPE_COLORS[cardType] : '#4B5563';
              const isMenuOpen = openMenu === client.uid;

              return (
                <div
                  key={client.uid}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.4fr 1.6fr 100px 110px 110px 70px 110px 70px',
                    gap: 12, padding: '12px 16px', alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    position: 'relative',
                  }}
                >
                  {/* Name */}
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.displayName || '—'}
                  </p>

                  {/* Email */}
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: 'var(--t-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {client.email}
                  </span>

                  {/* Plan badge */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: `${planColor}15`,
                    border: `1px solid ${planColor}30`,
                    borderRadius: 4, padding: '3px 8px',
                    color: planColor, fontFamily: 'Space Mono, monospace',
                    fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                    width: 'fit-content',
                  }}>
                    {client.plan}
                  </span>

                  {/* Card type */}
                  {cardType ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      background: `${cardColor}15`,
                      border: `1px solid ${cardColor}30`,
                      borderRadius: 4, padding: '3px 8px',
                      color: cardColor, fontFamily: 'Space Mono, monospace',
                      fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                      width: 'fit-content',
                    }}>
                      {cardType === 'prestige' ? '👑' : cardType === 'pro' ? '💼' : '💳'} {cardType}
                    </span>
                  ) : (
                    <span style={{ color: '#4B5563', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>—</span>
                  )}

                  {/* Subscription status */}
                  <div>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: sub.color, fontWeight: 600 }}>
                      {sub.label}
                    </p>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#4B5563', marginTop: 2 }}>
                      {fmtDate(client.subscriptionUntil)}
                    </p>
                  </div>

                  {/* Cards count */}
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
                    <span style={{ color: client.activeCards > 0 ? '#10B981' : '#374151' }}>{client.activeCards}</span>
                    <span style={{ color: '#4B5563', fontSize: 11 }}> / {client.cardCount}</span>
                  </span>

                  {/* Last scan */}
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: client.lastScanAt ? '#9CA3AF' : '#4B5563' }}>
                    {client.lastScanAt
                      ? new Date(client.lastScanAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                      : 'Jamais'}
                  </span>

                  {/* Actions */}
                  <button
                    onClick={() => setOpenMenu(isMenuOpen ? null : client.uid)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 4, padding: '4px 8px', cursor: 'pointer',
                      color: '#9CA3AF', fontSize: 12, fontFamily: 'DM Sans, sans-serif',
                      width: 'fit-content',
                    }}
                  >
                    ⋯
                  </button>

                  {/* Action menu */}
                  {isMenuOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% - 6px)', right: 16,
                      zIndex: 50,
                      background: 'var(--t-card)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: 8, padding: 10, minWidth: 240,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    }}>
                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase', marginBottom: 8 }}>
                        Plan compte
                      </p>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {PLANS.map(p => (
                          <button
                            key={p}
                            onClick={async () => { await patchClient(client.uid, { plan: p }); }}
                            disabled={saving}
                            style={{
                              flex: 1, padding: '6px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                              background: client.plan === p ? `${PLAN_COLORS[p]}22` : 'rgba(255,255,255,0.05)',
                              color: client.plan === p ? PLAN_COLORS[p] : '#9CA3AF',
                              fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                            }}
                          >
                            {p}
                          </button>
                        ))}
                      </div>

                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase', marginBottom: 8 }}>
                        Type de carte
                      </p>
                      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                        {(['standard', 'pro', 'prestige'] as const).map(ct => (
                          <button
                            key={ct}
                            onClick={async () => { await patchClient(client.uid, { cardType: ct }); }}
                            disabled={saving}
                            style={{
                              flex: 1, padding: '6px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                              background: client.cardType === ct ? `${CARD_TYPE_COLORS[ct]}22` : 'rgba(255,255,255,0.05)',
                              color: client.cardType === ct ? CARD_TYPE_COLORS[ct] : '#9CA3AF',
                              fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
                            }}
                          >
                            {ct}
                          </button>
                        ))}
                      </div>

                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase', marginBottom: 8 }}>
                        Étendre l&apos;abonnement
                      </p>
                      {extendingUid === client.uid ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <input
                            type="number"
                            min={1}
                            max={36}
                            value={extendValue}
                            onChange={e => setExtendValue(parseInt(e.target.value, 10) || 1)}
                            style={{
                              width: 60, background: 'rgba(255,255,255,0.05)',
                              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                              padding: '4px 8px', color: 'var(--t-text)',
                              fontSize: 12, outline: 'none',
                            }}
                          />
                          <span style={{ fontSize: 11, color: '#9CA3AF' }}>mois</span>
                          <button
                            onClick={() => handleExtend(client.uid)}
                            disabled={saving}
                            style={{
                              flex: 1, padding: '5px 10px', borderRadius: 4, border: 'none',
                              background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                              color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            {saving ? '...' : 'OK'}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: 4 }}>
                          {[1, 6, 12].map(m => (
                            <button
                              key={m}
                              onClick={async () => { setExtendValue(m); await patchClient(client.uid, { extendMonths: m }); setOpenMenu(null); }}
                              disabled={saving}
                              style={{
                                flex: 1, padding: '6px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
                                background: 'rgba(99,102,241,0.1)', color: '#818CF8',
                                fontSize: 11, fontFamily: 'DM Sans, sans-serif',
                              }}
                            >
                              +{m}mois
                            </button>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => setOpenMenu(null)}
                        style={{
                          width: '100%', marginTop: 10, padding: 6, borderRadius: 4, border: 'none',
                          background: 'transparent', color: '#6B7280',
                          fontSize: 11, cursor: 'pointer',
                        }}
                      >
                        Fermer
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563' }}>
        Cartes affichées : actives / total · Dernière activité = dernier scan NFC
      </p>
    </div>
  );
}
