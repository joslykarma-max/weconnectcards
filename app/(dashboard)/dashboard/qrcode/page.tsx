'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';

// ── Types ─────────────────────────────────────────────────────────────────────
type QrType = 'url' | 'text' | 'wifi' | 'contact' | 'email' | 'phone';

const QR_TYPES: { key: QrType; label: string; icon: string; desc: string }[] = [
  { key: 'url',     label: 'URL',      icon: '🔗', desc: 'Lien web'       },
  { key: 'text',    label: 'Texte',    icon: '📝', desc: 'Texte libre'    },
  { key: 'wifi',    label: 'WiFi',     icon: '📶', desc: 'Réseau WiFi'    },
  { key: 'contact', label: 'Contact',  icon: '👤', desc: 'Carte vCard'    },
  { key: 'email',   label: 'Email',    icon: '✉️', desc: 'Email prérempli' },
  { key: 'phone',   label: 'Téléphone',icon: '📞', desc: 'Numéro de tel'  },
];

const SIZES = [
  { label: 'S',  value: 200 },
  { label: 'M',  value: 320 },
  { label: 'L',  value: 512 },
];

const EC_LEVELS = [
  { label: 'L', desc: '7%'  },
  { label: 'M', desc: '15%' },
  { label: 'Q', desc: '25%' },
  { label: 'H', desc: '30%' },
];

type HistoryItem = {
  id:        string;
  type:      QrType;
  label:     string;
  data:      string;
  fgColor:   string;
  bgColor:   string;
  dataUrl:   string;
  createdAt: string;
};

// ── Data builder ──────────────────────────────────────────────────────────────
function buildData(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case 'url':
      return fields.url?.trim() || 'https://weconnect.cards';
    case 'text':
      return fields.text?.trim() || '';
    case 'wifi':
      return `WIFI:T:${fields.security || 'WPA'};S:${fields.ssid || ''};P:${fields.password || ''};;`;
    case 'contact': {
      const lines = [
        'BEGIN:VCARD', 'VERSION:3.0',
        `N:${fields.lastName || ''};${fields.firstName || ''}`,
        `FN:${[fields.firstName, fields.lastName].filter(Boolean).join(' ')}`,
      ];
      if (fields.phone)   lines.push(`TEL:${fields.phone}`);
      if (fields.email)   lines.push(`EMAIL:${fields.email}`);
      if (fields.company) lines.push(`ORG:${fields.company}`);
      if (fields.website) lines.push(`URL:${fields.website}`);
      lines.push('END:VCARD');
      return lines.join('\n');
    }
    case 'email':
      return `mailto:${fields.to || ''}${fields.subject ? `?subject=${encodeURIComponent(fields.subject)}` : ''}${fields.body ? `${fields.subject ? '&' : '?'}body=${encodeURIComponent(fields.body)}` : ''}`;
    case 'phone':
      return `tel:${fields.phone || ''}`;
    default:
      return '';
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

// ── Component ─────────────────────────────────────────────────────────────────
export default function QrCodePage() {
  const router = useRouter();

  const [type,    setType]    = useState<QrType>('url');
  const [fields,  setFields]  = useState<Record<string, string>>({ url: '', text: '', ssid: '', password: '', security: 'WPA', firstName: '', lastName: '', phone: '', email: '', company: '', website: '', to: '', subject: '', body: '' });
  const [fgColor, setFgColor] = useState('#0D0E14');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [size,    setSize]    = useState(320);
  const [ecLevel, setEcLevel] = useState<'L'|'M'|'Q'|'H'>('M');
  const [qrDataUrl,    setQrDataUrl]    = useState('');
  const [generating,   setGenerating]   = useState(false);
  const [history,      setHistory]      = useState<HistoryItem[]>([]);
  const [copiedId,     setCopiedId]     = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qrHistory');
      if (stored) setHistory(JSON.parse(stored) as HistoryItem[]);
    } catch { /* ignore */ }
  }, []);

  // Generate QR code
  const generate = useCallback(async () => {
    const data = buildData(type, fields);
    if (!data) { setQrDataUrl(''); return; }
    setGenerating(true);
    try {
      const QRCode = (await import('qrcode')).default;
      const url = await QRCode.toDataURL(data, {
        color: { dark: fgColor, light: bgColor },
        width: size,
        margin: 2,
        errorCorrectionLevel: ecLevel,
      });
      setQrDataUrl(url);
    } catch { /* ignore */ }
    setGenerating(false);
  }, [type, fields, fgColor, bgColor, size, ecLevel]);

  // Debounced auto-generate
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { void generate(); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  function setField(k: string, v: string) {
    setFields(p => ({ ...p, [k]: v }));
  }

  function saveToHistory() {
    if (!qrDataUrl) return;
    const item: HistoryItem = {
      id:        Date.now().toString(),
      type,
      label:     getLabel(type, fields),
      data:      buildData(type, fields),
      fgColor,
      bgColor,
      dataUrl:   qrDataUrl,
      createdAt: new Date().toISOString(),
    };
    const next = [item, ...history].slice(0, 12);
    setHistory(next);
    try { localStorage.setItem('qrHistory', JSON.stringify(next)); } catch { /* ignore */ }
  }

  function loadFromHistory(item: HistoryItem) {
    setType(item.type);
    setFgColor(item.fgColor);
    setBgColor(item.bgColor);
    setQrDataUrl(item.dataUrl);
  }

  function removeFromHistory(id: string) {
    const next = history.filter(h => h.id !== id);
    setHistory(next);
    try { localStorage.setItem('qrHistory', JSON.stringify(next)); } catch { /* ignore */ }
  }

  async function downloadPng() {
    if (!qrDataUrl) return;
    const QRCode = (await import('qrcode')).default;
    const url = await QRCode.toDataURL(buildData(type, fields), {
      color: { dark: fgColor, light: bgColor },
      width: Math.max(size, 512),
      margin: 2,
      errorCorrectionLevel: ecLevel,
    });
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${getLabel(type, fields).replace(/\s+/g, '-')}.png`;
    a.click();
    saveToHistory();
  }

  async function downloadSvg() {
    const QRCode = (await import('qrcode')).default;
    const svg = await QRCode.toString(buildData(type, fields), {
      type: 'svg',
      color: { dark: fgColor, light: bgColor },
      width: 512,
      margin: 2,
      errorCorrectionLevel: ecLevel,
    });
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${getLabel(type, fields).replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    saveToHistory();
  }

  async function copyPng() {
    if (!qrDataUrl) return;
    try {
      const res  = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopiedId('copy');
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  }

  const lbl: React.CSSProperties = { fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 };
  const inputCss: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '9px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box' };
  const sHead: React.CSSProperties = { fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', margin: 0 };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>⬛ Générateur QR Code</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>Créez, personnalisez et téléchargez vos QR codes</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Left: Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Type selector */}
          <Card padding="md">
            <h3 style={{ ...sHead, marginBottom: 14 }}>Type de contenu</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {QR_TYPES.map(t => (
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
            <h3 style={{ ...sHead, marginBottom: 16 }}>
              {QR_TYPES.find(t => t.key === type)?.icon} {QR_TYPES.find(t => t.key === type)?.desc}
            </h3>

            {type === 'url' && (
              <div>
                <p style={lbl}>URL</p>
                <input style={inputCss} placeholder="https://monsite.com" value={fields.url}
                  onChange={e => setField('url', e.target.value)} />
              </div>
            )}

            {type === 'text' && (
              <div>
                <p style={lbl}>Texte</p>
                <textarea value={fields.text} onChange={e => setField('text', e.target.value)}
                  rows={4} placeholder="Entrez votre texte ici…"
                  style={{ ...inputCss, resize: 'vertical', lineHeight: 1.6 }} />
              </div>
            )}

            {type === 'wifi' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={lbl}>Nom du réseau (SSID)</p>
                  <input style={inputCss} placeholder="MonWiFi" value={fields.ssid}
                    onChange={e => setField('ssid', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Mot de passe</p>
                  <input style={inputCss} type="password" placeholder="••••••••" value={fields.password}
                    onChange={e => setField('password', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Sécurité</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {['WPA', 'WEP', 'nopass'].map(s => (
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
                  <div>
                    <p style={lbl}>Prénom</p>
                    <input style={inputCss} placeholder="Kofi" value={fields.firstName}
                      onChange={e => setField('firstName', e.target.value)} />
                  </div>
                  <div>
                    <p style={lbl}>Nom</p>
                    <input style={inputCss} placeholder="Mensah" value={fields.lastName}
                      onChange={e => setField('lastName', e.target.value)} />
                  </div>
                </div>
                <div>
                  <p style={lbl}>Téléphone</p>
                  <input style={inputCss} placeholder="+229 97 00 00 00" value={fields.phone}
                    onChange={e => setField('phone', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Email</p>
                  <input style={inputCss} placeholder="kofi@exemple.com" value={fields.email}
                    onChange={e => setField('email', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Société (optionnel)</p>
                  <input style={inputCss} placeholder="Ma Société" value={fields.company}
                    onChange={e => setField('company', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Site web (optionnel)</p>
                  <input style={inputCss} placeholder="https://" value={fields.website}
                    onChange={e => setField('website', e.target.value)} />
                </div>
              </div>
            )}

            {type === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <p style={lbl}>Destinataire</p>
                  <input style={inputCss} placeholder="contact@exemple.com" value={fields.to}
                    onChange={e => setField('to', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Sujet (optionnel)</p>
                  <input style={inputCss} placeholder="Objet de l'email" value={fields.subject}
                    onChange={e => setField('subject', e.target.value)} />
                </div>
                <div>
                  <p style={lbl}>Message (optionnel)</p>
                  <textarea value={fields.body} onChange={e => setField('body', e.target.value)}
                    rows={3} placeholder="Bonjour, …"
                    style={{ ...inputCss, resize: 'vertical', lineHeight: 1.6 }} />
                </div>
              </div>
            )}

            {type === 'phone' && (
              <div>
                <p style={lbl}>Numéro de téléphone</p>
                <input style={inputCss} placeholder="+229 97 00 00 00" value={fields.phone}
                  onChange={e => setField('phone', e.target.value)} />
              </div>
            )}
          </Card>

          {/* Customization */}
          <Card padding="md">
            <h3 style={{ ...sHead, marginBottom: 16 }}>Personnalisation</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Colors */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <p style={lbl}>Couleur QR</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                      style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2, background: 'rgba(255,255,255,0.04)' }} />
                    <input value={fgColor} onChange={e => setFgColor(e.target.value)}
                      style={{ ...inputCss, flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 12 }} />
                  </div>
                </div>
                <div>
                  <p style={lbl}>Fond</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                      style={{ width: 36, height: 36, borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: 2, background: 'rgba(255,255,255,0.04)' }} />
                    <input value={bgColor} onChange={e => setBgColor(e.target.value)}
                      style={{ ...inputCss, flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              {/* Presets */}
              <div>
                <p style={lbl}>Thèmes rapides</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[
                    { label: 'Classique', fg: '#000000', bg: '#FFFFFF' },
                    { label: 'Nuit',      fg: '#0D0E14', bg: '#FFFFFF' },
                    { label: 'Indigo',    fg: '#4338CA', bg: '#EEF2FF' },
                    { label: 'Cyan',      fg: '#0E7490', bg: '#ECFEFF' },
                    { label: 'Vert',      fg: '#065F46', bg: '#ECFDF5' },
                  ].map(p => (
                    <button key={p.label} onClick={() => { setFgColor(p.fg); setBgColor(p.bg); }}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: 6, border: `2px solid ${fgColor === p.fg && bgColor === p.bg ? p.fg : 'transparent'}`, cursor: 'pointer', background: p.bg }}>
                      <div style={{ width: 16, height: 16, background: p.fg, borderRadius: 3, margin: '0 auto 3px' }} />
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: p.fg, letterSpacing: 0.5 }}>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div>
                <p style={lbl}>Taille d&apos;export</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {SIZES.map(s => (
                    <button key={s.value} onClick={() => setSize(s.value)}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${size === s.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: size === s.value ? 'rgba(99,102,241,0.15)' : 'transparent', color: size === s.value ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, cursor: 'pointer' }}>
                      {s.label}
                      <span style={{ display: 'block', fontSize: 8, marginTop: 2 }}>{s.value}px</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error correction */}
              <div>
                <p style={lbl}>Correction d&apos;erreur</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {EC_LEVELS.map(e => (
                    <button key={e.label} onClick={() => setEcLevel(e.label as 'L'|'M'|'Q'|'H')}
                      style={{ flex: 1, padding: '8px 0', borderRadius: 6, border: `1px solid ${ecLevel === e.label ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: ecLevel === e.label ? 'rgba(99,102,241,0.15)' : 'transparent', color: ecLevel === e.label ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, cursor: 'pointer' }}>
                      {e.label}
                      <span style={{ display: 'block', fontSize: 7, marginTop: 2, color: '#4B5563' }}>{e.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ── Right: Preview + History ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Preview */}
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={sHead}>Aperçu</h3>
              {qrDataUrl && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={copyPng}
                    style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: copiedId === 'copy' ? '#10B981' : '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                    {copiedId === 'copy' ? '✓ Copié' : '📋 Copier'}
                  </button>
                  <button onClick={downloadSvg}
                    style={{ padding: '7px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                    SVG
                  </button>
                  <button onClick={downloadPng}
                    style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                    ↓ PNG
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 340, background: '#0D0E14', borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)' }}>
              {generating ? (
                <p style={{ color: '#4B5563', fontFamily: 'Space Mono, monospace', fontSize: 11 }}>Génération…</p>
              ) : qrDataUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={qrDataUrl} alt="QR Code" style={{ width: 280, height: 280, imageRendering: 'pixelated', borderRadius: 8 }} />
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 48, marginBottom: 10 }}>⬛</p>
                  <p style={{ color: '#4B5563', fontFamily: 'Space Mono, monospace', fontSize: 10 }}>Remplissez le formulaire pour générer</p>
                </div>
              )}
            </div>

            {qrDataUrl && (
              <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                <button onClick={downloadPng} style={{ flex: 1, padding: '12px 0', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                  ↓ Télécharger PNG
                </button>
                <button onClick={downloadSvg} style={{ flex: 1, padding: '12px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#9CA3AF', fontSize: 14, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                  ↓ Télécharger SVG
                </button>
              </div>
            )}
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card padding="md">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={sHead}>Historique récent</h3>
                <button onClick={() => { setHistory([]); localStorage.removeItem('qrHistory'); }}
                  style={{ background: 'none', border: 'none', color: '#4B5563', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                  Tout effacer
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))', gap: 12 }}>
                {history.map(item => (
                  <div key={item.id} style={{ position: 'relative' }}>
                    <button onClick={() => loadFromHistory(item)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: 10, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.dataUrl} alt="" style={{ width: 64, height: 64, imageRendering: 'pixelated', borderRadius: 4 }} />
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', textAlign: 'center' }}>{item.label}</span>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#4B5563', textTransform: 'uppercase' }}>
                        {QR_TYPES.find(t => t.key === item.type)?.icon} {item.type}
                      </span>
                    </button>
                    <button onClick={() => removeFromHistory(item.id)}
                      style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'rgba(239,68,68,0.15)', border: 'none', color: '#EF4444', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
