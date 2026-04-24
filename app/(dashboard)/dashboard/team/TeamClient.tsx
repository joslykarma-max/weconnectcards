'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type Member = {
  id:          string;
  email:       string;
  displayName?: string;
  role:        'admin' | 'member';
  status:      'pending' | 'active';
  invitedAt:   string;
  joinedAt?:   string;
};

type Stats = {
  totalScans:    number;
  totalClicks:   number;
  activeMembers: number;
};

interface Props {
  teamName:  string;
  members:   Member[];
  stats:     Stats;
  ownerEmail: string;
  isPro:     boolean;
}

const ROLE_LABELS = { admin: 'Admin', member: 'Membre' };

function Avatar({ name, email }: { name?: string; email: string }) {
  const letter = (name || email).charAt(0).toUpperCase();
  return (
    <div style={{
      width: 40, height: 40, borderRadius: '50%',
      background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#fff',
      flexShrink: 0,
    }}>
      {letter}
    </div>
  );
}

export default function TeamClient({ teamName: initialName, members: initialMembers, stats, ownerEmail, isPro }: Props) {
  const [members, setMembers]   = useState<Member[]>(initialMembers);
  const [teamName, setTeamName] = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput]     = useState(initialName);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole]   = useState<'member' | 'admin'>('member');
  const [inviting, setInviting]       = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [removing, setRemoving]       = useState<string | null>(null);
  const [savingName, setSavingName]   = useState(false);

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

  async function invite() {
    if (!inviteEmail.trim()) { setInviteError('Entrez un email.'); return; }
    setInviting(true);
    setInviteError('');
    setInviteSuccess('');

    const res  = await fetch('/api/team', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email: inviteEmail, role: inviteRole }),
    });
    const data = await res.json() as { error?: string; member?: Member };

    if (!res.ok) {
      setInviteError(data.error ?? 'Erreur.');
    } else {
      setMembers((prev) => [...prev, data.member!]);
      setInviteEmail('');
      setInviteSuccess(`Invitation envoyée à ${inviteEmail}`);
      setTimeout(() => setInviteSuccess(''), 3000);
    }
    setInviting(false);
  }

  async function removeMember(email: string) {
    setRemoving(email);
    await fetch(`/api/team?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
    setMembers((prev) => prev.filter((m) => m.id !== email));
    setRemoving(null);
  }

  async function saveName() {
    if (!nameInput.trim()) return;
    setSavingName(true);
    await fetch('/api/team', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: nameInput }),
    });
    setTeamName(nameInput);
    setEditingName(false);
    setSavingName(false);
  }

  const activeCount  = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(99,102,241,0.4)',
                  borderRadius: 6, padding: '6px 12px', color: '#F8F9FC',
                  fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, outline: 'none',
                }}
              />
              <Button variant="gradient" size="sm" loading={savingName} onClick={saveName}>Sauvegarder</Button>
              <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC' }}>
                {teamName || 'Mon équipe'}
              </h2>
              <button
                onClick={() => { setNameInput(teamName); setEditingName(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          )}
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
            {members.length + 1} membre{members.length + 1 > 1 ? 's' : ''} · {pendingCount > 0 ? `${pendingCount} invitation${pendingCount > 1 ? 's' : ''} en attente` : 'Tous actifs'}
          </p>
        </div>
        <Badge variant="gradient">⚡ Pro</Badge>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Membres actifs',   value: activeCount + 1, icon: '👥' },
          { label: 'Scans total équipe', value: stats.totalScans, icon: '📡' },
          { label: 'Clics total équipe', value: stats.totalClicks, icon: '🔗' },
        ].map((kpi) => (
          <div key={kpi.label} style={{
            background: '#12141C', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 10, padding: '20px 24px',
          }}>
            <span style={{ fontSize: 24, display: 'block', marginBottom: 10 }}>{kpi.icon}</span>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 4 }}>
              {kpi.value}
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>

        {/* Members list */}
        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20 }}>
            Membres ({members.length + 1})
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

            {/* Owner row */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '12px 14px', borderRadius: 8,
              background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)',
            }}>
              <Avatar email={ownerEmail} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                  {ownerEmail}
                </p>
                <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                  Propriétaire
                </p>
              </div>
              <Badge variant="gradient">Propriétaire</Badge>
            </div>

            {/* Member rows */}
            {members.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 14px', borderRadius: 8,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'background 0.2s',
                }}
              >
                <Avatar name={m.displayName} email={m.email} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.displayName || m.email}
                  </p>
                  {m.displayName && (
                    <p style={{ color: '#6B7280', fontSize: 12 }}>{m.email}</p>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <Badge variant={m.role === 'admin' ? 'electric' : 'neutral'}>
                    {ROLE_LABELS[m.role]}
                  </Badge>
                  <Badge variant={m.status === 'active' ? 'success' : 'warning'} dot>
                    {m.status === 'active' ? 'Actif' : 'En attente'}
                  </Badge>
                  <button
                    onClick={() => removeMember(m.id)}
                    disabled={removing === m.id}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#EF4444', opacity: removing === m.id ? 0.4 : 0.6,
                      padding: 4, transition: 'opacity 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = removing === m.id ? '0.4' : '0.6'; }}
                    title="Retirer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {members.length === 0 && (
              <div style={{ textAlign: 'center', padding: '32px 0', color: '#6B7280', fontSize: 14 }}>
                Aucun membre pour l&apos;instant. Invitez votre équipe →
              </div>
            )}
          </div>
        </Card>

        {/* Invite panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20 }}>
              Inviter un membre
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="collaborateur@email.com"
                  value={inviteEmail}
                  onChange={(e) => { setInviteEmail(e.target.value); setInviteError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') invite(); }}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${inviteError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 6, padding: '10px 12px',
                    color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Rôle
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['member', 'admin'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setInviteRole(r)}
                      style={{
                        padding: '10px 0',
                        background: inviteRole === r ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${inviteRole === r ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`,
                        borderRadius: 6, cursor: 'pointer',
                        color: inviteRole === r ? '#818CF8' : '#6B7280',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                        transition: 'all 0.2s',
                      }}
                    >
                      {r === 'member' ? '👤 Membre' : '🛡️ Admin'}
                    </button>
                  ))}
                </div>
              </div>

              {inviteError && (
                <p style={{ color: '#EF4444', fontSize: 12, background: 'rgba(239,68,68,0.08)', padding: '8px 12px', borderRadius: 6 }}>
                  {inviteError}
                </p>
              )}
              {inviteSuccess && (
                <p style={{ color: '#10B981', fontSize: 12, background: 'rgba(16,185,129,0.08)', padding: '8px 12px', borderRadius: 6 }}>
                  ✓ {inviteSuccess}
                </p>
              )}

              <Button variant="gradient" size="md" loading={inviting} onClick={invite} style={{ width: '100%' }}>
                {inviting ? 'Invitation...' : 'Envoyer l\'invitation'}
              </Button>
            </div>
          </Card>

          {/* Role info */}
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>
              Rôles
            </p>
            {[
              { role: '👤 Membre', desc: 'Gère son propre profil et ses modules.' },
              { role: '🛡️ Admin',  desc: 'Accès à tous les profils de l\'équipe.' },
              { role: '👑 Propriétaire', desc: 'Gestion complète + facturation.' },
            ].map((r) => (
              <div key={r.role} style={{ marginBottom: 12 }}>
                <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{r.role}</p>
                <p style={{ color: '#6B7280', fontSize: 12 }}>{r.desc}</p>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
