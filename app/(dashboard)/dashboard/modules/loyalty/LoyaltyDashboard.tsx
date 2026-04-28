'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Customer = { phone: string; stamps: number; lastStampAt: string | null; createdAt: string };

type Config = {
  businessName: string; reward: string; stampGoal: string;
  expiryDays: string; stampEmoji: string; stampCode: string;
};

export default function LoyaltyDashboard({ initialConfig, customers }: { initialConfig: Config; customers: Customer[] }) {
  const router = useRouter();
  const [form, setForm]   = useState<Config>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [showCode, setShowCode] = useState(false);

  const set = (k: keyof Config) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'loyalty', config: form }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  }

  const filled = parseInt(form.stampGoal) || 10;
  const goal   = Math.min(filled, 10);

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🎯 Carte de fidélité</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Récompensez vos clients avec des tampons digitaux</p>
        </div>
      </div>

      {/* Explication du flux */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Comment ça fonctionne ?</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: '#F8F9FC' }}>Vous</strong> avez la carte NFC. Votre client scanne, entre son numéro et voit <strong style={{ color: '#F8F9FC' }}>sa propre carte</strong> avec ses tampons. Pour valider un tampon après un achat, dites-lui le <strong style={{ color: '#F8F9FC' }}>code tampon</strong> (défini ci-dessous) — il le saisit et son tampon s&apos;ajoute automatiquement.
          </p>
        </div>
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Code tampon — priorité haute */}
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: 20 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#818CF8', textTransform: 'uppercase', marginBottom: 10 }}>🔑 Code tampon</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
              Dites ce code à voix haute au client après chaque achat. Il le saisit sur son écran pour valider le tampon. Changez-le quand vous voulez.
            </p>
            <div style={{ position: 'relative' }}>
              <input
                type={showCode ? 'text' : 'password'}
                value={form.stampCode}
                onChange={set('stampCode')}
                placeholder="Ex: 7842"
                maxLength={12}
                style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '14px 48px 14px 16px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 22, letterSpacing: 6, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
              />
              <button type="button" onClick={() => setShowCode(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}>
                {showCode
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Configuration du programme</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom de votre commerce" placeholder="Café du Plateau" value={form.businessName} onChange={set('businessName')} />
              <Input label="Récompense offerte" placeholder="1 café offert, -20%..." value={form.reward} onChange={set('reward')} />
              <Input label="Tampons nécessaires" type="number" placeholder="10" value={form.stampGoal} onChange={set('stampGoal')} hint="Nombre de tampons pour déclencher la récompense" />
              <Input label="Validité de la carte (jours)" type="number" placeholder="365" value={form.expiryDays} onChange={set('expiryDays')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 10 }}>Icône tampon</p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {['⭐', '☕', '🍕', '🛍️', '💈', '🎵', '🍔', '🧁'].map(e => (
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Aperçu */}
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu (exemple 3/{filled})</p>
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#F8F9FC', marginBottom: 4 }}>
                {form.businessName || 'Votre Commerce'}
              </p>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#818CF8', letterSpacing: 2, marginBottom: 20, textTransform: 'uppercase' }}>Carte de fidélité</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 12 }}>
                {Array.from({ length: Math.min(goal, filled) }).map((_, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 8, background: i < 3 ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.06)', border: `1px solid ${i < 3 ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                    {i < 3 ? form.stampEmoji : ''}
                  </div>
                ))}
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
                <div style={{ height: '100%', width: `${(3 / filled) * 100}%`, background: 'linear-gradient(90deg, #6366F1, #818CF8)', borderRadius: 2 }} />
              </div>
              <p style={{ color: '#9CA3AF', fontSize: 12 }}>
                3 / {filled} — <span style={{ color: '#818CF8' }}>{form.reward || 'récompense à définir'}</span>
              </p>
            </div>
          </Card>

          {/* Liste des clients fidèles */}
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>
              Clients fidèles · {customers.length}
            </p>
            {customers.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <span style={{ fontSize: 28, display: 'block', marginBottom: 8 }}>📱</span>
                <p style={{ color: '#6B7280', fontSize: 13 }}>Aucun client encore.</p>
                <p style={{ color: '#4B5563', fontSize: 12, marginTop: 4 }}>Les clients apparaissent ici dès qu&apos;ils scannent et entrent leur numéro.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {customers.map((c) => (
                  <div key={c.phone} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, fontFamily: 'Syne, sans-serif', fontWeight: 700, color: '#818CF8' }}>
                      {c.stamps}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>{c.phone}</p>
                      {c.lastStampAt && (
                        <p style={{ color: '#6B7280', fontSize: 11 }}>
                          Dernier tampon : {new Date(c.lastStampAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                        </p>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: Math.min(filled, 10) }).map((_, i) => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i < c.stamps ? '#6366F1' : 'rgba(255,255,255,0.08)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
