'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function EventPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    eventName:   '',
    date:        '',
    time:        '',
    venue:       '',
    description: '',
    capacity:    '',
    price:       '',
    organizer:   '',
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
      body:    JSON.stringify({ type: 'event', config: form }),
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
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🎟️ Pass Événement</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Billetterie NFC et check-in automatique</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Détails de l&apos;événement</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom de l'événement" placeholder="Soirée Gala 2025" value={form.eventName} onChange={set('eventName')} />
              <Input label="Organisateur" placeholder="Nom / Organisation" value={form.organizer} onChange={set('organizer')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input label="Date" type="date" value={form.date} onChange={set('date')} />
                <Input label="Heure" type="time" value={form.time} onChange={set('time')} />
              </div>
              <Input label="Lieu / Venue" placeholder="Hôtel Ivoire, Abidjan" value={form.venue} onChange={set('venue')} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input label="Capacité" type="number" placeholder="200" value={form.capacity} onChange={set('capacity')} />
                <Input label="Prix (FCFA)" type="number" placeholder="5000" value={form.price} onChange={set('price')} />
              </div>
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Description</p>
                <textarea value={form.description} onChange={set('description')} rows={3}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Pass numérique</p>
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #4338CA)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase' }}>Pass Événement</span>
              <span style={{ fontSize: 20 }}>🎟️</span>
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F8F9FC', marginBottom: 4 }}>
              {form.eventName || 'Nom de l\'événement'}
            </p>
            {form.organizer && <p style={{ color: '#818CF8', fontSize: 12, marginBottom: 16 }}>par {form.organizer}</p>}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.date && <p style={{ color: '#9CA3AF', fontSize: 13 }}>📅 {new Date(form.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} {form.time && `à ${form.time}`}</p>}
              {form.venue && <p style={{ color: '#9CA3AF', fontSize: 13 }}>📍 {form.venue}</p>}
              {form.price && <p style={{ color: '#10B981', fontSize: 13, fontWeight: 700 }}>🎫 {parseInt(form.price).toLocaleString('fr-FR')} FCFA</p>}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
