'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const LEVELS = [
  { key: 'silver',   label: 'Silver',   color: '#9CA3AF', bg: 'rgba(156,163,175,0.15)' },
  { key: 'gold',     label: 'Gold',     color: '#F59E0B', bg: 'rgba(245,158,11,0.15)'  },
  { key: 'platinum', label: 'Platinum', color: '#06B6D4', bg: 'rgba(6,182,212,0.15)'   },
  { key: 'vip',      label: 'VIP',      color: '#6366F1', bg: 'rgba(99,102,241,0.15)'  },
];

export default function MemberPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    clubName:    '',
    memberName:  '',
    memberId:    '',
    level:       'silver',
    expiryDate:  '',
    benefits:    '',
    website:     '',
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
      body:    JSON.stringify({ type: 'member', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const currentLevel = LEVELS.find(l => l.key === form.level) ?? LEVELS[0];

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🎫 Carte Membre</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Adhésions, niveaux et avantages exclusifs</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Informations membre</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Club / Organisation" placeholder="Cercle des Entrepreneurs" value={form.clubName} onChange={set('clubName')} />
              <Input label="Nom du membre" placeholder="Kofi Mensah" value={form.memberName} onChange={set('memberName')} />
              <Input label="Numéro de membre" placeholder="CDE-2025-001" value={form.memberId} onChange={set('memberId')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Niveau</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  {LEVELS.map(l => (
                    <button key={l.key} onClick={() => setForm(p => ({ ...p, level: l.key }))}
                      style={{ flex: 1, padding: '8px 4px', borderRadius: 6, border: `1px solid ${form.level === l.key ? l.color : 'rgba(255,255,255,0.08)'}`, background: form.level === l.key ? l.bg : 'transparent', color: form.level === l.key ? l.color : '#6B7280', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, cursor: 'pointer', textTransform: 'uppercase' }}>
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Date d'expiration" type="date" value={form.expiryDate} onChange={set('expiryDate')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Avantages inclus</p>
                <textarea value={form.benefits} onChange={set('benefits')} rows={3}
                  placeholder="- 20% de réduction sur tous les services&#10;- Accès VIP aux événements&#10;- Support prioritaire"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu carte membre</p>
          <div style={{ background: `linear-gradient(135deg, #0D0E14, #181B26)`, border: `1px solid ${currentLevel.color}33`, borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ background: currentLevel.bg, border: `1px solid ${currentLevel.color}44`, borderRadius: 4, padding: '3px 10px' }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: currentLevel.color, textTransform: 'uppercase' }}>{currentLevel.label}</span>
              </div>
              <span style={{ fontSize: 20 }}>🎫</span>
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', marginBottom: 4 }}>
              {form.memberName || 'Nom du membre'}
            </p>
            <p style={{ color: currentLevel.color, fontSize: 13, marginBottom: 16 }}>
              {form.clubName || 'Club / Organisation'}
            </p>
            {form.memberId && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '8px 12px', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>#{form.memberId}</span>
              </div>
            )}
            {form.benefits && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 12 }}>
                {form.benefits.split('\n').slice(0, 3).map((b, i) => b.trim() && (
                  <p key={i} style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 4 }}>{b}</p>
                ))}
              </div>
            )}
            {form.expiryDate && (
              <p style={{ color: '#6B7280', fontSize: 11, marginTop: 12, fontFamily: 'Space Mono, monospace' }}>
                Expire le {new Date(form.expiryDate).toLocaleDateString('fr-FR')}
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
