'use client';

import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { AgentCardDoc } from '@/lib/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

/* ─── Types ──────────────────────────────────────────────────────────────── */
type Member = {
  id: string; email: string; displayName?: string;
  role: 'admin' | 'member'; status: 'pending' | 'active';
  invitedAt: string; joinedAt?: string;
  stats: { scans: number; clicks: number } | null;
};

type AgentEvent = { agentId: string; action: 'page_view' | 'app_client' | 'app_driver' | 'contact' };

interface Props {
  teamName:    string;
  members:     Member[];
  ownerStats:  { scans: number; clicks: number };
  totalStats:  { scans: number; clicks: number };
  ownerEmail:  string;
  isPro:       boolean;
  agents:      AgentCardDoc[];
  agentEvents: AgentEvent[];
  username:    string;
}

type Tab = 'members' | 'invites' | 'analytics';

/* ─── Shared helpers ─────────────────────────────────────────────────────── */
function Avatar({ name, email, size = 40 }: { name?: string; email: string; size?: number }) {
  const letter = (name || email).charAt(0).toUpperCase();
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: size * 0.375, color: '#fff', flexShrink: 0 }}>
      {letter}
    </div>
  );
}

function AgentAvatar({ name, photoUrl, size = 40, onClick }: { name: string; photoUrl?: string; size?: number; onClick?: () => void }) {
  const initials = name.split(' ').filter(w => /^[A-ZÀ-Ÿ]/u.test(w)).slice(0, 2).map(w => w[0]).join('') || '?';
  return (
    <div
      onClick={onClick}
      title={onClick ? 'Changer la photo' : undefined}
      style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0, position: 'relative', cursor: onClick ? 'pointer' : 'default', overflow: 'hidden' }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #4338CA, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.35, color: '#fff' }}>
          {initials}
        </div>
      )}
      {onClick && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0'; }}>
          <span style={{ fontSize: size * 0.35, color: '#fff' }}>📷</span>
        </div>
      )}
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

/* ─── QR Modal ───────────────────────────────────────────────────────────── */
function QrModal({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState('');
  useEffect(() => {
    QRCode.toDataURL(url, { color: { dark: '#1E1F2E', light: '#FFFFFF' }, width: 280, margin: 2 })
      .then(setDataUrl).catch(() => {});
  }, [url]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={onClose}>
      <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 16, padding: 32, maxWidth: 340, width: '100%', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>QR Code Agent</p>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--t-text)', marginBottom: 20 }}>{name}</p>
        {dataUrl
          ? <img src={dataUrl} alt="QR" style={{ width: 200, height: 200, borderRadius: 10, margin: '0 auto 20px', display: 'block' }} />
          : <div style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: 10, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>Génération...</span></div>
        }
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', wordBreak: 'break-all', marginBottom: 20 }}>{url}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {dataUrl && <a href={dataUrl} download={`qr-${name.split(' ').pop()?.toLowerCase()}.png`} style={{ flex: 1, padding: '10px 0', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, textDecoration: 'none', color: '#818CF8', fontFamily: 'Space Mono, monospace', fontSize: 9, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}>↓ PNG</a>}
          <button onClick={onClose} style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function TeamClient({ teamName: initialName, members: initialMembers, ownerStats, totalStats, ownerEmail, isPro, agents: initialAgents, agentEvents, username }: Props) {
  const [members,     setMembers]     = useState<Member[]>(initialMembers);
  const [agents,      setAgents]      = useState<AgentCardDoc[]>(initialAgents);
  const [teamName,    setTeamName]    = useState(initialName);
  const [editingName, setEditingName] = useState(false);
  const [nameInput,   setNameInput]   = useState(initialName);
  const [savingName,  setSavingName]  = useState(false);
  const [tab,         setTab]         = useState<Tab>('members');

  // Invite
  const [inviteEmail,   setInviteEmail]   = useState('');
  const [inviteRole,    setInviteRole]    = useState<'member' | 'admin'>('member');
  const [inviting,      setInviting]      = useState(false);
  const [inviteError,   setInviteError]   = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Add agent
  const [agentForm,    setAgentForm]    = useState({ fullName: '', function: '', mit: '', phone: '' });
  const [addingAgent,  setAddingAgent]  = useState(false);
  const [agentError,   setAgentError]   = useState('');
  const [agentSuccess, setAgentSuccess] = useState('');

  // Actions
  const [removing,     setRemoving]     = useState<string | null>(null);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [removingAgent,  setRemovingAgent]  = useState<string | null>(null);
  const [qrModal,        setQrModal]        = useState<{ mit: string; name: string } | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const photoInputRef  = useRef<HTMLInputElement>(null);
  const pendingMitRef  = useRef<string | null>(null);

  if (!isPro) {
    return (
      <div style={{ maxWidth: 560 }}>
        <div style={{ background: '#12141C', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>👥</span>
          <Badge variant="electric" className="mb-4">PRO requis</Badge>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', margin: '16px 0' }}>Mode Équipe</h2>
          <p style={{ color: '#9CA3AF', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>Gérez vos collaborateurs et agents depuis un dashboard centralisé.</p>
          <Button variant="gradient" size="lg" style={{ width: '100%' }}>Passer au plan Pro</Button>
        </div>
      </div>
    );
  }

  const activeMembers  = members.filter(m => m.status === 'active');
  const pendingMembers = members.filter(m => m.status === 'pending');
  const totalPeople    = activeMembers.length + 1 + agents.length;

  // Agent stats map
  const agentStats = (mit: string) => ({
    page_view:  agentEvents.filter(e => e.agentId === mit && e.action === 'page_view').length,
    app_client: agentEvents.filter(e => e.agentId === mit && e.action === 'app_client').length,
    app_driver: agentEvents.filter(e => e.agentId === mit && e.action === 'app_driver').length,
    contact:    agentEvents.filter(e => e.agentId === mit && e.action === 'contact').length,
  });

  const maxScans  = Math.max(ownerStats.scans,  ...members.map(m => m.stats?.scans  ?? 0), 1);
  const maxClicks = Math.max(ownerStats.clicks, ...members.map(m => m.stats?.clicks ?? 0), 1);
  const maxAgentScans = Math.max(...agents.map(a => agentStats(a.mit).page_view), 1);

  const inputStyle = { width: '100%', boxSizing: 'border-box' as const, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' };
  const labelStyle = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' as const, display: 'block', marginBottom: 6 };

  async function saveName() {
    if (!nameInput.trim()) return;
    setSavingName(true);
    await fetch('/api/team', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameInput }) });
    setTeamName(nameInput); setEditingName(false); setSavingName(false);
  }

  async function invite() {
    if (!inviteEmail.trim()) { setInviteError('Entrez un email.'); return; }
    setInviting(true); setInviteError(''); setInviteSuccess('');
    const res  = await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: inviteEmail, role: inviteRole }) });
    const data = await res.json() as { error?: string; member?: Member };
    if (!res.ok) { setInviteError(data.error ?? 'Erreur.'); } else {
      setMembers(p => [...p, { ...data.member!, stats: null }]);
      setInviteEmail('');
      setInviteSuccess(`Invitation envoyée à ${inviteEmail}`);
      setTimeout(() => setInviteSuccess(''), 4000);
    }
    setInviting(false);
  }

  async function addAgent() {
    if (!agentForm.fullName.trim() || !agentForm.mit.trim()) { setAgentError('Nom et MIT requis.'); return; }
    setAddingAgent(true); setAgentError(''); setAgentSuccess('');
    const res  = await fetch('/api/agency/agents', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(agentForm) });
    const data = await res.json() as { error?: string; agent?: AgentCardDoc };
    if (!res.ok) { setAgentError(data.error ?? 'Erreur.'); } else {
      setAgents(p => [...p, data.agent!].sort((a, b) => a.fullName.localeCompare(b.fullName)));
      setAgentForm({ fullName: '', function: '', mit: '', phone: '' });
      setAgentSuccess(`Agent ${data.agent!.fullName} ajouté.`);
      setTimeout(() => setAgentSuccess(''), 4000);
    }
    setAddingAgent(false);
  }

  async function removeMember(id: string) {
    setRemoving(id);
    await fetch(`/api/team?email=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setMembers(p => p.filter(m => m.id !== id));
    setRemoving(null);
  }

  async function removeAgent(mit: string) {
    setRemovingAgent(mit);
    await fetch(`/api/agency/agents?mit=${encodeURIComponent(mit)}`, { method: 'DELETE' });
    setAgents(p => p.filter(a => a.mit !== mit));
    setRemovingAgent(null);
  }

  function openPhotoUpload(mit: string) {
    pendingMitRef.current = mit;
    photoInputRef.current?.click();
  }

  async function handlePhotoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const mit  = pendingMitRef.current;
    if (!file || !mit) return;
    e.target.value = '';

    setUploadingPhoto(mit);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const uploadRes = await fetch('/api/upload?folder=agentPhotos', { method: 'POST', body: fd });
      const { url, error } = await uploadRes.json() as { url?: string; error?: string };
      if (error || !url) { setUploadingPhoto(null); return; }

      await fetch('/api/agency/agents', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mit, photoUrl: url }),
      });
      setAgents(p => p.map(a => a.mit === mit ? { ...a, photoUrl: url } : a));
    } finally {
      setUploadingPhoto(null);
      pendingMitRef.current = null;
    }
  }

  async function changeRole(id: string, role: 'admin' | 'member') {
    setChangingRole(id);
    await fetch('/api/team', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: id, role }) });
    setMembers(p => p.map(m => m.id === id ? { ...m, role } : m));
    setChangingRole(null);
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <input ref={photoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoFile} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          {editingName ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }} style={{ ...inputStyle, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, width: 'auto' }} autoFocus />
              <Button variant="gradient" size="sm" loading={savingName} onClick={saveName}>OK</Button>
              <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 13 }}>Annuler</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC' }}>{teamName}</h2>
              <button onClick={() => { setNameInput(teamName); setEditingName(true); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
            </div>
          )}
          <p style={{ color: '#6B7280', fontSize: 13, marginTop: 4 }}>
            {totalPeople} membre{totalPeople > 1 ? 's' : ''}
            {agents.length > 0 && ` · dont ${agents.length} agent${agents.length > 1 ? 's' : ''}`}
            {pendingMembers.length > 0 && ` · ${pendingMembers.length} invitation${pendingMembers.length > 1 ? 's' : ''} en attente`}
          </p>
        </div>
        <Badge variant="gradient">⚡ Pro</Badge>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        {[
          { label: 'Membres actifs',  value: activeMembers.length + 1, color: '#818CF8' },
          { label: 'Agents',          value: agents.length,             color: '#6366F1' },
          { label: 'Scans équipe',    value: totalStats.scans,          color: '#06B6D4' },
          { label: 'Scans agents',    value: agentEvents.filter(e => e.action === 'page_view').length, color: '#F59E0B' },
        ].map(k => (
          <div key={k.label} style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '18px 20px' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: k.color, marginBottom: 2 }}>{k.value}</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        {([
          { key: 'members',   label: 'Membres',     count: activeMembers.length + 1 + agents.length },
          { key: 'invites',   label: 'Ajouter',     count: pendingMembers.length },
          { key: 'analytics', label: 'Analytics',   count: null },
        ] as { key: Tab; label: string; count: number | null }[]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '10px 16px', borderBottom: `2px solid ${tab === t.key ? '#6366F1' : 'transparent'}`, color: tab === t.key ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span style={{ background: tab === t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)', color: tab === t.key ? '#818CF8' : '#9CA3AF', borderRadius: 10, padding: '1px 7px', fontSize: 9 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: MEMBRES ─────────────────────────────────────────────────────── */}
      {tab === 'members' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Collaborateurs ── */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>👥 Collaborateurs</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Owner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 8, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <Avatar email={ownerEmail} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ownerEmail}</p>
                  <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', marginTop: 2 }}>Propriétaire</p>
                </div>
                <Badge variant="gradient">Propriétaire</Badge>
              </div>

              {activeMembers.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Avatar name={m.displayName} email={m.email} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.displayName || m.email}</p>
                    {m.displayName && <p style={{ color: '#6B7280', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</p>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {(['member', 'admin'] as const).map(r => (
                        <button key={r} disabled={changingRole === m.id} onClick={() => { if (m.role !== r) changeRole(m.id, r); }}
                          style={{ padding: '5px 10px', background: m.role === r ? (r === 'admin' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)') : 'transparent', border: 'none', cursor: m.role === r ? 'default' : 'pointer', color: m.role === r ? (r === 'admin' ? '#818CF8' : '#F8F9FC') : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1 }}>
                          {r === 'member' ? 'Membre' : 'Admin'}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => removeMember(m.id)} disabled={removing === m.id} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', opacity: removing === m.id ? 0.3 : 0.5, padding: 6, borderRadius: 6 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </div>
              ))}

              {activeMembers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.07)' }}>
                  <p style={{ color: '#6B7280', fontSize: 13 }}>Aucun collaborateur. <button onClick={() => setTab('invites')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818CF8', fontSize: 13, textDecoration: 'underline' }}>Inviter →</button></p>
                </div>
              )}
            </div>
          </div>

          {/* ── Agents ── */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>🏢 Agents</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {agents.map(agent => {
                const stats = agentStats(agent.mit);
                const total = stats.page_view + stats.app_client + stats.app_driver + stats.contact;
                const isUploading = uploadingPhoto === agent.mit;
                return (
                  <div key={agent.mit} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', opacity: isUploading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
                    <AgentAvatar name={agent.fullName} photoUrl={agent.photoUrl} onClick={() => !isUploading && openPhotoUpload(agent.mit)} />
                    <div style={{ flex: '1 1 160px', minWidth: 0 }}>
                      <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.fullName}</p>
                      <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 1 }}>{agent.function}</p>
                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', marginTop: 2, letterSpacing: 1 }}>MIT: {agent.mit}</p>
                    </div>
                    {/* Mini stats */}
                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      {[
                        { v: stats.page_view,  label: 'Scans',    color: '#818CF8' },
                        { v: stats.app_client, label: 'Client',   color: '#6366F1' },
                        { v: stats.app_driver, label: 'Chauff.',  color: '#F59E0B' },
                      ].map(s => (
                        <div key={s.label} style={{ textAlign: 'center', padding: '6px 8px', background: `${s.color}10`, border: `1px solid ${s.color}25`, borderRadius: 6, minWidth: 42 }}>
                          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: s.color }}>{s.v}</p>
                          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                      {/* Total badge */}
                      <div style={{ textAlign: 'center', padding: '6px 10px', background: total > 0 ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${total > 0 ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6 }}>
                        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: total > 0 ? '#818CF8' : '#374151' }}>{total}</p>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase' }}>Total</p>
                      </div>
                      {/* QR */}
                      <button onClick={() => setQrModal({ mit: agent.mit, name: agent.fullName })}
                        style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 7, color: '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}>
                        ⬛ QR
                      </button>
                      {/* Remove */}
                      <button onClick={() => removeAgent(agent.mit)} disabled={removingAgent === agent.mit}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', opacity: removingAgent === agent.mit ? 0.3 : 0.5, padding: 6, borderRadius: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
              {agents.length === 0 && (
                <div style={{ textAlign: 'center', padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.07)' }}>
                  <p style={{ color: '#6B7280', fontSize: 13 }}>Aucun agent. <button onClick={() => setTab('invites')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818CF8', fontSize: 13, textDecoration: 'underline' }}>Ajouter un agent →</button></p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: AJOUTER ─────────────────────────────────────────────────────── */}
      {tab === 'invites' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Invite collaborateur */}
          <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 }}>
            <p style={{ ...labelStyle, marginBottom: 4 }}>👥 Inviter un collaborateur</p>
            <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 18 }}>Il recevra un email pour rejoindre l'espace équipe.</p>

            {pendingMembers.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ ...labelStyle, marginBottom: 8 }}>En attente ({pendingMembers.length})</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  {pendingMembers.map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.12)' }}>
                      <Avatar email={m.email} size={32} />
                      <p style={{ flex: 1, color: '#F8F9FC', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.email}</p>
                      <Badge variant="warning" dot>En attente</Badge>
                      <button onClick={() => removeMember(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', opacity: 0.6, padding: 4 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={labelStyle}>Email</label><input type="email" placeholder="collaborateur@email.com" value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setInviteError(''); }} onKeyDown={e => { if (e.key === 'Enter') invite(); }} style={inputStyle} /></div>
              <div>
                <label style={labelStyle}>Rôle</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {([{ value: 'member', label: '👤 Membre', desc: 'Gère son propre profil' }, { value: 'admin', label: '🛡️ Admin', desc: 'Accès à tous les profils' }] as const).map(r => (
                    <button key={r.value} onClick={() => setInviteRole(r.value)} style={{ padding: '10px 14px', textAlign: 'left', background: inviteRole === r.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', border: `1px solid ${inviteRole === r.value ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, cursor: 'pointer' }}>
                      <p style={{ color: inviteRole === r.value ? '#818CF8' : '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500, margin: 0 }}>{r.label}</p>
                      <p style={{ color: '#6B7280', fontFamily: 'DM Sans, sans-serif', fontSize: 11, margin: '3px 0 0' }}>{r.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
              {inviteError   && <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6 }}>{inviteError}</p>}
              {inviteSuccess && <p style={{ color: '#10B981', fontSize: 13, background: 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: 6 }}>✓ {inviteSuccess}</p>}
              <Button variant="gradient" size="md" loading={inviting} onClick={invite} style={{ width: '100%' }}>Envoyer l&apos;invitation</Button>
            </div>
          </div>

          {/* Add agent */}
          <div style={{ background: '#12141C', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: 24 }}>
            <p style={{ ...labelStyle, marginBottom: 4 }}>🏢 Ajouter un agent</p>
            <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 18 }}>L'agent reçoit un QR code unique pour partager les liens de l'agence.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>Nom complet *</label><input value={agentForm.fullName} onChange={e => setAgentForm(p => ({ ...p, fullName: e.target.value }))} placeholder="Mme Dupont Marie" style={inputStyle} /></div>
                <div><label style={labelStyle}>Fonction</label><input value={agentForm.function} onChange={e => setAgentForm(p => ({ ...p, function: e.target.value }))} placeholder="Stagiaire — Agent de réservation" style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={labelStyle}>N° MIT *</label><input value={agentForm.mit} onChange={e => setAgentForm(p => ({ ...p, mit: e.target.value }))} placeholder="02657IT324940" style={inputStyle} /></div>
                <div><label style={labelStyle}>Téléphone</label><input value={agentForm.phone} onChange={e => setAgentForm(p => ({ ...p, phone: e.target.value }))} placeholder="+229 01 00 00 00 00" style={inputStyle} /></div>
              </div>
              {agentError   && <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6 }}>{agentError}</p>}
              {agentSuccess && <p style={{ color: '#10B981', fontSize: 13, background: 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: 6 }}>✓ {agentSuccess}</p>}
              <Button variant="gradient" size="md" loading={addingAgent} onClick={addAgent} style={{ width: '100%', background: 'linear-gradient(135deg, #4338CA, #6366F1)' }}>
                Ajouter l&apos;agent
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: ANALYTICS ───────────────────────────────────────────────────── */}
      {tab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Collaborateurs analytics */}
          <div>
            <p style={{ ...labelStyle, marginBottom: 10 }}>👥 Collaborateurs — Scans & Clics</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', padding: '8px 16px', gap: 12 }}>
                <span style={{ ...labelStyle, margin: 0 }}>Membre</span>
                <span style={{ ...labelStyle, margin: 0 }}>Scans</span>
                <span style={{ ...labelStyle, margin: 0 }}>Clics</span>
              </div>
              {/* Owner */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', padding: '14px 16px', gap: 12, borderRadius: 8, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar email={ownerEmail} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ownerEmail}</p>
                    <p style={{ color: '#6366F1', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>Propriétaire</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{ownerStats.scans}</span><StatBar value={ownerStats.scans} max={maxScans} /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{ownerStats.clicks}</span><StatBar value={ownerStats.clicks} max={maxClicks} /></div>
              </div>
              {members.map(m => (
                <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', padding: '14px 16px', gap: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Avatar name={m.displayName} email={m.email} size={32} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.displayName || m.email}</p>
                      <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>{m.role === 'admin' ? 'Admin' : 'Membre'}{m.status === 'pending' && ' · En attente'}</p>
                    </div>
                  </div>
                  <div>{m.stats ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{m.stats.scans}</span><StatBar value={m.stats.scans} max={maxScans} /></div> : <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>}</div>
                  <div>{m.stats ? <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700, minWidth: 32 }}>{m.stats.clicks}</span><StatBar value={m.stats.clicks} max={maxClicks} /></div> : <span style={{ color: '#4B5563', fontSize: 12 }}>—</span>}</div>
                </div>
              ))}
              {/* Total row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 140px', padding: '14px 16px', gap: 12, borderRadius: 8, background: 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.12)', marginTop: 4 }}>
                <p style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>TOTAL</p>
                <p style={{ color: '#06B6D4', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>{totalStats.scans}</p>
                <p style={{ color: '#06B6D4', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18 }}>{totalStats.clicks}</p>
              </div>
            </div>
          </div>

          {/* Agents analytics */}
          {agents.length > 0 && (
            <div>
              <p style={{ ...labelStyle, marginBottom: 10 }}>🏢 Agents — Performance terrain</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px', padding: '8px 16px', gap: 8 }}>
                  <span style={{ ...labelStyle, margin: 0 }}>Agent</span>
                  <span style={{ ...labelStyle, margin: 0 }}>Scans</span>
                  <span style={{ ...labelStyle, margin: 0 }}>Client</span>
                  <span style={{ ...labelStyle, margin: 0 }}>Chauff.</span>
                  <span style={{ ...labelStyle, margin: 0 }}>Contact</span>
                </div>
                {[...agents].sort((a, b) => {
                  const sa = agentStats(a.mit); const sb = agentStats(b.mit);
                  return (sb.page_view + sb.app_client + sb.app_driver) - (sa.page_view + sa.app_client + sa.app_driver);
                }).map(agent => {
                  const s = agentStats(agent.mit);
                  return (
                    <div key={agent.mit} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px 80px', padding: '12px 16px', gap: 8, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <AgentAvatar name={agent.fullName} photoUrl={agent.photoUrl} size={32} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.fullName}</p>
                          <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>{agent.mit}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3 }}>
                        <span style={{ color: '#818CF8', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15 }}>{s.page_view}</span>
                        <StatBar value={s.page_view} max={maxAgentScans} />
                      </div>
                      <span style={{ color: '#6366F1', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>{s.app_client}</span>
                      <span style={{ color: '#F59E0B', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>{s.app_driver}</span>
                      <span style={{ color: '#10B981', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>{s.contact}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QR Modal */}
      {qrModal && username && (
        <QrModal
          url={`${APP_URL}/m/${username}/agency?agent=${qrModal.mit}`}
          name={qrModal.name}
          onClose={() => setQrModal(null)}
        />
      )}
    </div>
  );
}
