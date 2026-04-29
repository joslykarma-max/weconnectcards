'use client';

import { useState } from 'react';

export type AdminClient = {
  uid: string;
  displayName: string;
  email: string;
  plan: string;
  createdAt: string;
  cardCount: number;
  activeCards: number;
};

const PLANS = ['essentiel', 'pro', 'equipe'] as const;

const PLAN_COLORS: Record<string, string> = {
  essentiel: '#9CA3AF',
  pro:       '#818CF8',
  equipe:    '#06B6D4',
};

export default function ClientsAdminClient({ initialClients }: { initialClients: AdminClient[] }) {
  const [clients, setClients] = useState<AdminClient[]>(initialClients);
  const [search, setSearch]   = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [changingPlan, setChangingPlan] = useState<string | null>(null); // uid
  const [saving, setSaving]   = useState(false);

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.displayName.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchPlan   = planFilter === 'all' || c.plan === planFilter;
    return matchSearch && matchPlan;
  });

  const counts = {
    all:       clients.length,
    essentiel: clients.filter(c => c.plan === 'essentiel').length,
    pro:       clients.filter(c => c.plan === 'pro').length,
    equipe:    clients.filter(c => c.plan === 'equipe').length,
  };

  async function handlePlanChange(uid: string, newPlan: string) {
    setSaving(true);
    const res = await fetch('/api/admin/clients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, plan: newPlan }),
    });
    if (res.ok) {
      setClients(prev => prev.map(c => c.uid === uid ? { ...c, plan: newPlan } : c));
    }
    setSaving(false);
    setChangingPlan(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 8 }}>
          Admin
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', marginBottom: 4 }}>
          Clients
        </h1>
        <p style={{ color: '#6B7280', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
          {clients.length} compte{clients.length > 1 ? 's' : ''} enregistré{clients.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher par nom ou email…"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '9px 14px',
            color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
            outline: 'none', width: 280, boxSizing: 'border-box',
          }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {(['all', ...PLANS] as const).map(p => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              style={{
                padding: '7px 14px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: planFilter === p ? (p === 'all' ? 'rgba(255,255,255,0.08)' : `${PLAN_COLORS[p]}22`) : 'transparent',
                color: planFilter === p ? (p === 'all' ? '#F8F9FC' : PLAN_COLORS[p]) : '#4B5563',
                fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase',
                transition: 'all 0.2s',
              }}
            >
              {p === 'all' ? 'Tous' : p} ({counts[p as keyof typeof counts]})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#4B5563', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
          Aucun client trouvé.
        </div>
      ) : (
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 110px 80px 80px 120px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['Nom', 'Email', 'Plan', 'Cartes', 'Actives', 'Inscrit le'].map((h, i) => (
              <span key={i} style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: 2, color: '#374151', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {filtered.map((client) => {
            const planColor = PLAN_COLORS[client.plan] ?? '#9CA3AF';
            const isChanging = changingPlan === client.uid;

            return (
              <div
                key={client.uid}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 110px 80px 80px 120px',
                  gap: 12, padding: '12px 16px', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                {/* Name */}
                <div>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#F8F9FC', fontWeight: 500 }}>
                    {client.displayName || '—'}
                  </p>
                </div>

                {/* Email */}
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {client.email}
                </span>

                {/* Plan (click to change) */}
                <div style={{ position: 'relative' }}>
                  {isChanging ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, position: 'absolute', top: -4, left: 0, zIndex: 10, background: '#1A1D28', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: 6, minWidth: 110 }}>
                      {PLANS.map(p => (
                        <button
                          key={p}
                          onClick={() => handlePlanChange(client.uid, p)}
                          disabled={saving}
                          style={{
                            padding: '5px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                            background: client.plan === p ? `${PLAN_COLORS[p]}22` : 'transparent',
                            color: PLAN_COLORS[p], fontFamily: 'Space Mono, monospace', fontSize: 8,
                            letterSpacing: 1, textTransform: 'uppercase', textAlign: 'left',
                            opacity: saving ? 0.5 : 1,
                          }}
                        >
                          {p}
                        </button>
                      ))}
                      <button
                        onClick={() => setChangingPlan(null)}
                        style={{
                          padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer',
                          background: 'transparent', color: '#4B5563',
                          fontFamily: 'DM Sans, sans-serif', fontSize: 11, textAlign: 'left',
                        }}
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setChangingPlan(client.uid)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        background: `${planColor}15`,
                        border: `1px solid ${planColor}30`,
                        borderRadius: 4, padding: '3px 8px', cursor: 'pointer',
                        color: planColor, fontFamily: 'Space Mono, monospace',
                        fontSize: 8, letterSpacing: 1, textTransform: 'uppercase',
                        transition: 'all 0.15s',
                      }}
                    >
                      {client.plan}
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M6 9l6 6 6-6"/>
                      </svg>
                    </button>
                  )}
                </div>

                {/* Card count */}
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: client.cardCount > 0 ? '#F8F9FC' : '#374151' }}>
                  {client.cardCount}
                </span>

                {/* Active cards */}
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: client.activeCards > 0 ? '#10B981' : '#374151' }}>
                  {client.activeCards}
                </span>

                {/* Date */}
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563' }}>
                  {new Date(client.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
