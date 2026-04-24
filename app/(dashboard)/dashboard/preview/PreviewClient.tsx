'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function PreviewClient({
  username,
  isPublic: initialPublic,
}: {
  username:  string;
  isPublic:  boolean;
}) {
  const publicUrl   = `https://weconnect.cards/${username}`;
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [copied,   setCopied]   = useState(false);
  const [toggling, setToggling] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function togglePublic() {
    setToggling(true);
    await fetch('/api/profile', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isPublic: !isPublic }),
    });
    setIsPublic((p) => !p);
    setToggling(false);
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0D0E14&color=818CF8&data=${encodeURIComponent(publicUrl)}`;

  if (!username) {
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: 48, background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>👤</span>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC', marginBottom: 8 }}>
          Aucun username défini
        </p>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24 }}>
          Définis ton username dans le profil pour activer ta page publique.
        </p>
        <a href="/dashboard/profile">
          <Button variant="gradient" size="md">Configurer mon profil →</Button>
        </a>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Header */}
      <div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', marginBottom: 6 }}>
          Aperçu de ta carte NFC
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          C'est exactement ce que verront tes prospects quand ils scannent ta carte.
        </p>
      </div>

      {/* Status + toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: isPublic ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${isPublic ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, borderRadius: 8, padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18 }}>{isPublic ? '🟢' : '🔴'}</span>
          <div>
            <p style={{ color: isPublic ? '#10B981' : '#EF4444', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
              {isPublic ? 'Profil public — visible par tous' : 'Profil privé — non visible'}
            </p>
            <p style={{ color: '#6B7280', fontSize: 12 }}>
              {isPublic ? 'Tes prospects peuvent accéder à ta page.' : 'Active le profil pour partager ta carte.'}
            </p>
          </div>
        </div>
        <button
          onClick={togglePublic}
          disabled={toggling}
          style={{
            width: 52, height: 28, borderRadius: 14, border: 'none',
            background: isPublic ? '#10B981' : 'rgba(255,255,255,0.1)',
            position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
          }}
        >
          <span style={{
            position: 'absolute', top: 4,
            left: isPublic ? 28 : 4,
            width: 20, height: 20, borderRadius: '50%', background: '#fff',
            transition: 'left 0.3s cubic-bezier(0.23,1,0.32,1)',
          }} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

        {/* QR Code + link */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20 }}>
              QR Code — à imprimer ou partager
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt="QR Code"
                width={220}
                height={220}
                style={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 6, padding: '10px 14px' }}>
                <span style={{ color: '#818CF8', flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {publicUrl}
                </span>
                <button
                  onClick={copy}
                  style={{ background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.15)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)'}`, borderRadius: 4, padding: '4px 12px', color: copied ? '#10B981' : '#818CF8', fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s' }}
                >
                  {copied ? '✓ Copié !' : 'Copier'}
                </button>
              </div>
              <a href={qrUrl} download={`qr-${username}.png`}>
                <Button variant="secondary" size="sm" style={{ width: '100%' }}>
                  ⬇ Télécharger le QR Code
                </Button>
              </a>
            </div>
          </Card>

          {/* Share buttons */}
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>
              Partager le lien
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: '💬 Partager sur WhatsApp', href: `https://wa.me/?text=Découvrez mon profil professionnel : ${encodeURIComponent(publicUrl)}`, color: '#10B981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)' },
                { label: '💼 Partager sur LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`, color: '#0A66C2', bg: 'rgba(10,102,194,0.1)', border: 'rgba(10,102,194,0.2)' },
                { label: '📧 Envoyer par email',     href: `mailto:?subject=Mon profil We Connect&body=Voici mon profil : ${publicUrl}`, color: '#818CF8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: s.bg, border: `1px solid ${s.border}`, borderRadius: 6, textDecoration: 'none', color: s.color, fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500 }}>
                  {s.label}
                </a>
              ))}
            </div>
          </Card>
        </div>

        {/* Live preview */}
        <Card padding="sm">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '0 8px' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>
              Aperçu live
            </p>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textDecoration: 'none', textTransform: 'uppercase' }}>
              Ouvrir ↗
            </a>
          </div>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', background: '#0D0E14' }}>
            {isPublic ? (
              <iframe
                src={publicUrl}
                style={{ width: '100%', height: 520, border: 'none', display: 'block' }}
                title="Aperçu profil public"
              />
            ) : (
              <div style={{ height: 520, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 40 }}>🔒</span>
                <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', maxWidth: 200 }}>
                  Active le profil public pour voir l'aperçu
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
