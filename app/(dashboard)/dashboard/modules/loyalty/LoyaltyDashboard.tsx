'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type RewardTier = { stamps: number; reward: string };
type Customer   = { phone: string; stamps: number; lastStampAt: string | null; createdAt: string };

type Config = {
  businessName: string;
  expiryDays:  string;
  stampEmoji:  string;
  stampCode:   string;
  tiers:       RewardTier[];
};

export default function LoyaltyDashboard({ initialConfig, customers }: { initialConfig: Config; customers: Customer[] }) {
  const router = useRouter();
  const [form, setForm]     = useState<Config>(initialConfig);
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const [showCode, setShowCode] = useState(false);

  const set = (k: keyof Omit<Config, 'tiers'>) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  function setTier(i: number, key: keyof RewardTier, value: string | number) {
    setForm(p => {
      const tiers = [...p.tiers];
      tiers[i] = { ...tiers[i], [key]: key === 'stamps' ? Number(value) || 0 : value };
      return { ...p, tiers };
    });
  }

  function addTier() {
    setForm(p => {
      const max = p.tiers.length > 0 ? Math.max(...p.tiers.map(t => t.stamps)) : 0;
      return { ...p, tiers: [...p.tiers, { stamps: max + 5, reward: '' }] };
    });
  }

  function removeTier(i: number) {
    setForm(p => ({ ...p, tiers: p.tiers.filter((_, idx) => idx !== i) }));
  }

  async function save() {
    setSaving(true);
    const sortedTiers = [...form.tiers].sort((a, b) => a.stamps - b.stamps);
    await fetch('/api/modules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'loyalty', config: { ...form, tiers: sortedTiers } }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  }

  const sortedTiers = [...form.tiers].sort((a, b) => a.stamps - b.stamps);
  const firstTierStamps = sortedTiers.length > 0 ? sortedTiers[0].stamps : 10;
  const maxTierStamps   = sortedTiers.length > 0 ? sortedTiers[sortedTiers.length - 1].stamps : 10;
  const previewStamps   = 3;

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
        <button className="module-back-btn" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🎯 Carte de fidélité</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Récompensez vos clients avec des tampons digitaux</p>
        </div>
      </div>

      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div>
          <p style={{ color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Comment ça fonctionne ?</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7 }}>
            <strong style={{ color: '#F8F9FC' }}>Vous</strong> avez la carte NFC. Le client scanne, entre son numéro et voit <strong style={{ color: '#F8F9FC' }}>sa propre carte</strong>. Après chaque achat, dites-lui le <strong style={{ color: '#F8F9FC' }}>code tampon</strong> — il le saisit et son tampon s&apos;ajoute. Chaque <strong style={{ color: '#F8F9FC' }}>palier</strong> débloque une récompense différente.
          </p>
        </div>
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Colonne gauche */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Code tampon */}
          <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(6,182,212,0.06))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: 20 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#818CF8', textTransform: 'uppercase', marginBottom: 10 }}>🔑 Code tampon</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>
              Dites ce code à voix haute au client après chaque achat. Changez-le quand vous voulez.
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
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Configuration générale</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom de votre commerce" placeholder="Café du Plateau" value={form.businessName} onChange={set('businessName')} />
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

        {/* Colonne droite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Paliers de récompense */}
          <Card padding="md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>Paliers de récompense</h3>
              <button onClick={addTier}
                style={{ fontSize: 13, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '5px 12px', color: '#818CF8', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
                + Ajouter
              </button>
            </div>

            {form.tiers.length === 0 && (
              <p style={{ color: '#4B5563', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>
                Aucun palier. Cliquez sur « + Ajouter » pour commencer.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sortedTiers.map((tier, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
                  <div style={{ width: 76, flexShrink: 0 }}>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Tampons</p>
                    <input
                      type="number" min={1}
                      value={tier.stamps}
                      onChange={e => setTier(form.tiers.indexOf(tier), 'stamps', e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 6px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 16, outline: 'none', textAlign: 'center', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 }}>Récompense</p>
                    <input
                      type="text"
                      value={tier.reward}
                      onChange={e => setTier(form.tiers.indexOf(tier), 'reward', e.target.value)}
                      placeholder="Ex: 1 café offert"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                  {form.tiers.length > 1 && (
                    <button onClick={() => removeTier(form.tiers.indexOf(tier))}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '10px 10px', color: '#EF4444', cursor: 'pointer', flexShrink: 0, fontSize: 16, lineHeight: 1 }}>
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {sortedTiers.length > 0 && (
              <p style={{ color: '#4B5563', fontSize: 11, marginTop: 14, fontFamily: 'Space Mono, monospace', lineHeight: 1.5 }}>
                La carte repart à zéro après le palier {maxTierStamps} tampon{maxTierStamps > 1 ? 's' : ''}.
              </p>
            )}
          </Card>

          {/* Aperçu */}
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu (exemple {previewStamps}/{firstTierStamps})</p>
            <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', borderRadius: 12, padding: 20 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#F8F9FC', marginBottom: 2, textAlign: 'center' }}>
                {form.businessName || 'Votre Commerce'}
              </p>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#818CF8', letterSpacing: 2, marginBottom: 14, textTransform: 'uppercase', textAlign: 'center' }}>Carte de fidélité</p>

              {/* Barre de progression */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#818CF8' }}>{previewStamps} tampons</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>→ {firstTierStamps} pour 1er palier</span>
                </div>
                <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', position: 'relative' }}>
                  <div style={{ height: '100%', width: `${(previewStamps / (maxTierStamps || 1)) * 100}%`, background: 'linear-gradient(90deg, #6366F1, #818CF8)', borderRadius: 2 }} />
                  {sortedTiers.map((tier, i) => (
                    <div key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${(tier.stamps / (maxTierStamps || 1)) * 100}%`, width: 2, background: 'rgba(255,255,255,0.3)', transform: 'translateX(-50%)' }} />
                  ))}
                </div>
              </div>

              {/* Liste des paliers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {sortedTiers.map((tier, i) => {
                  const achieved = previewStamps >= tier.stamps;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: achieved ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '6px 10px', border: `1px solid ${achieved ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                      <span style={{ fontSize: 12, width: 16, textAlign: 'center', flexShrink: 0 }}>{achieved ? '✅' : '🔒'}</span>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', flexShrink: 0 }}>{tier.stamps}✗</span>
                      <span style={{ color: achieved ? '#10B981' : '#9CA3AF', fontSize: 11, fontFamily: 'DM Sans, sans-serif', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tier.reward || '—'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Clients fidèles */}
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
                        {Array.from({ length: Math.min(firstTierStamps, 10) }).map((_, i) => (
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
