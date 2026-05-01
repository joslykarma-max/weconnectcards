'use client';

import { useState } from 'react';

type StockCard = {
  id:        string;
  nfcId:     string;
  edition:   string;
  stockedAt: string | null;
};

type Totals = {
  inStock: number;
  pending: number;
  active:  number;
  total:   number;
};

const EDITIONS = [
  { key: 'midnight', label: 'Midnight', accent: '#6366F1' },
  { key: 'electric', label: 'Electric', accent: '#818CF8' },
  { key: 'glass',    label: 'Glass',    accent: '#06B6D4' },
  { key: 'metal',    label: 'Métal',    accent: '#9CA3AF' },
];

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // pas de I, O, 0, 1
  let code = 'WC-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function StockClient({ stock: initialStock, totals: initialTotals }: { stock: StockCard[]; totals: Totals }) {
  const [stock, setStock]       = useState(initialStock);
  const [totals, setTotals]     = useState(initialTotals);
  const [edition, setEdition]   = useState('midnight');
  const [codes, setCodes]       = useState('');
  const [count, setCount]       = useState(10);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]     = useState<{ created: string[]; skipped: string[] } | null>(null);
  const [filter, setFilter]     = useState('');

  function generateBatch() {
    const generated: string[] = [];
    const seen = new Set<string>();
    while (generated.length < count) {
      const c = generateCode();
      if (!seen.has(c)) { seen.add(c); generated.push(c); }
    }
    setCodes(generated.join('\n'));
  }

  async function submit() {
    const list = codes.split('\n').map((c) => c.trim()).filter(Boolean);
    if (list.length === 0) return;
    setSubmitting(true);
    setResult(null);

    const res  = await fetch('/api/admin/cards/bulk', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes: list, edition }),
    });
    const data = await res.json() as { created?: string[]; skipped?: string[]; error?: string };

    if (!res.ok) {
      alert(data.error ?? 'Erreur.');
      setSubmitting(false);
      return;
    }

    setResult({ created: data.created ?? [], skipped: data.skipped ?? [] });

    if ((data.created ?? []).length > 0) {
      const newCards: StockCard[] = (data.created ?? []).map((code) => ({
        id:        code,
        nfcId:     code,
        edition,
        stockedAt: new Date().toISOString(),
      }));
      setStock((prev) => [...newCards, ...prev]);
      setTotals((t) => ({ ...t, inStock: t.inStock + newCards.length, total: t.total + newCards.length }));
      setCodes('');
    }
    setSubmitting(false);
  }

  function exportCSV() {
    const csv = ['nfc_id,edition,nfc_url'].concat(
      stock.map((c) => `${c.nfcId},${c.edition},https://weconnect.cards/nfc/${c.nfcId}`),
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `stock-cards-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function copyAll() {
    const text = stock.map((c) => `${c.nfcId} → https://weconnect.cards/nfc/${c.nfcId}`).join('\n');
    navigator.clipboard.writeText(text);
  }

  const filtered = stock.filter((c) =>
    !filter || c.nfcId.toLowerCase().includes(filter.toLowerCase()),
  );

  const cardStyle: React.CSSProperties = {
    background: 'var(--t-surface)',
    border: 'var(--t-border-full)',
    borderRadius: 8,
    padding: '20px 24px',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Header */}
      <div>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 8 }}>
          Admin · Stock NFC
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--t-text)', marginBottom: 4 }}>
          Stock cartes NFC
        </h1>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>
          Génère des codes uniques avant de programmer les puces et expédier.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'En stock',   value: totals.inStock, color: '#06B6D4' },
          { label: 'En attente', value: totals.pending, color: '#F59E0B' },
          { label: 'Activées',   value: totals.active,  color: '#10B981' },
          { label: 'Total',      value: totals.total,   color: '#818CF8' },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, borderColor: `${s.color}22` }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: s.color, textTransform: 'uppercase', marginBottom: 10 }}>
              {s.label}
            </p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, color: 'var(--t-text)', lineHeight: 1 }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24, alignItems: 'start' }}>

        {/* Generator */}
        <div style={cardStyle}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 18 }}>
            Ajouter en stock
          </p>

          {/* Edition */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Édition
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {EDITIONS.map((e) => (
                <button
                  key={e.key}
                  onClick={() => setEdition(e.key)}
                  style={{
                    padding: '8px 0',
                    background: edition === e.key ? `${e.accent}22` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${edition === e.key ? `${e.accent}55` : 'rgba(255,255,255,0.07)'}`,
                    borderRadius: 6, cursor: 'pointer',
                    color: edition === e.key ? e.accent : 'var(--t-text-muted)',
                    fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick generator */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Générer en lot
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number" min={1} max={500}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value, 10) || 1)}
                style={{
                  width: 80, background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                  padding: '8px 10px', color: 'var(--t-text)',
                  fontFamily: 'Space Mono, monospace', fontSize: 13, outline: 'none',
                }}
              />
              <button
                onClick={generateBatch}
                style={{
                  flex: 1, padding: '8px 14px',
                  background: 'rgba(99,102,241,0.1)',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 6, color: '#818CF8',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                Générer {count} codes
              </button>
            </div>
          </div>

          {/* Codes textarea */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
              Codes (un par ligne)
            </label>
            <textarea
              value={codes}
              onChange={(e) => setCodes(e.target.value)}
              placeholder="WC-A1B2C3&#10;WC-D4E5F6"
              style={{
                width: '100%', boxSizing: 'border-box',
                minHeight: 160,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                padding: '10px 12px', color: 'var(--t-text)',
                fontFamily: 'Space Mono, monospace', fontSize: 12,
                letterSpacing: 1, outline: 'none', resize: 'vertical',
              }}
            />
            <p style={{ color: 'var(--t-text-muted)', fontSize: 11, marginTop: 6 }}>
              {codes.split('\n').filter((c) => c.trim()).length} code(s)
            </p>
          </div>

          <button
            onClick={submit}
            disabled={!codes.trim() || submitting}
            style={{
              width: '100%', padding: '12px',
              background: !codes.trim() ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366F1, #06B6D4)',
              border: 'none', borderRadius: 6, color: '#fff',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
              cursor: !codes.trim() ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            {submitting ? 'Enregistrement...' : 'Enregistrer en stock'}
          </button>

          {result && (
            <div style={{ marginTop: 14, padding: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6 }}>
              <p style={{ color: '#10B981', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
                ✓ {result.created.length} ajouté(s)
                {result.skipped.length > 0 && ` · ${result.skipped.length} déjà existant(s)`}
              </p>
            </div>
          )}
        </div>

        {/* Stock list */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase' }}>
              En stock ({stock.length})
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={copyAll}
                disabled={stock.length === 0}
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '6px 12px', color: '#818CF8', fontSize: 11, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
              >
                Copier tout
              </button>
              <button
                onClick={exportCSV}
                disabled={stock.length === 0}
                style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '6px 12px', color: '#818CF8', fontSize: 11, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
              >
                Export CSV
              </button>
            </div>
          </div>

          <input
            placeholder="🔍 Filtrer par code..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: '100%', boxSizing: 'border-box', marginBottom: 14,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
              padding: '8px 12px', color: 'var(--t-text)',
              fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none',
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 540, overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <p style={{ color: 'var(--t-text-muted)', fontSize: 13, textAlign: 'center', padding: '32px 0' }}>
                {stock.length === 0 ? 'Aucune carte en stock. Génère ton premier lot →' : 'Aucun résultat.'}
              </p>
            )}
            {filtered.map((c) => (
              <div
                key={c.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 6,
                }}
              >
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--t-text)', letterSpacing: 2, minWidth: 110 }}>
                  {c.nfcId}
                </span>
                <span style={{
                  fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1,
                  color: '#818CF8', textTransform: 'uppercase',
                  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: 3, padding: '2px 6px',
                }}>
                  {c.edition}
                </span>
                <span style={{ flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#818CF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  weconnect.cards/nfc/{c.nfcId}
                </span>
                <button
                  onClick={() => navigator.clipboard.writeText(`https://weconnect.cards/nfc/${c.nfcId}`)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-text-muted)', padding: 4 }}
                  title="Copier l'URL NFC"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Help */}
      <div style={cardStyle}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase', marginBottom: 14 }}>
          Comment programmer les puces NFC
        </p>
        <ol style={{ color: 'var(--t-text-sub)', fontSize: 13, lineHeight: 1.9, paddingLeft: 20, margin: 0 }}>
          <li>Télécharge l&apos;app <strong style={{ color: 'var(--t-text)' }}>NFC Tools</strong> (gratuite, iOS/Android)</li>
          <li>Onglet <strong style={{ color: 'var(--t-text)' }}>Écrire</strong> → Ajouter un enregistrement → <strong style={{ color: 'var(--t-text)' }}>URL</strong></li>
          <li>Colle : <span style={{ color: '#818CF8', fontFamily: 'Space Mono, monospace' }}>https://weconnect.cards/nfc/&#123;CODE&#125;</span></li>
          <li>Approche le téléphone de la carte → <strong style={{ color: 'var(--t-text)' }}>Écrire</strong></li>
          <li>Imprime le code sur un sticker dans l&apos;emballage</li>
          <li>Expédie. Le client active en scannant ou en tapant le code.</li>
        </ol>
      </div>
    </div>
  );
}
