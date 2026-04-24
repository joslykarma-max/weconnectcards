'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function MenuPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    restaurantName: '',
    menuUrl:        '',
    whatsapp:       '',
    address:        '',
    openHours:      '',
    currency:       'FCFA',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'menu', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🍽️ Menu Restaurant</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>QR menu interactif — vos clients scannent et commandent</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Informations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom du restaurant" placeholder="Chez Kofi" value={form.restaurantName} onChange={set('restaurantName')} />
              <Input label="Lien du menu (PDF ou site)" placeholder="https://..." value={form.menuUrl} onChange={set('menuUrl')} hint="Google Drive, Notion, ou votre site" />
              <Input label="WhatsApp commande" placeholder="+225 07 00 00 00 00" value={form.whatsapp} onChange={set('whatsapp')} hint="Numéro pour recevoir les commandes" />
              <Input label="Adresse" placeholder="Cocody, Abidjan" value={form.address} onChange={set('address')} />
              <Input label="Horaires" placeholder="Lun–Sam : 8h–22h" value={form.openHours} onChange={set('openHours')} />
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu carte</p>
          <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC' }}>{form.restaurantName || 'Votre Restaurant'}</p>
                {form.address && <p style={{ color: '#6B7280', fontSize: 12, marginTop: 4 }}>📍 {form.address}</p>}
              </div>
              <span style={{ fontSize: 32 }}>🍽️</span>
            </div>
            {form.openHours && (
              <div style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 6, padding: '8px 12px', marginBottom: 14 }}>
                <p style={{ color: '#06B6D4', fontSize: 12 }}>⏰ {form.openHours}</p>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {form.menuUrl && (
                <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>📋</span>
                  <span style={{ color: '#818CF8', fontSize: 13 }}>Voir le menu</span>
                </div>
              )}
              {form.whatsapp && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>💬</span>
                  <span style={{ color: '#10B981', fontSize: 13 }}>Commander sur WhatsApp</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
