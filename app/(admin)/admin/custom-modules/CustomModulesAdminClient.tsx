'use client';

import { useState } from 'react';
import type { CustomModuleRequestDoc } from '@/lib/types';

const STATUSES: { value: CustomModuleRequestDoc['status']; label: string; color: string }[] = [
  { value: 'pending',     label: 'En attente',   color: '#F59E0B' },
  { value: 'in_review',   label: 'En analyse',   color: '#6366F1' },
  { value: 'quoted',      label: 'Devis envoyé', color: '#06B6D4' },
  { value: 'in_progress', label: 'En cours',     color: '#8B5CF6' },
  { value: 'delivered',   label: 'Livré',        color: '#10B981' },
  { value: 'rejected',    label: 'Refusé',       color: '#EF4444' },
];

export default function CustomModulesAdminClient({ requests: initial }: { requests: CustomModuleRequestDoc[] }) {
  const [requests, setRequests] = useState(initial);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving,   setSaving]   = useState<string | null>(null);
  const [notes,    setNotes]    = useState<Record<string, string>>({});

  const pending   = requests.filter(r => r.status === 'pending').length;
  const inReview  = requests.filter(r => r.status === 'in_review').length;

  async function updateRequest(id: string, patch: { status?: CustomModuleRequestDoc['status']; adminNote?: string }) {
    setSaving(id);
    await fetch(`/api/admin/custom-modules/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(patch),
    });
    setRequests((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
    setSaving(null);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 8 }}>Admin</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--t-text)', marginBottom: 4 }}>
          ✦ Modules sur mesure
        </h1>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#F59E0B' }}>
            {pending} en attente
          </span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#6366F1' }}>
            {inReview} en analyse
          </span>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text-muted)' }}>
            {requests.length} total
          </span>
        </div>
      </div>

      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#4B5563', fontFamily: 'DM Sans, sans-serif' }}>
          Aucune demande pour l'instant.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {requests.map((r) => {
            const st        = STATUSES.find(s => s.value === r.status) ?? STATUSES[0];
            const isOpen    = expanded === r.id;
            const isSaving  = saving   === r.id;

            return (
              <div key={r.id} style={{
                background: 'var(--t-surface)', border: 'var(--t-border-full)',
                borderRadius: 8, overflow: 'hidden',
              }}>

                {/* Row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                  style={{
                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                    display: 'grid', gridTemplateColumns: '1fr 160px 140px 100px',
                    gap: 16, padding: '16px 20px', alignItems: 'center', textAlign: 'left',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--t-text)', marginBottom: 2 }}>
                      {r.moduleName}
                    </p>
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)' }}>
                      {r.displayName} · {r.email}
                    </p>
                  </div>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563' }}>
                    {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)' }}>
                    {r.budget ?? '—'}
                  </p>
                  <span style={{
                    fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1,
                    textTransform: 'uppercase', color: st.color,
                    background: `${st.color}15`, border: `1px solid ${st.color}30`,
                    borderRadius: 4, padding: '4px 8px', textAlign: 'center',
                  }}>
                    {st.label}
                  </span>
                </button>

                {/* Detail panel */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '20px' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                      <div>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Description</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', lineHeight: 1.6 }}>{r.description}</p>
                      </div>
                      <div>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Cas d'usage</p>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', lineHeight: 1.6 }}>{r.useCase}</p>
                      </div>
                    </div>

                    {r.timeline && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280', marginBottom: 16 }}>
                        ⏱ Délai souhaité : <span style={{ color: 'var(--t-text)' }}>{r.timeline}</span>
                      </p>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>

                      {/* Status changer */}
                      <div style={{ flex: '0 0 180px' }}>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Statut</p>
                        <select
                          value={r.status}
                          onChange={(e) => updateRequest(r.id, { status: e.target.value as CustomModuleRequestDoc['status'] })}
                          style={{
                            width: '100%', background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                            padding: '8px 10px', color: st.color,
                            fontFamily: 'Space Mono, monospace', fontSize: 10,
                            outline: 'none', cursor: 'pointer',
                          }}
                        >
                          {STATUSES.map(s => (
                            <option key={s.value} value={s.value} style={{ background: '#181B26', color: s.color }}>{s.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* Admin note */}
                      <div style={{ flex: 1, minWidth: 240 }}>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>
                          Note (visible par le client)
                        </p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={notes[r.id] ?? r.adminNote ?? ''}
                            onChange={(e) => setNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                            placeholder="Devis : 75 000 FCFA · Délai : 3 semaines…"
                            style={{
                              flex: 1, background: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                              padding: '8px 10px', color: '#F8F9FC',
                              fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
                            }}
                          />
                          <button
                            onClick={() => updateRequest(r.id, { adminNote: notes[r.id] ?? r.adminNote ?? '' })}
                            disabled={isSaving}
                            style={{
                              padding: '8px 14px', background: 'linear-gradient(135deg, #4338CA, #6366F1)',
                              border: 'none', borderRadius: 6, color: '#fff',
                              fontFamily: 'Space Mono, monospace', fontSize: 9,
                              cursor: 'pointer', whiteSpace: 'nowrap', opacity: isSaving ? 0.6 : 1,
                            }}
                          >
                            {isSaving ? '…' : 'Sauver'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
