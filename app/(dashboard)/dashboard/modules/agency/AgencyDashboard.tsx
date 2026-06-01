'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QRCode from 'qrcode';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { AgentCardDoc, AgentEventDoc } from '@/lib/types';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface AgentStats {
  page_view: number; app_client: number; app_driver: number; contact: number;
}
type AgentWithStats = AgentCardDoc & { stats: AgentStats };

interface Config {
  agencyName:   string;
  appClientUrl: string;
  appDriverUrl: string;
  contactPhone: string;
  contactLabel: string;
}

/* ─── QR modal ───────────────────────────────────────────────────────────── */
function QrModal({ url, agentName, onClose }: { url: string; agentName: string; onClose: () => void }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(url, {
      color: { dark: '#1E1F2E', light: '#FFFFFF' },
      width: 280, margin: 2, errorCorrectionLevel: 'M',
    }).then(setDataUrl).catch(() => {});
  }, [url]);

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}
    >
      <div
        style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 16, padding: 32, maxWidth: 360, width: '100%', textAlign: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 12 }}>QR Code Agent</p>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--t-text)', marginBottom: 20 }}>{agentName}</p>
        {dataUrl ? (
          <img src={dataUrl} alt="QR" style={{ width: 200, height: 200, borderRadius: 10, margin: '0 auto 20px', display: 'block' }} />
        ) : (
          <div style={{ width: 200, height: 200, background: 'rgba(255,255,255,0.04)', borderRadius: 10, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>Génération...</span>
          </div>
        )}
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', wordBreak: 'break-all', marginBottom: 20 }}>{url}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {dataUrl && (
            <a
              href={dataUrl}
              download={`qr-agent-${agentName.split(' ').pop()?.toLowerCase()}.png`}
              style={{ flex: 1, padding: '10px 0', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, textDecoration: 'none', color: '#818CF8', fontFamily: 'Space Mono, monospace', fontSize: 10, textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase' }}
            >
              ↓ Télécharger
            </a>
          )}
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase' }}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat pill ──────────────────────────────────────────────────────────── */
function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '8px 10px', background: `${color}10`, border: `1px solid ${color}30`, borderRadius: 7 }}>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color }}>{value}</p>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{label}</p>
    </div>
  );
}

/* ─── Agent card ─────────────────────────────────────────────────────────── */
function AgentRow({
  agent, username, onQr,
}: { agent: AgentWithStats; username: string; onQr: (mit: string, name: string) => void }) {
  const initials = agent.fullName
    .split(' ').filter(w => /^[A-ZÀ-Ÿ]/u.test(w)).slice(0, 2).map(w => w[0]).join('');
  const total = agent.stats.page_view + agent.stats.app_client + agent.stats.app_driver + agent.stats.contact;

  return (
    <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 10, padding: 18, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      {/* Avatar */}
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #4338CA, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#fff', flexShrink: 0 }}>
        {initials || '?'}
      </div>

      {/* Info */}
      <div style={{ flex: '1 1 180px', minWidth: 0 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--t-text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {agent.fullName}
        </p>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 12, marginBottom: 2 }}>{agent.function}</p>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 1 }}>MIT: {agent.mit}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <Pill label="Scans"    value={agent.stats.page_view}  color="#818CF8" />
        <Pill label="Client"   value={agent.stats.app_client}  color="#6366F1" />
        <Pill label="Chauff."  value={agent.stats.app_driver}  color="#F59E0B" />
        <Pill label="Contact"  value={agent.stats.contact}     color="#10B981" />
      </div>

      {/* Total badge */}
      <div style={{ textAlign: 'center', padding: '8px 14px', background: total > 0 ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${total > 0 ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, flexShrink: 0 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: total > 0 ? '#818CF8' : '#374151' }}>{total}</p>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase' }}>Total</p>
      </div>

      {/* QR button */}
      <button
        onClick={() => onQr(agent.mit, agent.fullName)}
        style={{ padding: '9px 18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--t-text-muted)', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0 }}
      >
        ⬛ QR
      </button>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function AgencyDashboard({
  initialConfig,
  initialAgents,
  initialEvents,
  username,
}: {
  initialConfig: Config;
  initialAgents: AgentCardDoc[];
  initialEvents: Pick<AgentEventDoc, 'agentId' | 'action'>[];
  username: string;
}) {
  const router  = useRouter();
  const [tab,   setTab]   = useState<'stats' | 'config'>('stats');
  const [config, setConfig] = useState<Config>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const [qrModal, setQrModal] = useState<{ mit: string; name: string } | null>(null);

  // Build per-agent stats from events
  const agentsWithStats: AgentWithStats[] = initialAgents.map(agent => {
    const evts = initialEvents.filter(e => e.agentId === agent.mit);
    return {
      ...agent,
      stats: {
        page_view:  evts.filter(e => e.action === 'page_view').length,
        app_client: evts.filter(e => e.action === 'app_client').length,
        app_driver: evts.filter(e => e.action === 'app_driver').length,
        contact:    evts.filter(e => e.action === 'contact').length,
      },
    };
  }).sort((a, b) => {
    const ta = a.stats.page_view + a.stats.app_client + a.stats.app_driver;
    const tb = b.stats.page_view + b.stats.app_client + b.stats.app_driver;
    return tb - ta;
  });

  const totalScans  = agentsWithStats.reduce((s, a) => s + a.stats.page_view, 0);
  const totalClient = agentsWithStats.reduce((s, a) => s + a.stats.app_client, 0);
  const totalDriver = agentsWithStats.reduce((s, a) => s + a.stats.app_driver, 0);

  async function saveConfig() {
    setSaving(true);
    await fetch('/api/modules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'agency', config }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  }

  return (
    <div style={{ maxWidth: 960 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t-text)', marginBottom: 2 }}>
            🏢 {config.agencyName || 'Module Agence'}
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 13 }}>
            {initialAgents.length} agent{initialAgents.length > 1 ? 's' : ''} · {totalScans} scans total
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['stats', 'config'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{ padding: '8px 18px', borderRadius: 8, cursor: 'pointer', border: `1px solid ${tab === t ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, background: tab === t ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)', color: tab === t ? '#818CF8' : '#6B7280', fontFamily: 'DM Sans, sans-serif', fontWeight: tab === t ? 700 : 400, fontSize: 13 }}
            >
              {t === 'stats' ? '📊 Agents & Stats' : '⚙️ Configuration'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats tab ── */}
      {tab === 'stats' && (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
            {[
              { label: 'Scans QR totaux',    value: totalScans,  color: '#818CF8' },
              { label: 'App Client',          value: totalClient, color: '#6366F1' },
              { label: 'App Chauffeur',       value: totalDriver, color: '#F59E0B' },
              { label: 'Agents actifs',       value: initialAgents.filter(a => a.isActive).length, color: '#10B981' },
            ].map(k => (
              <div key={k.label} style={{ padding: '16px 18px', background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 10, textAlign: 'center' }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: k.color }}>{k.value}</p>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>{k.label}</p>
              </div>
            ))}
          </div>

          {/* Agents list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agentsWithStats.map(agent => (
              <AgentRow
                key={agent.id}
                agent={agent}
                username={username}
                onQr={(mit, name) => setQrModal({ mit, name })}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Config tab ── */}
      {tab === 'config' && (
        <div style={{ maxWidth: 520 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--t-text)', marginBottom: 20 }}>Paramètres du module</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Input
                label="Nom de l'agence"
                value={config.agencyName}
                onChange={e => setConfig(p => ({ ...p, agencyName: e.target.value }))}
                placeholder="Inas Travel"
              />
              <Input
                label="Lien App Client (Play Store / App Store)"
                value={config.appClientUrl}
                onChange={e => setConfig(p => ({ ...p, appClientUrl: e.target.value }))}
                placeholder="https://play.google.com/store/..."
                hint="URL de téléchargement de l'app client"
              />
              <Input
                label="Lien App Chauffeur"
                value={config.appDriverUrl}
                onChange={e => setConfig(p => ({ ...p, appDriverUrl: e.target.value }))}
                placeholder="https://play.google.com/store/..."
                hint="URL de téléchargement de l'app chauffeur"
              />
              <Input
                label="Téléphone contact direct"
                value={config.contactPhone}
                onChange={e => setConfig(p => ({ ...p, contactPhone: e.target.value }))}
                placeholder="+229 01 00 00 00 00"
                hint="Numéro composé quand le client appuie sur le bouton contact"
              />
              <Input
                label="Libellé du bouton contact"
                value={config.contactLabel}
                onChange={e => setConfig(p => ({ ...p, contactLabel: e.target.value }))}
                placeholder="Allo Inas"
              />
            </div>
          </Card>
          <div style={{ marginTop: 16 }}>
            <Button variant="gradient" size="lg" loading={saving} onClick={saveConfig} style={{ width: '100%' }}>
              {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
            </Button>
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 8 }}>Page publique</p>
            <a
              href={`/m/${username}/agency`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#818CF8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}
            >
              {APP_URL}/m/{username}/agency ↗
            </a>
          </div>
        </div>
      )}

      {/* QR modal */}
      {qrModal && (
        <QrModal
          url={`${APP_URL}/m/${username}/agency?agent=${qrModal.mit}`}
          agentName={qrModal.name}
          onClose={() => setQrModal(null)}
        />
      )}
    </div>
  );
}
