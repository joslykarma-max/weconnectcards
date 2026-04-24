'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function CertificatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    productName:  '',
    brand:        '',
    serialNumber: '',
    description:  '',
    purchaseDate: '',
    origin:       '',
    warranty:     '',
    verifyUrl:    '',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'certificate', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const certId = `WC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🦋 Certificat d&apos;authenticité</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Vérification produit par NFC — anti-contrefaçon</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Informations produit</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom du produit" placeholder="Sac en cuir artisanal" value={form.productName} onChange={set('productName')} />
              <Input label="Marque / Artisan" placeholder="Maison Kofi" value={form.brand} onChange={set('brand')} />
              <Input label="Numéro de série" placeholder="MK-2025-001" value={form.serialNumber} onChange={set('serialNumber')} />
              <Input label="Origine / Fabrication" placeholder="Fait main à Abidjan, CI" value={form.origin} onChange={set('origin')} />
              <Input label="Date de fabrication" type="date" value={form.purchaseDate} onChange={set('purchaseDate')} />
              <Input label="Garantie" placeholder="2 ans — pièces et main d'œuvre" value={form.warranty} onChange={set('warranty')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Description</p>
                <textarea value={form.description} onChange={set('description')} rows={3}
                  placeholder="Description du produit, matériaux, techniques..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Certificat numérique</p>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#06B6D4', textTransform: 'uppercase' }}>Certifié Authentique</span>
              <span style={{ fontSize: 24 }}>🦋</span>
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', marginBottom: 4 }}>
              {form.productName || 'Nom du produit'}
            </p>
            {form.brand && <p style={{ color: '#06B6D4', fontSize: 13, marginBottom: 16 }}>par {form.brand}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.serialNumber && (
                <div style={{ background: 'rgba(6,182,212,0.08)', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#6B7280', fontSize: 11 }}>N° SÉRIE</span>
                  <span style={{ color: '#F8F9FC', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>{form.serialNumber}</span>
                </div>
              )}
              {form.origin && <p style={{ color: '#9CA3AF', fontSize: 12 }}>📍 {form.origin}</p>}
              {form.warranty && <p style={{ color: '#9CA3AF', fontSize: 12 }}>🛡️ {form.warranty}</p>}
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#6B7280', letterSpacing: 1 }}>ID: {certId}</span>
              <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 4, padding: '3px 8px' }}>
                <span style={{ color: '#10B981', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>✓ VÉRIFIÉ</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
