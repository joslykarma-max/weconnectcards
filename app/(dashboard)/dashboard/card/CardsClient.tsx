'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LogoSymbol from '@/components/logo/LogoSymbol';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type Card = {
  id: string;
  edition: string;
  status: string;
  nfcId?: string | null;
  orderedAt: string;
  activatedAt?: string | null;
};

type Profile = {
  username: string;
  displayName: string;
  title?: string | null;
  theme: string;
} | null;

const EDITION_STYLES: Record<string, { bg: string; textColor: string; accent: string; name: string }> = {
  midnight: { bg: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)', textColor: '#F8F9FC', accent: '#6366F1', name: 'Midnight' },
  electric: { bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338CA 100%)', textColor: '#F8F9FC', accent: '#818CF8', name: 'Electric' },
  glass:    { bg: 'linear-gradient(135deg, #0c1a2e 0%, #0e2340 100%)', textColor: '#F8F9FC', accent: '#06B6D4', name: 'Glass'    },
  metal:    { bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', textColor: '#F8F9FC', accent: '#9CA3AF', name: 'Métal'    },
};

type BadgeVariant = 'success' | 'warning' | 'neutral' | 'electric' | 'cyan' | 'danger' | 'gradient';
const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  active:   { variant: 'success',  label: 'Active'      },
  pending:  { variant: 'warning',  label: 'En attente'  },
  shipped:  { variant: 'electric', label: 'Expédiée'    },
  inactive: { variant: 'neutral',  label: 'Inactive'    },
};

function CardVisual({ edition, profile }: { edition: string; profile: Profile }) {
  const style = EDITION_STYLES[edition] ?? EDITION_STYLES.midnight;
  return (
    <div style={{
      width: '100%', maxWidth: 340, aspectRatio: '85.6/54',
      background: style.bg, borderRadius: 12, padding: 20,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      border: `1px solid ${style.accent}33`,
      boxShadow: `0 24px 48px rgba(0,0,0,0.4), 0 0 32px ${style.accent}22`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 32, height: 22, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', borderRadius: 3, opacity: 0.9 }} />
        <div style={{ position: 'relative', width: 28, height: 28 }}>
          {[28, 19, 10].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: s, height: s, transform: 'translate(-50%,-50%)',
              borderRadius: '50%',
              border: `1.5px solid ${style.accent}${Math.round((0.6 - i * 0.15) * 255).toString(16).padStart(2, '0')}`,
            }} />
          ))}
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: style.textColor, marginBottom: 2 }}>
          {profile?.displayName ?? 'Votre nom'}
        </p>
        {profile?.title && (
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: 2, color: `${style.textColor}99`, textTransform: 'uppercase' }}>
            {profile.title}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoSymbol width={40} height={27} />
        <div style={{ padding: '2px 6px', background: `${style.accent}22`, border: `1px solid ${style.accent}44`, borderRadius: 3 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 6, color: style.accent, letterSpacing: 2, textTransform: 'uppercase' }}>
            {style.name.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${style.accent}, ${style.accent}55)` }} />
    </div>
  );
}

export default function CardsClient({ cards, profile }: { cards: Card[]; profile: Profile }) {
  const router = useRouter();
  const [selectedEdition, setSelectedEdition] = useState(profile?.theme ?? 'midnight');
  const [nfcCode, setNfcCode]   = useState('');
  const [activating, setActivating] = useState(false);
  const [activateError, setActivateError] = useState('');
  const [activateSuccess, setActivateSuccess] = useState(false);

  async function handleActivate() {
    if (!nfcCode.trim()) { setActivateError('Entre ton code NFC.'); return; }
    setActivating(true);
    setActivateError('');
    const res  = await fetch('/api/activate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfcId: nfcCode }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setActivateError(data.error ?? 'Erreur.'); setActivating(false); return; }
    setActivateSuccess(true);
    setNfcCode('');
    setTimeout(() => router.refresh(), 800);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 860 }}>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t-text)', marginBottom: 4 }}>
          Mes cartes NFC
        </h2>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>
          {cards.length === 0
            ? 'Aucune carte commandée pour l\'instant.'
            : `${cards.length} carte${cards.length > 1 ? 's' : ''} sur ce compte.`}
        </p>
      </div>

      {/* Edition preview */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <CardVisual edition={selectedEdition} profile={profile} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1, minWidth: 180 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase' }}>
            Édition
          </p>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {Object.entries(EDITION_STYLES).map(([key, s]) => (
              <button
                key={key}
                onClick={() => setSelectedEdition(key)}
                title={s.name}
                style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: s.bg,
                  border: `2px solid ${selectedEdition === key ? s.accent : 'rgba(255,255,255,0.1)'}`,
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              />
            ))}
          </div>
          <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '10px 14px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', marginBottom: 3 }}>
              Format
            </p>
            <p style={{ color: 'var(--t-text)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>85.6 × 54 mm — NFC NTAG213/215</p>
          </div>
          <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '10px 14px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', marginBottom: 3 }}>
              Compatibilité
            </p>
            <p style={{ color: 'var(--t-text)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>iOS & Android · Portée 10 cm</p>
          </div>
        </div>
      </div>

      {/* Cards list */}
      {cards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Mes cartes
          </p>
          {cards.map((card) => {
            const status = STATUS_BADGE[card.status] ?? STATUS_BADGE.pending;
            return (
              <div key={card.id} style={{
                background: '#12141C',
                border: `1px solid ${card.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 8, padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                  background: EDITION_STYLES[card.edition]?.bg ?? EDITION_STYLES.midnight.bg,
                  border: `1px solid ${(EDITION_STYLES[card.edition]?.accent ?? '#6366F1')}33`,
                }} />
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <Badge variant={status.variant} dot>{status.label}</Badge>
                    {card.nfcId && (
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--t-text-muted)', letterSpacing: 2 }}>
                        {card.nfcId}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--t-text-muted)', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                    {EDITION_STYLES[card.edition]?.name ?? card.edition}
                    {' · '}
                    Commandée le {new Date(card.orderedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {card.activatedAt && (
                  <p style={{ color: '#10B981', fontSize: 11, fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                    ✓ Activée
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Activate a card */}
      <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 24 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
          Activer une carte
        </p>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          Tu as reçu ta carte ? Entre le code NFC imprimé dans l&apos;emballage pour l&apos;activer.
        </p>
        {activateSuccess ? (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '12px 16px', color: '#10B981', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
            ✅ Carte activée avec succès !
          </div>
        ) : (
          <>
            <input
              value={nfcCode}
              onChange={(e) => setNfcCode(e.target.value.toUpperCase())}
              placeholder="WC-XXXXXX"
              style={{
                width: '100%', marginBottom: 10,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${activateError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 6, padding: '10px 14px',
                color: 'var(--t-text)', fontFamily: 'Space Mono, monospace',
                fontSize: 13, letterSpacing: 3, outline: 'none', boxSizing: 'border-box',
              }}
            />
            {activateError && <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 10 }}>{activateError}</p>}
            <Button variant="gradient" size="md" loading={activating} onClick={handleActivate} style={{ width: '100%' }}>
              {activating ? 'Activation...' : 'Activer ma carte ⚡'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
