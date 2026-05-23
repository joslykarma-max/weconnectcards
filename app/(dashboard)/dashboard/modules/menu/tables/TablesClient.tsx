'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

interface Props {
  username:         string;
  initialTableCount: number;
}

export default function TablesClient({ username, initialTableCount }: Props) {
  const [tableCount, setTableCount] = useState(initialTableCount);
  const [draft,      setDraft]      = useState(initialTableCount);
  const [qrUrls,     setQrUrls]     = useState<string[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);

  /* ── Generate QR data URLs whenever tableCount or username changes ──────── */
  useEffect(() => {
    if (tableCount <= 0 || !username) { setQrUrls([]); return; }
    const count = Math.min(tableCount, 99);
    Promise.all(
      Array.from({ length: count }, (_, i) =>
        QRCode.toDataURL(`${APP_URL}/m/${username}/menu?table=${i + 1}`, {
          color:                { dark: '#1E1F2E', light: '#FFFFFF' },
          width:                300,
          margin:               2,
          errorCorrectionLevel: 'M',
        }),
      ),
    ).then(setQrUrls).catch(() => {});
  }, [tableCount, username]);

  /* ── Save table count to module config ──────────────────────────────────── */
  async function save() {
    const n = Math.min(99, Math.max(0, draft));
    setSaving(true);
    try {
      await fetch('/api/modules', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ type: 'menu', config: { tableCount: n } }),
      });
      setTableCount(n);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  /* ── Print-all: open each QR in a print-friendly window ────────────────── */
  function printAll() {
    const html = `
      <!DOCTYPE html><html><head>
      <title>QR Codes Tables — ${username}</title>
      <style>
        body { margin: 0; padding: 16px; font-family: sans-serif; background: #fff; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .card { border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; text-align: center; break-inside: avoid; }
        .card img { width: 120px; height: 120px; display: block; margin: 0 auto 10px; }
        .card p { font-size: 14px; font-weight: 700; margin: 0; }
        .card small { font-size: 10px; color: #9ca3af; display: block; margin-top: 4px; word-break: break-all; }
        @media print { .no-print { display: none; } }
      </style>
      </head><body>
      <button class="no-print" onclick="window.print()" style="margin-bottom:16px;padding:8px 20px;background:#6366f1;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px">Imprimer</button>
      <div class="grid">
        ${qrUrls.map((url, i) => `
          <div class="card">
            <img src="${url}" alt="Table ${i + 1}" />
            <p>Table ${i + 1}</p>
            <small>${APP_URL}/m/${username}/menu?table=${i + 1}</small>
          </div>
        `).join('')}
      </div>
      </body></html>
    `;
    const win = window.open('', '_blank');
    win?.document.write(html);
    win?.document.close();
  }

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link href="/dashboard/modules/menu" style={{ color: '#6B7280', fontSize: 20, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>←</Link>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t-text)', marginBottom: 2 }}>
            ⬛ QR Codes Tables
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 13 }}>Un QR par table — le client scanne, voit le menu et passe commande.</p>
        </div>
      </div>

      {/* Config panel */}
      <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 10, padding: 24, marginBottom: 28, display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: '0 0 180px' }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Nombre de tables</p>
          <input
            type="number" min={0} max={99}
            value={draft === 0 ? '' : draft}
            onChange={e => setDraft(Math.min(99, Math.max(0, Number(e.target.value) || 0)))}
            placeholder="Ex : 12"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: '11px 14px', color: 'var(--t-text)', fontFamily: 'Space Mono, monospace', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={save}
          disabled={saving}
          style={{ padding: '11px 28px', background: saved ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #4338CA, #6366F1)', border: saved ? '1px solid rgba(16,185,129,0.3)' : 'none', borderRadius: 8, color: saved ? '#10B981' : '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saved ? '✓ Sauvegardé' : saving ? 'Sauvegarde...' : 'Appliquer'}
        </button>
        {tableCount > 0 && qrUrls.length === tableCount && (
          <button
            onClick={printAll}
            style={{ padding: '11px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            🖨️ Imprimer tout
          </button>
        )}
        <p style={{ flex: '1 1 100%', color: '#6B7280', fontSize: 12, margin: 0 }}>
          Chaque QR redirige vers <code style={{ color: '#818CF8', fontFamily: 'Space Mono, monospace' }}>/m/{username}/menu?table=N</code>. Imprimez-les et posez-les sur chaque table.
        </p>
      </div>

      {/* QR grid */}
      {tableCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 10 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>⬛</p>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>Entrez le nombre de tables pour générer les QR codes.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {Array.from({ length: tableCount }, (_, i) => {
            const n   = i + 1;
            const url = qrUrls[i];
            return (
              <div key={n} style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                {/* QR image */}
                {url ? (
                  <img
                    src={url}
                    alt={`QR Table ${n}`}
                    style={{ width: 120, height: 120, borderRadius: 8, display: 'block' }}
                  />
                ) : (
                  <div style={{ width: 120, height: 120, borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#374151', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>...</span>
                  </div>
                )}

                {/* Label */}
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: 'var(--t-text)' }}>Table {n}</p>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', letterSpacing: 1, marginTop: 2 }}>
                    ?table={n}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, width: '100%' }}>
                  {url && (
                    <a
                      href={url}
                      download={`table-${n}.png`}
                      style={{ flex: 1, textAlign: 'center', padding: '7px 0', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 7, textDecoration: 'none', color: '#818CF8', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}
                    >
                      ↓ PNG
                    </a>
                  )}
                  <a
                    href={`${APP_URL}/m/${username}/menu?table=${n}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flex: 1, textAlign: 'center', padding: '7px 0', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 7, textDecoration: 'none', color: '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase' }}
                  >
                    ↗ Test
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
