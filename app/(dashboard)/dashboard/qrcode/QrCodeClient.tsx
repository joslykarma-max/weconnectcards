'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import type { QrCodeDoc, QrType, QrScanDoc } from '@/lib/types';

// ── Constants ─────────────────────────────────────────────────────────────────
const FREE_LIMIT = 5;

const QR_TYPES: { key: QrType; label: string; icon: string; desc: string }[] = [
  { key: 'url',     label: 'URL',       icon: '🔗', desc: 'Lien web'        },
  { key: 'text',    label: 'Texte',     icon: '📝', desc: 'Texte libre'     },
  { key: 'wifi',    label: 'WiFi',      icon: '📶', desc: 'Réseau WiFi'     },
  { key: 'contact', label: 'Contact',   icon: '👤', desc: 'Carte vCard'     },
  { key: 'email',   label: 'Email',     icon: '✉️',  desc: 'Email prérempli' },
  { key: 'phone',   label: 'Téléphone', icon: '📞', desc: 'Numéro de tel'   },
];

const SIZES   = [{ label: 'S', value: 200 }, { label: 'M', value: 320 }, { label: 'L', value: 512 }];
const EC_LVLS = [{ label: 'L', desc: '7%' }, { label: 'M', desc: '15%' }, { label: 'Q', desc: '25%' }, { label: 'H', desc: '30%' }];

const PRESETS = [
  { label: 'Classique', fg: '#000000', bg: '#FFFFFF' },
  { label: 'Nuit',      fg: '#0D0E14', bg: '#FFFFFF' },
  { label: 'Indigo',    fg: '#4338CA', bg: '#EEF2FF' },
  { label: 'Cyan',      fg: '#0E7490', bg: '#ECFEFF' },
  { label: 'Vert',      fg: '#065F46', bg: '#ECFDF5' },
];

type Tab = 'create' | 'list' | 'plans';

type QrStats = {
  scanCount:     number;
  lastScannedAt?: string;
  recentScans:   QrScanDoc[];
  dailyScans:    { date: string; count: number }[];
  devices:       { mobile: number; desktop: number; unknown: number };
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildData(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case 'url':     return fields.url?.trim() || 'https://weconnect.cards';
    case 'text':    return fields.text?.trim() || '';
    case 'wifi':    return `WIFI:T:${fields.security || 'WPA'};S:${fields.ssid || ''};P:${fields.password || ''};;`;
    case 'contact': {
      const lines = ['BEGIN:VCARD','VERSION:3.0',`N:${fields.lastName||''};${fields.firstName||''}`,`FN:${[fields.firstName,fields.lastName].filter(Boolean).join(' ')}`];
      if (fields.phone)   lines.push(`TEL:${fields.phone}`);
      if (fields.email)   lines.push(`EMAIL:${fields.email}`);
      if (fields.company) lines.push(`ORG:${fields.company}`);
      if (fields.website) lines.push(`URL:${fields.website}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    case 'email': return `mailto:${fields.to||''}${fields.subject?`?subject=${encodeURIComponent(fields.subject)}`:''}${fields.body?`${fields.subject?'&':'?'}body=${encodeURIComponent(fields.body)}`:''}`;
    case 'phone': return `tel:${fields.phone||''}`;
    default:      return '';
  }
}

function getLabel(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case 'url':     return fields.url?.replace(/^https?:\/\//, '').split('/')[0] || 'URL';
    case 'text':    return (fields.text || 'Texte').slice(0, 30);
    case 'wifi':    return fields.ssid || 'WiFi';
    case 'contact': return [fields.firstName, fields.lastName].filter(Boolean).join(' ') || 'Contact';
    case 'email':   return fields.to || 'Email';
    case 'phone':   return fields.phone || 'Téléphone';
  }
}

function relativeDate(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60)  return `il y a ${m}min`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `il y a ${h}h`;
  const d = Math.floor(h / 24);
  return `il y a ${d}j`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function MiniBar({ count, max }: { count: number; max: number }) {
  const h = max > 0 ? Math.max(4, Math.round((count / max) * 48)) : 4;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: count > 0 ? '#818CF8' : '#374151' }}>{count || ''}</span>
      <div style={{ width: '100%', height: 48, display: 'flex', alignItems: 'flex-end' }}>
        <div style={{ width: '100%', height: h, borderRadius: '2px 2px 0 0', background: count > 0 ? 'linear-gradient(180deg, #6366F1, #06B6D4)' : 'rgba(255,255,255,0.06)' }} />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function QrCodeClient({ initialCodes, isPro }: { initialCodes: QrCodeDoc[]; isPro: boolean }) {
  const router = useRouter();

  // ── Tab + list state ──
  const [tab,    setTab]    = useState<Tab>('create');
  const [codes,  setCodes]  = useState<QrCodeDoc[]>(initialCodes);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stats,  setStats]      = useState<QrStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [editUrl, setEditUrl]   = useState('');
  const [savingUrl, setSavingUrl] = useState(false);
  const [editUrlOpen, setEditUrlOpen] = useState(false);

  const selectedCode = codes.find((c) => c.id === selectedId) ?? null;

  // ── Generator state ──
  const [type,    setType]    = useState<QrType>('url');
  const [fields,  setFields]  = useState<Record<string, string>>({ url: '', text: '', ssid: '', password: '', security: 'WPA', firstName: '', lastName: '', phone: '', email: '', company: '', website: '', to: '', subject: '', body: '' });
  const [fgColor, setFgColor] = useState('#0D0E14');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size,    setSize]    = useState(320);
  const [ecLevel, setEcLevel] = useState<'L'|'M'|'Q'|'H'>('M');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [copied,  setCopied]  = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Live preview generation ──
  const generate = useCallback(async () => {
    const data = buildData(type, fields);
    if (!data) { setQrDataUrl(''); return; }
    setGenerating(true);
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(data, {
        color: { dark: fgColor, light: bgColor },
        width: size, margin: 2, errorCorrectionLevel: ecLevel,
      });
      setQrDataUrl(url);
    } catch { /* ignore */ }
    setGenerating(false);
  }, [type, fields, fgColor, bgColor, size, ecLevel]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void generate(); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  function setField(k: string, v: string) { setFields((p) => ({ ...p, [k]: v })); }

  // ── Save to Firestore ──
  async function saveCode() {
    const data = buildData(type, fields);
    if (!data) return;
    setSaving(true);
    setSaveMsg('');
    const res  = await fetch('/api/qr', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, fields, fgColor, bgColor, size, ecLevel, label: getLabel(type, fields) }),
    });
    const json = await res.json() as { error?: string; code?: QrCodeDoc };
    if (!res.ok) {
      setSaveMsg(json.error ?? 'Erreur lors de la sauvegarde.');
    } else if (json.code) {
      setCodes((prev) => [json.code!, ...prev]);
      setSaveMsg('✓ QR code sauvegardé');
      setTimeout(() => setSaveMsg(''), 3000);
      router.refresh(); // bust router cache so navigating back shows updated list
    }
    setSaving(false);
  }

  // ── Delete ──
  async function deleteCode(id: string) {
    await fetch(`/api/qr?id=${id}`, { method: 'DELETE' });
    setCodes((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
    router.refresh();
  }

  // ── Load stats for selected code ──
  async function selectCode(code: QrCodeDoc) {
    setSelectedId(code.id);
    if (!isPro) return;
    setStats(null);
    setStatsLoading(true);
    try {
      const res  = await fetch(`/api/qr/stats?id=${code.id}`);
      const data = await res.json() as QrStats;
      setStats(data);
    } catch { /* ignore */ }
    setStatsLoading(false);
  }

  // ── Update target URL (Pro dynamic codes) ──
  async function updateTargetUrl(id: string) {
    if (!editUrl.trim()) return;
    setSavingUrl(true);
    await fetch('/api/qr', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id, targetUrl: editUrl }),
    });
    setCodes((prev) => prev.map((c) => c.id === id ? { ...c, targetUrl: editUrl } : c));
    setSavingUrl(false);
    setEditUrlOpen(false);
  }

  // ── Download ──
  async function downloadPng(code: QrCodeDoc) {
    const QRCode = (await import('qrcode')).default;
    const url = await QRCode.toDataURL(code.data, {
      color: { dark: code.fgColor, light: code.bgColor },
      width: Math.max(code.size, 512), margin: 2, errorCorrectionLevel: code.ecLevel,
    });
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${code.label.replace(/\s+/g, '-')}.png`;
    a.click();
  }

  async function downloadCurrentPng() {
    if (!qrDataUrl) return;
    const QRCode = (await import('qrcode')).default;
    const url = await QRCode.toDataURL(buildData(type, fields), {
      color: { dark: fgColor, light: bgColor },
      width: Math.max(size, 512), margin: 2, errorCorrectionLevel: ecLevel,
    });
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${getLabel(type, fields).replace(/\s+/g, '-')}.png`;
    a.click();
  }

  async function downloadCurrentSvg() {
    const QRCode = (await import('qrcode')).default;
    const svg = await QRCode.toString(buildData(type, fields), {
      type: 'svg', color: { dark: fgColor, light: bgColor }, width: 512, margin: 2, errorCorrectionLevel: ecLevel,
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `qrcode-${getLabel(type, fields).replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyCurrentPng() {
    if (!qrDataUrl) return;
    try {
      const res  = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  }

  // ── Shared styles ──
  const lbl: React.CSSProperties       = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 };
  const inputCss: React.CSSProperties  = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const sHead: React.CSSProperties     = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', margin: 0 };

  const usageCount = codes.length;
  const atLimit    = !isPro && usageCount >= FREE_LIMIT;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button className="module-back-btn" onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, lineHeight: 1, display: 'flex', alignItems: 'center', flexShrink: 0 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>⬛ QR Codes</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Créez, sauvegardez et suivez vos QR codes</p>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 28 }}>
        {([
          { key: 'create', label: 'Créer',        count: null },
          { key: 'list',   label: 'Mes QR Codes', count: usageCount },
          { key: 'plans',  label: 'Plans',         count: null },
        ] as { key: Tab; label: string; count: number | null }[]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 18px',
              borderBottom: `2px solid ${tab === t.key ? '#6366F1' : 'transparent'}`,
              color: tab === t.key ? '#818CF8' : '#6B7280',
              fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1.5,
              textTransform: 'uppercase', transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            {t.label}
            {t.count !== null && t.count > 0 && (
              <span style={{
                background: tab === t.key ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.07)',
                color: tab === t.key ? '#818CF8' : '#9CA3AF',
                borderRadius: 10, padding: '1px 7px', fontSize: 9,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════ TAB: CRÉER ══════════════ */}
      {tab === 'create' && (
        <div className="module-3col" style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Left: form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Plan limit warning */}
            {atLimit && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>🔒</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: '#FCA5A5', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Limite atteinte ({FREE_LIMIT}/{FREE_LIMIT} codes)</p>
                  <p style={{ color: '#9CA3AF', fontSize: 12 }}>Passez à Pro pour créer des codes illimités.</p>
                </div>
                <button onClick={() => setTab('plans')} style={{ padding: '7px 14px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
                  Voir Pro →
                </button>
              </div>
            )}

            {/* Free plan counter */}
            {!isPro && !atLimit && (
              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${(usageCount / FREE_LIMIT) * 100}%`, height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #6366F1, #06B6D4)', transition: 'width 0.3s' }} />
                  </div>
                </div>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', whiteSpace: 'nowrap' }}>{usageCount}/{FREE_LIMIT} codes</span>
              </div>
            )}
            {isPro && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Badge variant="gradient">⚡ Pro</Badge>
                <span style={{ color: '#6B7280', fontSize: 12 }}>QR codes illimités · suivi des scans actif</span>
              </div>
            )}

            {/* Type selector */}
            <Card padding="md">
              <h3 style={{ ...sHead, marginBottom: 14 }}>Type de contenu</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {QR_TYPES.map((t) => (
                  <button key={t.key} onClick={() => setType(t.key)}
                    style={{ padding: '10px 8px', borderRadius: 8, border: `1px solid ${type === t.key ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`, background: type === t.key ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', textAlign: 'center' }}>
                    <span style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>{t.icon}</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: type === t.key ? '#818CF8' : '#6B7280', textTransform: 'uppercase' }}>{t.label}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Content fields */}
            <Card padding="md">
              <h3 style={{ ...sHead, marginBottom: 16 }}>{QR_TYPES.find((t) => t.key === type)?.icon} {QR_TYPES.find((t) => t.key === type)?.desc}</h3>

              {type === 'url' && (
                <div>
                  <p style={lbl}>URL</p>
                  <input style={inputCss} placeholder="https://monsite.com" value={fields.url} onChange={(e) => setField('url', e.target.value)} />
                  {isPro && fields.url && <p style={{ color: '#818CF8', fontSize: 11, marginTop: 6, fontFamily: 'DM Sans, sans-serif' }}>⚡ QR dynamique — redirection trackée via weconnect.cards/qr/…</p>}
                </div>
              )}
              {type === 'text' && (
                <div>
                  <p style={lbl}>Texte</p>
                  <textarea value={fields.text} onChange={(e) => setField('text', e.target.value)} rows={4} placeholder="Entrez votre texte ici…" style={{ ...inputCss, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              )}
              {type === 'wifi' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><p style={lbl}>Nom du réseau (SSID)</p><input style={inputCss} placeholder="MonWiFi" value={fields.ssid} onChange={(e) => setField('ssid', e.target.value)} /></div>
                  <div><p style={lbl}>Mot de passe</p><input style={inputCss} type="password" placeholder="••••••••" value={fields.password} onChange={(e) => setField('password', e.target.value)} /></div>
                  <div>
                    <p style={lbl}>Sécurité</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {['WPA', 'WEP', 'nopass'].map((s) => (
                        <button key={s} onClick={() => setField('security', s)}
                          style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${fields.security === s ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: fields.security === s ? 'rgba(99,102,241,0.15)' : 'transparent', color: fields.security === s ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer', letterSpacing: 1 }}>
                          {s === 'nopass' ? 'Aucune' : s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {type === 'contact' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div><p style={lbl}>Prénom</p><input style={inputCss} placeholder="Kofi" value={fields.firstName} onChange={(e) => setField('firstName', e.target.value)} /></div>
                    <div><p style={lbl}>Nom</p><input style={inputCss} placeholder="Mensah" value={fields.lastName} onChange={(e) => setField('lastName', e.target.value)} /></div>
                  </div>
                  <div><p style={lbl}>Téléphone</p><input style={inputCss} placeholder="+229 97 00 00 00" value={fields.phone} onChange={(e) => setField('phone', e.target.value)} /></div>
                  <div><p style={lbl}>Email</p><input style={inputCss} placeholder="kofi@exemple.com" value={fields.email} onChange={(e) => setField('email', e.target.value)} /></div>
                  <div><p style={lbl}>Société (optionnel)</p><input style={inputCss} placeholder="Ma Société" value={fields.company} onChange={(e) => setField('company', e.target.value)} /></div>
                  <div><p style={lbl}>Site web (optionnel)</p><input style={inputCss} placeholder="https://" value={fields.website} onChange={(e) => setField('website', e.target.value)} /></div>
                </div>
              )}
              {type === 'email' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div><p style={lbl}>Destinataire</p><input style={inputCss} placeholder="contact@exemple.com" value={fields.to} onChange={(e) => setField('to', e.target.value)} /></div>
                  <div><p style={lbl}>Sujet (optionnel)</p><input style={inputCss} placeholder="Objet de l'email" value={fields.subject} onChange={(e) => setField('subject', e.target.value)} /></div>
                  <div><p style={lbl}>Message (optionnel)</p><textarea value={fields.body} onChange={(e) => setField('body', e.target.value)} rows={3} placeholder="Bonjour, …" style={{ ...inputCss, resize: 'vertical', lineHeight: 1.6 }} /></div>
                </div>
              )}
              {type === 'phone' && (
                <div>
                  <p style={lbl}>Numéro de téléphone</p>
                  <input style={inputCss} placeholder="+229 97 00 00 00" value={fields.phone} onChange={(e) => setField('phone', e.target.value)} />
                </div>
              )}
            </Card>

            {/* Customization */}
            <Card padding="md">
              <h3 style={{ ...sHead, marginBottom: 16 }}>Personnalisation</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <p style={lbl}>Couleur QR</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2, background: 'rgba(255,255,255,0.04)' }} />
                      <input value={fgColor} onChange={(e) => setFgColor(e.target.value)} style={{ ...inputCss, flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 12 }} />
                    </div>
                  </div>
                  <div>
                    <p style={lbl}>Fond</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2, background: 'rgba(255,255,255,0.04)' }} />
                      <input value={bgColor} onChange={(e) => setBgColor(e.target.value)} style={{ ...inputCss, flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 12 }} />
                    </div>
                  </div>
                </div>
                <div>
                  <p style={lbl}>Thèmes rapides</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {PRESETS.map((p) => (
                      <button key={p.label} onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                        style={{ flex: 1, padding: '8px 4px', borderRadius: 6, border: `2px solid ${fgColor === p.fg && bgColor === p.bg ? p.fg : 'transparent'}`, cursor: 'pointer', background: p.bg }}>
                        <div style={{ width: 16, height: 16, background: p.fg, borderRadius: 3, margin: '0 auto 3px' }} />
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: p.fg, letterSpacing: 0.5 }}>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={lbl}>Taille d&apos;export</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {SIZES.map((s) => (
                      <button key={s.value} onClick={() => setSize(s.value)}
                        style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${size === s.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: size === s.value ? 'rgba(99,102,241,0.15)' : 'transparent', color: size === s.value ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, cursor: 'pointer' }}>
                        {s.label}<span style={{ display: 'block', fontSize: 8, marginTop: 2 }}>{s.value}px</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={lbl}>Correction d&apos;erreur</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {EC_LVLS.map((e) => (
                      <button key={e.label} onClick={() => setEcLevel(e.label as 'L'|'M'|'Q'|'H')}
                        style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${ecLevel === e.label ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: ecLevel === e.label ? 'rgba(99,102,241,0.15)' : 'transparent', color: ecLevel === e.label ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer' }}>
                        {e.label}<span style={{ display: 'block', fontSize: 7, marginTop: 2, color: '#4B5563' }}>{e.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <h3 style={sHead}>Aperçu</h3>
                {qrDataUrl && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={copyCurrentPng}
                      style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: copied ? '#10B981' : '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                      {copied ? '✓ Copié' : '📋 Copier'}
                    </button>
                    <button onClick={downloadCurrentSvg}
                      style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>SVG</button>
                    <button onClick={downloadCurrentPng}
                      style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>↓ PNG</button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, background: '#0D0E14', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
                {generating ? (
                  <p style={{ color: '#4B5563', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>Génération…</p>
                ) : qrDataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={qrDataUrl} alt="QR Code" style={{ width: 260, height: 260, imageRendering: 'pixelated', borderRadius: 8 }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 48, marginBottom: 10 }}>⬛</p>
                    <p style={{ color: '#4B5563', fontFamily: 'Space Mono, monospace', fontSize: 10 }}>Remplissez le formulaire pour générer</p>
                  </div>
                )}
              </div>

              {qrDataUrl && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={downloadCurrentPng} style={{ flex: 1, padding: '12px 0', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                      ↓ Télécharger PNG
                    </button>
                    <button onClick={downloadCurrentSvg} style={{ flex: 1, padding: '12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#9CA3AF', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                      ↓ Télécharger SVG
                    </button>
                  </div>
                  <Button
                    variant="gradient"
                    size="md"
                    loading={saving}
                    disabled={atLimit}
                    onClick={saveCode}
                    style={{ width: '100%' }}
                  >
                    {saving ? 'Sauvegarde…' : atLimit ? '🔒 Limite atteinte' : '💾 Sauvegarder dans Mes QR Codes'}
                  </Button>
                  {saveMsg && (
                    <p style={{ fontSize: 13, color: saveMsg.startsWith('✓') ? '#10B981' : '#EF4444', textAlign: 'center', background: saveMsg.startsWith('✓') ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', borderRadius: 6, padding: '8px 12px' }}>
                      {saveMsg}
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════ TAB: MES QR CODES ══════════════ */}
      {tab === 'list' && (
        <div>
          {codes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.07)' }}>
              <p style={{ fontSize: 48, marginBottom: 12 }}>⬛</p>
              <p style={{ color: '#9CA3AF', fontSize: 15, marginBottom: 20 }}>Aucun QR code sauvegardé</p>
              <Button variant="gradient" size="md" onClick={() => setTab('create')}>Créer mon premier QR Code</Button>
            </div>
          ) : selectedCode ? (
            /* ── Stats detail view ── */
            <div>
              <button onClick={() => { setSelectedId(null); setStats(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1, marginBottom: 20 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                RETOUR À LA LISTE
              </button>

              <div className="module-3col" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24, alignItems: 'start' }}>

                {/* Left: QR preview card */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Card padding="md">
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={selectedCode.dataUrl} alt="" style={{ width: 200, height: 200, imageRendering: 'pixelated', borderRadius: 10 }} />
                    </div>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', textAlign: 'center', marginBottom: 4 }}>{selectedCode.label}</p>
                    <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 12, marginBottom: 16 }}>
                      {QR_TYPES.find((t) => t.key === selectedCode.type)?.icon} {QR_TYPES.find((t) => t.key === selectedCode.type)?.label}
                      {' · '}
                      {new Date(selectedCode.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>

                    {/* Dynamic URL edit (Pro URL codes) */}
                    {isPro && selectedCode.type === 'url' && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Destination</p>
                        {editUrlOpen ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <input
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="https://…"
                              style={{ ...inputCss }}
                            />
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => updateTargetUrl(selectedCode.id)} disabled={savingUrl}
                                style={{ flex: 1, padding: '8px 0', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                                {savingUrl ? '…' : 'Sauver'}
                              </button>
                              <button onClick={() => setEditUrlOpen(false)}
                                style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#6B7280', fontSize: 12, cursor: 'pointer' }}>×</button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, padding: '8px 10px' }}>
                            <span style={{ flex: 1, color: '#9CA3AF', fontSize: 12, fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {selectedCode.targetUrl || '—'}
                            </span>
                            <button onClick={() => { setEditUrl(selectedCode.targetUrl ?? ''); setEditUrlOpen(true); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#818CF8', fontSize: 11, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>✎ Modifier</button>
                          </div>
                        )}
                        <p style={{ color: '#6B7280', fontSize: 11, marginTop: 6, fontFamily: 'DM Sans, sans-serif' }}>⚡ QR dynamique — modifiez la destination sans réimprimer.</p>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <button onClick={() => downloadPng(selectedCode)}
                        style={{ width: '100%', padding: '10px 0', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                        ↓ PNG
                      </button>
                      <button onClick={() => deleteCode(selectedCode.id)}
                        style={{ width: '100%', padding: '10px 0', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, color: '#EF4444', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                        Supprimer
                      </button>
                    </div>
                  </Card>
                </div>

                {/* Right: stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Pro gate for free users */}
                  {!isPro ? (
                    <div style={{ background: '#12141C', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 40, textAlign: 'center' }}>
                      <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>📊</span>
                      <Badge variant="electric" className="mb-4">PRO requis</Badge>
                      <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F8F9FC', margin: '16px 0 8px' }}>Analytics de scans</h3>
                      <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
                        Suivez combien de fois votre QR code est scanné, sur quels appareils, et visualisez l&apos;évolution jour par jour.
                      </p>
                      <Button variant="gradient" size="md" onClick={() => setTab('plans')} style={{ width: '100%' }}>Voir les plans Pro →</Button>
                    </div>
                  ) : statsLoading ? (
                    <Card padding="md">
                      <div style={{ textAlign: 'center', padding: 40, color: '#4B5563', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>Chargement des stats…</div>
                    </Card>
                  ) : stats ? (
                    <>
                      {/* KPI row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        {[
                          { label: 'Scans total',  value: stats.scanCount },
                          { label: 'Mobile',        value: stats.devices.mobile },
                          { label: 'Desktop',       value: stats.devices.desktop },
                        ].map((kpi) => (
                          <div key={kpi.label} style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '16px 18px' }}>
                            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 2 }}>{kpi.value}</p>
                            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>{kpi.label}</p>
                          </div>
                        ))}
                      </div>

                      {/* Daily chart */}
                      <Card padding="md">
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Scans — 7 derniers jours</p>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', padding: '0 4px' }}>
                          {stats.dailyScans.map((d) => {
                            const max = Math.max(...stats.dailyScans.map((x) => x.count), 1);
                            return (
                              <div key={d.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                                <MiniBar count={d.count} max={max} />
                                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#4B5563' }}>
                                  {new Date(d.date).toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 2)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        {stats.scanCount === 0 && (
                          <p style={{ textAlign: 'center', color: '#4B5563', fontSize: 12, marginTop: 16, fontFamily: 'Space Mono, monospace' }}>Aucun scan encore — partagez votre QR code !</p>
                        )}
                      </Card>

                      {/* Recent scans */}
                      {stats.recentScans.length > 0 && (
                        <Card padding="md">
                          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>Scans récents</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {stats.recentScans.map((s, i) => (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ fontSize: 18 }}>{s.device === 'mobile' ? '📱' : s.device === 'desktop' ? '💻' : '❓'}</span>
                                <div style={{ flex: 1 }}>
                                  <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>{s.device === 'mobile' ? 'Mobile' : s.device === 'desktop' ? 'Desktop' : 'Inconnu'}</p>
                                  <p style={{ color: '#6B7280', fontSize: 11 }}>{relativeDate(s.scannedAt)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      )}

                      {/* Last scanned */}
                      {stats.lastScannedAt && (
                        <p style={{ color: '#4B5563', fontSize: 11, fontFamily: 'Space Mono, monospace', textAlign: 'center' }}>
                          Dernier scan : {new Date(stats.lastScannedAt).toLocaleString('fr-FR')}
                        </p>
                      )}
                    </>
                  ) : (
                    <Card padding="md">
                      <div style={{ textAlign: 'center', padding: 32, color: '#4B5563', fontSize: 13 }}>Erreur lors du chargement des stats.</div>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* ── Codes grid ── */
            <div>
              {/* Plan usage bar */}
              {!isPro && (
                <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>Plan Essentiel</span>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: usageCount >= FREE_LIMIT ? '#EF4444' : '#6B7280' }}>{usageCount}/{FREE_LIMIT} codes</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((usageCount / FREE_LIMIT) * 100, 100)}%`, height: '100%', borderRadius: 2, background: usageCount >= FREE_LIMIT ? 'linear-gradient(90deg, #EF4444, #F97316)' : 'linear-gradient(90deg, #6366F1, #06B6D4)', transition: 'width 0.3s' }} />
                    </div>
                  </div>
                  <button onClick={() => setTab('plans')} style={{ padding: '7px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, color: '#818CF8', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>
                    Passer à Pro →
                  </button>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {codes.map((code) => (
                  <div
                    key={code.id}
                    onClick={() => selectCode(code)}
                    style={{ position: 'relative', background: 'rgba(255,255,255,0.02)', border: `1px solid ${selectedId === code.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: 14, cursor: 'pointer', transition: 'border-color 0.2s, background 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(99,102,241,0.05)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'; }}
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteCode(code.id); }}
                      style={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.6, zIndex: 1 }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                    >×</button>

                    {/* QR image */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={code.dataUrl} alt="" style={{ width: 110, height: 110, imageRendering: 'pixelated', borderRadius: 8 }} />
                    </div>

                    {/* Label */}
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, color: '#F8F9FC', textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                      {code.label}
                    </p>

                    {/* Type + date */}
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', textAlign: 'center', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                      {QR_TYPES.find((t) => t.key === code.type)?.icon} {code.type}
                    </p>

                    {/* Scan count */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      {isPro ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#818CF8' }}>{code.scanCount} scan{code.scanCount !== 1 ? 's' : ''}</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B5563" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563' }}>Stats Pro</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add new button */}
                <button
                  onClick={() => setTab('create')}
                  disabled={atLimit}
                  style={{ background: atLimit ? 'rgba(255,255,255,0.01)' : 'rgba(99,102,241,0.05)', border: `1px dashed ${atLimit ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.25)'}`, borderRadius: 10, padding: 14, cursor: atLimit ? 'not-allowed' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, gap: 10 }}
                >
                  <span style={{ fontSize: 28, opacity: atLimit ? 0.3 : 1 }}>+</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: atLimit ? '#4B5563' : '#818CF8', textTransform: 'uppercase' }}>
                    {atLimit ? `Limite atteinte (${FREE_LIMIT}/${FREE_LIMIT})` : 'Nouveau QR Code'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ TAB: PLANS ══════════════ */}
      {tab === 'plans' && (
        <div style={{ maxWidth: 780 }}>
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 8 }}>Choisissez votre plan QR</h3>
            <p style={{ color: '#9CA3AF', fontSize: 15 }}>Créez, personnalisez et suivez vos QR codes selon vos besoins.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

            {/* Plan Essentiel */}
            <div style={{ background: '#12141C', border: `1px solid ${!isPro ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column' }}>
              {!isPro && <div style={{ marginBottom: 16 }}><Badge variant="electric">Plan actuel</Badge></div>}
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Essentiel</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#F8F9FC', marginBottom: 4 }}>Gratuit</p>
              <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 24 }}>Pour commencer avec les QR codes</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {[
                  { ok: true,  text: `${FREE_LIMIT} QR codes sauvegardés` },
                  { ok: true,  text: 'Téléchargement PNG & SVG' },
                  { ok: true,  text: 'Personnalisation couleurs & thèmes' },
                  { ok: true,  text: '6 types de contenu' },
                  { ok: false, text: 'Suivi des scans' },
                  { ok: false, text: 'Analytics (scans/jour, appareils)' },
                  { ok: false, text: 'QR dynamiques (URL modifiable)' },
                  { ok: false, text: 'Codes illimités' },
                ].map((f) => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{f.ok ? '✓' : '✗'}</span>
                    <span style={{ color: f.ok ? '#D1D5DB' : '#4B5563', fontSize: 14, fontFamily: 'DM Sans, sans-serif', textDecoration: f.ok ? 'none' : 'none' }}>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Pro */}
            <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.08))', border: `1px solid ${isPro ? 'rgba(99,102,241,0.6)' : 'rgba(99,102,241,0.3)'}`, borderRadius: 14, padding: 28, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.1)', filter: 'blur(20px)' }} />
              {isPro ? (
                <div style={{ marginBottom: 16 }}><Badge variant="gradient">⚡ Plan actuel</Badge></div>
              ) : (
                <div style={{ background: 'linear-gradient(90deg, #6366F1, #06B6D4)', borderRadius: 6, padding: '3px 10px', alignSelf: 'flex-start', marginBottom: 16 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#fff', textTransform: 'uppercase' }}>Recommandé</span>
                </div>
              )}
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 8 }}>Pro</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: '#F8F9FC' }}>9 900</p>
                <span style={{ color: '#6B7280', fontSize: 13 }}>FCFA/mois</span>
              </div>
              <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 24 }}>Tout Essentiel + suivi complet</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {[
                  { text: 'QR codes illimités' },
                  { text: 'Téléchargement PNG & SVG' },
                  { text: 'Personnalisation couleurs & thèmes' },
                  { text: '6 types de contenu' },
                  { text: 'Suivi des scans (URL uniquement)' },
                  { text: 'Analytics 7 jours (scans/jour, appareils)' },
                  { text: 'QR dynamiques — modifiez l\'URL sans réimprimer' },
                  { text: 'Accès à tous les modules We Connect' },
                ].map((f) => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2.5" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
                    <span style={{ color: '#D1D5DB', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{f.text}</span>
                  </div>
                ))}
              </div>

              {!isPro && (
                <a href="/dashboard/settings" style={{ display: 'block', marginTop: 24, padding: '14px 0', background: 'linear-gradient(135deg, #4338CA, #0E7490)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 15, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }}>
                  Passer à Pro →
                </a>
              )}
              {isPro && (
                <div style={{ marginTop: 24, padding: '12px 0', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, textAlign: 'center' }}>
                  <span style={{ color: '#10B981', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>✓ Plan actif</span>
                </div>
              )}
            </div>
          </div>

          {/* Note on dynamic QR */}
          <div style={{ marginTop: 24, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 10, padding: '16px 20px', display: 'flex', gap: 14 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
            <div>
              <p style={{ color: '#818CF8', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>QR codes dynamiques — comment ça marche ?</p>
              <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7 }}>
                Sur le plan Pro, vos QR codes URL pointent vers <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#818CF8' }}>weconnect.cards/qr/{'{id}'}</code>. Quand quelqu&apos;un scanne le code, notre serveur enregistre le scan et redirige vers votre URL. Vous pouvez modifier la destination à tout moment sans réimprimer votre QR code.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
