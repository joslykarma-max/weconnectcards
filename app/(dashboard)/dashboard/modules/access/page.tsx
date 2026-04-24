'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AccessPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    zoneName:    '',
    description: '',
    pin:         '',
    startTime:   '08:00',
    endTime:     '18:00',
    days:        ['lun', 'mar', 'mer', 'jeu', 'ven'],
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const toggleDay = (d: string) =>
    setForm(p => ({
      ...p,
      days: p.days.includes(d) ? p.days.filter(x => x !== d) : [...p.days, d],
    }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'access', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const allDays = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'];

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🔑 Clé d&apos;accès</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Contrôle d&apos;accès par zone avec plages horaires</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Zone d&apos;accès</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom de la zone" placeholder="Bureau RH — 3ème étage" value={form.zoneName} onChange={set('zoneName')} />
              <Input label="Description" placeholder="Accès réservé au personnel autorisé" value={form.description} onChange={set('description')} />
              <Input label="Code PIN (optionnel)" type="password" placeholder="••••" value={form.pin} onChange={set('pin')} hint="Laissez vide pour accès sans PIN" />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Plage horaire</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <Input label="De" type="time" value={form.startTime} onChange={set('startTime')} />
                  <Input label="À" type="time" value={form.endTime} onChange={set('endTime')} />
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Jours autorisés</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {allDays.map(d => (
                    <button key={d} onClick={() => toggleDay(d)}
                      style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${form.days.includes(d) ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)'}`, background: form.days.includes(d) ? 'rgba(99,102,241,0.2)' : 'transparent', color: form.days.includes(d) ? '#818CF8' : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase' }}>
                      {d}
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
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu badge</p>
          <div style={{ background: 'linear-gradient(135deg, #111827, #1f2937)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#9CA3AF', textTransform: 'uppercase' }}>Badge d&apos;accès</span>
              <span style={{ fontSize: 24 }}>🔑</span>
            </div>
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#10B981', fontSize: 16 }}>✓</span>
              <span style={{ color: '#10B981', fontSize: 13, fontWeight: 600 }}>Accès autorisé</span>
            </div>
            <p style={{ color: '#F8F9FC', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
              {form.zoneName || 'Zone à définir'}
            </p>
            {form.description && <p style={{ color: '#6B7280', fontSize: 12, marginBottom: 12 }}>{form.description}</p>}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>⏰ {form.startTime} – {form.endTime}</p>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>📅 {form.days.join(', ')}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
