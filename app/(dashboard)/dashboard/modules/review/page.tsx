'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ReviewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    googleUrl:    '',
    message:      'Votre avis compte beaucoup pour nous ! 🙏',
    targetStars:  '5',
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
      body:    JSON.stringify({ type: 'review', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 22, color: '#0F172A' }}>⭐ Tap to Review</h2>
          <p style={{ color: '#64748B', fontSize: 13 }}>Générez des avis Google en un seul tap NFC</p>
        </div>
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A', marginBottom: 18 }}>Configuration</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom du commerce" placeholder="Salon Beauté+" value={form.businessName} onChange={set('businessName')} />
              <Input label="Lien Google Reviews" placeholder="https://g.page/r/..." value={form.googleUrl} onChange={set('googleUrl')} hint="Trouvez-le dans Google Business Profile" />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#64748B', textTransform: 'uppercase', marginBottom: 8 }}>Message affiché au client</p>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={3}
                  style={{ width: '100%', background: 'rgba(15,23,42,0.03)', border: '1px solid rgba(15,23,42,0.1)', borderRadius: 6, padding: '10px 14px', color: '#0F172A', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#64748B', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu page client</p>
          <div style={{ background: 'linear-gradient(135deg, #F4F7FB, #FFFFFF)', borderRadius: 12, padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>⭐⭐⭐⭐⭐</div>
            <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 800, fontSize: 18, color: '#0F172A', marginBottom: 8 }}>
              {form.businessName || 'Votre Commerce'}
            </p>
            <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>
              {form.message}
            </p>
            <div style={{ background: 'linear-gradient(135deg, #6366F1, #06B6D4)', borderRadius: 8, padding: '14px', color: '#fff', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 15 }}>
              Laisser un avis Google →
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
