'use client';

import { useState } from 'react';
import LogoSymbol from '@/components/logo/LogoSymbol';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

type Card    = { id: string; edition: string; status: string; nfcId?: string | null; activatedAt?: Date | null } | null;
type Profile = { username: string; displayName: string; title?: string | null; theme: string } | null;

const EDITION_STYLES: Record<string, { bg: string; textColor: string; accent: string; name: string }> = {
  midnight: { bg: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)', textColor: '#F8F9FC', accent: '#6366F1', name: 'Midnight' },
  electric: { bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338CA 100%)', textColor: '#F8F9FC', accent: '#818CF8', name: 'Electric' },
  glass:    { bg: 'linear-gradient(135deg, #0c1a2e 0%, #0e2340 100%)', textColor: '#F8F9FC', accent: '#06B6D4', name: 'Glass' },
  metal:    { bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', textColor: '#F8F9FC', accent: '#9CA3AF', name: 'Métal' },
};

type BadgeVariant = 'success' | 'warning' | 'neutral' | 'electric' | 'cyan' | 'danger' | 'gradient';
const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  active:   { variant: 'success',  label: 'Active' },
  pending:  { variant: 'warning',  label: 'En attente' },
  shipped:  { variant: 'electric', label: 'Expédiée' },
  inactive: { variant: 'neutral',  label: 'Inactive' },
};

export default function CardPreview({ card, profile }: { card: Card; profile: Profile }) {
  const [selectedEdition, setSelectedEdition] = useState(card?.edition ?? profile?.theme ?? 'midnight');
  const edition = EDITION_STYLES[selectedEdition] ?? EDITION_STYLES.midnight;
  const status  = STATUS_BADGE[card?.status ?? 'pending'] ?? STATUS_BADGE.pending;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, alignItems: 'start', maxWidth: 900 }}>
      {/* 3D Card Preview */}
      <div>
        <div style={{
          width: '100%',
          maxWidth: 380,
          aspectRatio: '85.6/54',
          background: edition.bg,
          borderRadius: 12,
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          border: `1px solid ${edition.accent}33`,
          boxShadow: `0 32px 64px rgba(0,0,0,0.5), 0 0 40px ${edition.accent}22`,
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        }}>
          {/* Top */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: 38, height: 26, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', borderRadius: 3, opacity: 0.9 }} />
            {/* NFC circles */}
            <div style={{ position: 'relative', width: 32, height: 32 }}>
              {[32, 22, 12].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', top: '50%', left: '50%',
                  width: s, height: s, transform: 'translate(-50%,-50%)',
                  borderRadius: '50%',
                  border: `1.5px solid ${edition.accent}${Math.round((0.6 - i * 0.15) * 255).toString(16).padStart(2, '0')}`,
                }} />
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: edition.textColor, marginBottom: 3 }}>
              {profile?.displayName ?? 'Votre nom'}
            </p>
            {profile?.title && (
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: `${edition.textColor}99`, textTransform: 'uppercase' }}>
                {profile.title}
              </p>
            )}
          </div>

          {/* Bottom */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <LogoSymbol width={52} height={35} />
            <div style={{ padding: '3px 8px', background: `${edition.accent}22`, border: `1px solid ${edition.accent}44`, borderRadius: 3 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, color: edition.accent, letterSpacing: 2, textTransform: 'uppercase' }}>
                ÉDITION {edition.name.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Bottom accent line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${edition.accent}, ${edition.accent}55)` }} />
        </div>

        {/* Edition selector */}
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          {Object.entries(EDITION_STYLES).map(([key, style]) => (
            <button
              key={key}
              onClick={() => setSelectedEdition(key)}
              title={style.name}
              style={{
                width: 32, height: 32, borderRadius: 6,
                background: style.bg,
                border: `2px solid ${selectedEdition === key ? style.accent : 'rgba(255,255,255,0.1)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>
      </div>

      {/* Info + actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Status */}
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 24 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>
            Statut de la carte
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Badge variant={status.variant} dot>{status.label}</Badge>
            {card?.nfcId && (
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 2 }}>
                NFC: {card.nfcId}
              </span>
            )}
          </div>

          {!card && (
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Vous n&apos;avez pas encore de carte physique. Commandez-en une pour activer NFC.
            </p>
          )}

          {profile?.username && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '12px 14px', marginBottom: 16 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', marginBottom: 4 }}>
                URL de votre profil
              </p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#818CF8' }}>
                weconnect.io/{profile.username}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Button variant="gradient" size="md" style={{ width: '100%' }}>
              Commander une nouvelle carte
            </Button>
            {card?.status === 'active' && (
              <Button variant="secondary" size="md" style={{ width: '100%' }}>
                Télécharger QR Code
              </Button>
            )}
          </div>
        </div>

        {/* Specs */}
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 24 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>
            Spécifications
          </p>
          {[
            ['Format',       '85.6 × 54 mm — ISO ID-1'],
            ['Technologie',  'NFC NTAG213/215'],
            ['Compatibilité','iOS & Android'],
            ['Portée',       '10 cm'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: '#6B7280', textTransform: 'uppercase' }}>
                {label}
              </span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF' }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
