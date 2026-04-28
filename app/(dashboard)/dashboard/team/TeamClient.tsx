'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type Member = {
  id:           string;
  email:        string;
  displayName?: string;
  role:         'admin' | 'member';
  status:       'pending' | 'active';
  invitedAt:    string;
  joinedAt?:    string;
  stats:        { scans: number; clicks: number } | null;
};

interface Props {
  teamName:    string;
  members:     Member[];
  ownerStats:  { scans: number; clicks: number };
  totalStats:  { scans: number; clicks: number };
  ownerEmail:  string;
  isPro:       boolean;
}

type Tab = 'members' | 'invites' | 'analytics';

function Avatar({ name, email, size = 40 }: { name?: string; email: string; size?: number }) {
  const letter = (name || email).charAt(0).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontWeight: 700,
      fontSize: size * 0.375, color: '#fff', flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

function StatBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #6366F1, #06B6D4)', transition: 'width 0.4s' }} />
    </div>
  );
}

export default function TeamClient({ teamName: initialName, members: initialMembers, ownerStats, totalStats, ownerEmail, isPro }: Props) {
  const [members, setMembers]         = useState<Member[]>(initialMembers);
  const [teamName, setTeamName]       = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(initialName);
  const [savingName, setSavingName]   = useState(false);
  const [tab, setTab]                 = useState<Tab>('members');

  // Invite form
  const [inviteEmail, setInviteEmail]     = useState('');
  const [inviteRole, setInviteRole]       = useState<'member' | 'admin'>('member');
  const [inviting, setInviting]           = useState(false);
  const [inviteError, setInviteError]     = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Actions
  const [removing, setRemoving]         = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);

  if (!isPro) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{
          background: '#12141C', border: '1px solid rgba(99,102,241,0.2)',
          borderRadius: 12, padding: 48, textAlign: 'center',
        }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>👥</span>
          <Badge variant="electric" className="mb-4">PRO requis</Badge>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', margin: '16px 0' }}>
            Mode Équipe
          </h2>
          <p style={{ color: '#9CA3AF', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            Invitez vos collaborateurs, gérez leurs profils depuis un dashboard centralisé et accédez aux analytics groupées.
          </p>
          <Button variant="gradient" size="lg" style={{ width: '100%' }}>
            Passer au plan Pro
          </Button>
        </div>
      </div>
    );
  }

  const activeMembers  = members.filter((m) => m.status === 'active');
  const pendingMembers = members.filter((m) => m.status === 'pending');

  async function saveName() {
    if (!nameInput.trim()) return;
    setSavingName(true);
    await fetch('/api/team', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: nameInput }),
    });
    setTeamName(nameInput);
    setEditingName(false);
    setSavingName(false);
  }

  async function invite() {
    if (!inviteEmail.trim()) { setInviteError('Entrez un email.'); return; }
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');
    const res  = await fetch('/api/team', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json() as { error?: string; member?: Member };
    if (!res.ok) {
      setInviteError(data.error ?? 'Erreur.');
    } else {
      setMembers((prev) => [...prev, { ...data.member!, stats: null }]);
      setInviteEmail('');
      setInviteSuccess(`Invitation envoyée à ${inviteEmail}`);
      setTimeout(() => setInviteSuccess(''), 4000);
    }
    setInviting(false);
  }

  async function removeMember(id: string) {
    setRemoving(id);
    await fetch(`/api/team?email=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setRemoving(null);
  }

  async function changeRole(id: string, role: 'admin' | 'member') {
    setChangingRole(id);
    await fetch('/api/team', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: id, role }),
    });
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
    setChangingRole(null);
  }

  const maxScans  = Math.max(ownerStats.scans,  ...members.map((m) => m.stats?.scans  ?? 0), 1);
  const maxClicks = Math.max(ownerStats.clicks, ...members.map((m) => m.stats?.clicks ?? 0), 1);

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6, padding: '10px 12px',
    color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none',
  };

  const labelStyle = {
    fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2,
    color: '#6B7280', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                style={{ ...inputStyle, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, width: 'auto' }}
                autoFocus
              />
              <Button variant="gradient" size="sm" loading={savingName} onClick={saveName}>OK</Button>
              <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>
                Annuler
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC' }}>
                {teamName}
              </h2>
              <button
                onClick={() => { setNameInput(teamName); setEditingName(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}
                title="Renommer"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
            {activeMembers.length + 1} membre{activeMembers.length + 1 > 1 ? 's' : ''}
            {pendingMembers.length > 0 && ` · ${pendingMembers.length} invitation${pendingMembers.length > 1 ? 's' : ''} en attente`}
          </p>
        </div>
        <Badge variant="gradient">⚡ Pro</Badge>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {[
          { label: 'Membres actifs',    value: activeMembers.length + 1, icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )},
          { label: 'Scans équipe',      value: totalStats.scans, icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          )},
          { label: 'Clics équipe',      value: totalStats.clicks, icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )},
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: '#12141C', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '18px 20px',
          }}>
            <div style={{ color: '#6366F1', marginBottom: 10 }}>{kpi.icon}</div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 2 }}>
              {kpi.value}
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 0 }}>
        {([
          { key: 'members',   label: 'Membres',      count: activeMembers.length + 1 },
          { key: 'invites',   label: 'Invitations',  count: pendingMembers.length },
          { key: 'analytics', label: 'Analytics',    count: null },
        ] as { key: Tab; label: string; count: number | null }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 16px', borderBottom: `2px solid ${tab === t.key ? '#6366F1' : 'transparent'}`,
              color: tab === t.key ? '#818CF8' : '#6B7280',
              fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1.5,
              textTransform: 'uppercase', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span style={{
                background: tab === t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)',
                color: tab === t.key ? '#818CF8' : '#9CA3AF',
                borderRadius: 10, padding: '1px 7px', fontSize: 9,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: MEMBRES ── */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {/* Owner */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 16px', borderRadius: 8,
            background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)',
          }}>
            <Avatar email={ownerEmail} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {ownerEmail}
              </p>
              <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', marginTop: 2 }}>Propriétaire</p>
            </div>
            <Badge variant="gradient">Propriétaire</Badge>
          </div>

          {/* Active members */}
          {activeMembers.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 8,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <Avatar name={m.displayName} email={m.email} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {m.displayName || m.email}
                </p>
                {m.displayName && (
                  <p style={{ color: '#6B7280', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</p>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                {/* Role toggle */}
                <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {(['member', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      disabled={changingRole === m.id}
                      onClick={() => { if (m.role !== r) changeRole(m.id, r); }}
                      style={{
                        padding: '5px 10px',
                        background: m.role === r ? (r === 'admin' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)') : 'transparent',
                        border: 'none', cursor: m.role === r ? 'default' : 'pointer',
                        color: m.role === r ? (r === 'admin' ? '#818CF8' : '#F8F9FC') : '#6B7280',
                        fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {r === 'member' ? 'Membre' : 'Admin'}
                    </button>
                  ))}
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeMember(m.id)}
                  disabled={removing === m.id}
                  title="Retirer"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#EF4444', opacity: removing === m.id ? 0.3 : 0.5,
                    padding: 6, borderRadius: 6, transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = removing === m.id ? '0.3' : '0.5'; e.currentTarget.style.background = 'none'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {activeMembers.length === 0 && (
            <div style={{
              textAlign: 'center', padding: '40px 20px',
              background: 'rgba(255,255,255,0.02)', borderRadius: 8,
              border: '1px dashed rgba(255,255,255,0.07)',
            }}>
              <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }}>Aucun membre actif pour l&apos;instant.</p>
              <button
                onClick={() => setTab('invites')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818CF8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', textDecoration: 'underline' }}
              >
                Inviter des collaborateurs →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: INVITATIONS ── */}
      {tab === 'invites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Pending list */}
          {pendingMembers.length > 0 && (
            <div>
              <p style={{ ...labelStyle, marginBottom: 12 }}>En attente ({pendingMembers.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {pendingMembers.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 16px', borderRadius: 8,
                      background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)',
                    }}
                  >
                    <Avatar email={m.email} size={36} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.email}
                      </p>
                      <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>
                        Invité le {new Date(m.invitedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {' · '}
                        {m.role === 'admin' ? '🛡️ Admin' : '👤 Membre'}
                      </p>
                    </div>
                    <Badge variant="warning" dot>En attente</Badge>
                    <button
                      onClick={() => removeMember(m.id)}
                      disabled={removing === m.id}
                      title="Annuler l'invitation"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#6B7280', opacity: 0.6, padding: 6,
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invite form */}
          <div style={{
            background: '#12141C', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: 24,
          }}>
            <p style={{ ...labelStyle, marginBottom: 20 }}>Inviter un collaborateur</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  placeholder="collaborateur@email.com"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') invite(); }}
                  style={{ ...inputStyle, borderColor: inviteError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Rôle</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([
                    { value: 'member', label: '👤 Membre', desc: 'Gère son propre profil' },
                    { value: 'admin',  label: '🛡️ Admin',  desc: 'Accès à tous les profils' },
                  ] as const).map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setInviteRole(r.value)}
                      style={{
                        padding: '12px 14px', textAlign: 'left',
                        background: inviteRole === r.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${inviteRole === r.value ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
                      }}
                    >
                      <p style={{ color: inviteRole === r.value ? '#818CF8' : '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, margin: 0 }}>
                        {r.label}
                      </p>
                      <p style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif', fontSize: 11, margin: '4px 0 0' }}>
                        {r.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {inviteError && (
                <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6 }}>
                  {inviteError}
                </p>
              )}
              {inviteSuccess && (
                <p style={{ color: '#10B981', fontSize: 13, background: 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: 6 }}>
                  ✓ {inviteSuccess}
                </p>
              )}

              <Button variant="gradient" size="md" loading={inviting} onClick={invite} style={{ width: '100%' }}>
                {inviting ? 'Envoi...' : 'Envoyer l\'invitation'}
              </Button>
            </div>
          </div>

          {/* Role guide */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { icon: '👤', role: 'Membre',       desc: 'Gère son propre profil et ses modules.' },
              { icon: '🛡️', role: 'Admin',        desc: 'Accès à tous les profils de l\'équipe.' },
              { icon: '👑', role: 'Propriétaire', desc: 'Gestion complète + facturation.' },
            ].map((r) => (
              <div key={r.role} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 8, padding: '14px 16px',
              }}>
                <span style={{ fontSize: 20, display: 'block', marginBottom: 8 }}>{r.icon}</span>
                <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, marginBottom: 4 }}>{r.role}</p>
                <p style={{ color: '#6B7280', fontSize: 12 }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB: ANALYTICS ── */}
      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ ...labelStyle, marginBottom: 4 }}>Performance par membre</p>

          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 140px 140px',
            padding: '8px 16px', gap: 12,
          }}>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase' }}>Membre</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase' }}>Scans</span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#4B5563', textTransform: 'uppercase' }}>Clics</span>
          </div>

          {/* Owner row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 140px 140px',
            padding: '14px 16px', gap: 12, borderRadius: 8,
            background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar email={ownerEmail} size={32} />
              <div style={{ minWidth: 0 }}>
                <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ownerEmail}
                </p>
                <p style={{ color: '#6366F1', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>Propriétaire</p>
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{ownerStats.scans}</span>
                <StatBar value={ownerStats.scans} max={maxScans} />
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{ownerStats.clicks}</span>
                <StatBar value={ownerStats.clicks} max={maxClicks} />
              </div>
            </div>
          </div>

          {/* Member rows */}
          {members.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 140px 140px',
                padding: '14px 16px', gap: 12, borderRadius: 8,
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Avatar name={m.displayName} email={m.email} size={32} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.displayName || m.email}
                  </p>
                  <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>
                    {m.role === 'admin' ? 'Admin' : 'Membre'}
                    {m.status === 'pending' && ' · En attente'}
                  </p>
                </div>
              </div>
              <div>
                {m.stats ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{m.stats.scans}</span>
                    <StatBar value={m.stats.scans} max={maxScans} />
                  </div>
                ) : (
                  <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>
                )}
              </div>
              <div>
                {m.stats ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{m.stats.clicks}</span>
                    <StatBar value={m.stats.clicks} max={maxClicks} />
                  </div>
                ) : (
                  <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>
                )}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6B7280', fontSize: 14 }}>
              Invitez des membres pour voir les analytics par personne.
            </div>
          )}

          {/* Totals */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 140px 140px',
            padding: '14px 16px', gap: 12, borderRadius: 8,
            background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)',
            marginTop: 8,
          }}>
            <p style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>TOTAL ÉQUIPE</p>
            <p style={{ color: '#06B6D4', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>{totalStats.scans}</p>
            <p style={{ color: '#06B6D4', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>{totalStats.clicks}</p>
          </div>
        </div>
      )}

    </div>
  );
}
