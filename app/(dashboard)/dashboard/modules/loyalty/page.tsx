'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function LoyaltyPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName:  '',
    stampGoal:     '10',
    reward:        '',
    expiryDays:    '365',
    stampEmoji:    '⭐',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'loyalty', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const filled = parseInt(form.stampGoal) || 10;
  const stamps = Array.from({ length: filled });

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🎯 Carte de fidélité</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Récompensez vos clients avec des tampons digitaux</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom de votre commerce" placeholder="Café du Coin" value={form.businessName} onChange={set('businessName')} />
              <Input label="Récompense offerte" placeholder="1 café offert" value={form.reward} onChange={set('reward')} />
              <Input label="Tampons nécessaires" type="number" placeholder="10" value={form.stampGoal} onChange={set('stampGoal')} hint="Nombre de tampons pour obtenir la récompense" />
              <Input label="Validité (jours)" type="number" placeholder="365" value={form.expiryDays} onChange={set('expiryDays')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Icône tampon</p>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['⭐', '☕', '🍕', '🛍️', '💈', '🎵'].map(e => (
                    <button key={e} onClick={() => setForm(p => ({ ...p, stampEmoji: e }))}
                      style={{ fontSize: 22, background: form.stampEmoji === e ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${form.stampEmoji === e ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu</p>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#F8F9FC', marginBottom: 4 }}>
              {form.businessName || 'Votre Commerce'}
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#818CF8', letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }}>
              Carte de fidélité
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
              {stamps.map((_, i) => (
                <div key={i} style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', background: i < 3 ? 'rgba(99,102,241,0.6)' : 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                  {i < 3 ? form.stampEmoji : ''}
                </div>
              ))}
            </div>
            <p style={{ color: '#9CA3AF', fontSize: 12 }}>
              3 / {filled} — Récompense : <span style={{ color: '#818CF8' }}>{form.reward || 'à définir'}</span>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
