'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import cx from '@/components/dashboard/shell/compact.module.css';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

export default function PreviewClient({
  username,
  isPublic: initialPublic,
}: {
  username:  string;
  isPublic:  boolean;
}) {
  const publicUrl   = `${APP_URL}/${username}`;
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [copied,   setCopied]   = useState(false);
  const [toggling, setToggling] = useState(false);
  const [tab, setTab]           = useState<'page' | 'qr' | 'partager'>('page');

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

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&bgcolor=0D0E14&color=818CF8&data=${encodeURIComponent(`${publicUrl}?src=qr`)}`;

  if (!username) {
    return (
      <div style={{ maxWidth: 560, margin: '40px auto', textAlign: 'center', padding: 48, background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 12 }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>👤</span>
        <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--t-text)', marginBottom: 8 }}>
          Aucun username défini
        </p>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 14, marginBottom: 24 }}>
          Définis ton username dans le profil pour activer ta page publique.
        </p>
        <Link href="/dashboard/profile">
          <Button variant="gradient" size="md">Configurer mon profil →</Button>
        </Link>
      </div>
    );
  }

  const SHARES = [
    { label: '💬 Partager sur WhatsApp', href: `https://wa.me/?text=Découvrez mon profil professionnel : ${encodeURIComponent(publicUrl)}`, color: '#047857', bg: '#ECFDF5' },
    { label: '💼 Partager sur LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`, color: '#0A66C2', bg: '#EFF6FF' },
    { label: '📧 Envoyer par e-mail',     href: `mailto:?subject=Mon profil We Connect&body=Voici mon profil : ${publicUrl}`, color: '#4338CA', bg: '#EEF2FF' },
  ];

  return (
    <div className={cx.fill}>
      {/* Public / private switch */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 18, background: isPublic ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${isPublic ? '#BBF7D0' : '#FECACA'}` }}>
        <div>
          <p style={{ margin: 0, color: isPublic ? '#047857' : '#B91C1C', fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 14 }}>
            {isPublic ? 'Profil public — visible par tous' : 'Profil privé — non visible'}
          </p>
          <p style={{ margin: 0, color: '#64748B', fontSize: 12 }}>{isPublic ? 'Vos contacts peuvent ouvrir votre page.' : 'Activez-le pour partager votre carte.'}</p>
        </div>
        <button type="button" role="switch" aria-checked={isPublic} aria-label="Profil public" onClick={togglePublic} disabled={toggling}
          style={{ width: 52, height: 44, border: 'none', background: 'none', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
          <span style={{ position: 'relative', width: 48, height: 28, borderRadius: 999, background: isPublic ? '#10B981' : '#CBD5E1', transition: 'background 0.3s' }}>
            <span style={{ position: 'absolute', top: 4, left: isPublic ? 24 : 4, width: 20, height: 20, borderRadius: '50%', background: '#fff', transition: 'left 0.3s cubic-bezier(0.23,1,0.32,1)', boxShadow: '0 1px 3px rgba(15,23,42,0.3)' }} />
          </span>
        </button>
      </div>

      <div className={cx.tabs} role="tablist" aria-label="Aperçu">
        {([['page', 'Ma page'], ['qr', 'QR code'], ['partager', 'Partager']] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`${cx.tab} ${tab === k ? cx.tabOn : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className={cx.content} role="tabpanel">
        {tab === 'page' && (
          <div className={cx.card} style={{ padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 6px' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 1.5, color: '#64748B', textTransform: 'uppercase' }}>Aperçu en direct</span>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: '#4F46E5', textDecoration: 'none' }}>Ouvrir ↗</a>
            </div>
            {isPublic ? (
              <iframe src={`/${username}?preview=1`} title="Aperçu du profil public" style={{ flex: 1, minHeight: 360, width: '100%', border: 'none', borderRadius: 14, display: 'block', background: '#fff' }} />
            ) : (
              <p className={cx.empty}>🔒 Activez le profil public pour voir l’aperçu.</p>
            )}
          </div>
        )}

        {tab === 'qr' && (
          <div className={cx.card} style={{ alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR code de votre page" width={200} height={200} style={{ borderRadius: 16, boxShadow: '0 8px 24px -10px rgba(15,42,68,0.4)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', maxWidth: 420, background: '#F4F7FB', border: '1px solid #EDF1F6', borderRadius: 14, padding: '6px 6px 6px 14px' }}>
              <span style={{ color: '#4F46E5', flex: 1, fontFamily: 'Space Mono, monospace', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{publicUrl}</span>
              <button type="button" onClick={copy} style={{ minHeight: 40, padding: '0 14px', borderRadius: 10, border: 'none', cursor: 'pointer', background: copied ? '#D1FAE5' : '#E0E7FF', color: copied ? '#047857' : '#3730A3', fontWeight: 700, fontSize: 13 }}>
                {copied ? '✓ Copié' : 'Copier'}
              </button>
            </div>
            <a href={qrUrl} download={`qr-${username}.png`} style={{ width: '100%', maxWidth: 420, minHeight: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, background: '#0F172A', color: '#fff', fontWeight: 700, fontSize: 14.5, textDecoration: 'none', boxShadow: '0 3px 0 #000' }}>
              ⬇ Télécharger le QR code
            </a>
          </div>
        )}

        {tab === 'partager' && (
          <div className={cx.card} style={{ justifyContent: 'flex-start' }}>
            <p className={cx.cardTitle}>Partager votre page</p>
            {SHARES.map((sh) => (
              <a key={sh.label} href={sh.href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', minHeight: 52, padding: '0 16px', borderRadius: 16, background: sh.bg, color: sh.color, fontSize: 15, fontWeight: 600, textDecoration: 'none' }}>
                {sh.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
