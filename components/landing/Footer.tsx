'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';

const AdminLoginModal = dynamic(() => import('./AdminLoginModal'), { ssr: false });

const PRODUCT_LINKS = [
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Features',          href: '/features' },
  { label: 'Tarifs',            href: '/tarifs' },
  { label: 'Modules',           href: '/#modules' },
  { label: 'Équipe',            href: '/features' },
];

export default function Footer() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <footer className="lp-section" style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      background: '#0D0E14',
      paddingTop: 60, paddingBottom: 'max(40px, env(safe-area-inset-bottom))',
    }}>
      <div className="footer-main" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 60 }}>
          {/* Brand */}
          <div>
            <Link href="/" aria-label="We Connect — accueil" style={{ display: 'inline-flex', background: '#FFFFFF', borderRadius: 14, padding: '10px 14px' }}>
              <Image src="/logo-wordmark.png" alt="We Connect" width={175} height={30} style={{ height: 30, width: 'auto' }} />
            </Link>
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.8, marginTop: 20, maxWidth: 280 }}>
              La plateforme NFC premium pour les professionnels. Partagez votre identité en un geste.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              {['LinkedIn', 'Instagram', 'Twitter'].map((s) => (
                <a key={s} href="#" style={{
                  width: 36, height: 36,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: 6,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6B7280',
                  textDecoration: 'none',
                  fontSize: 10,
                  fontFamily: 'Space Mono, monospace',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#818CF8'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >
                  {s[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Produit */}
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20 }}>
              Produit
            </p>
            {PRODUCT_LINKS.map((item) => (
              <Link key={item.label} href={item.href} style={{ display: 'block', color: '#9CA3AF', fontSize: 14, textDecoration: 'none', padding: '6px 0', marginBottom: 4, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F9FC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Légal */}
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20 }}>
              Légal
            </p>
            {['Politique de confidentialité', 'CGU', 'Mentions légales', 'Cookies'].map((item) => (
              <a key={item} href="#" style={{ display: 'block', color: '#6B7280', fontSize: 14, textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F9FC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >
                {item}
              </a>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 20 }}>
              Contact
            </p>
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.8 }}>
              hello@weconnect.io
            </p>
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>
              Cotonou, Bénin
            </p>
            <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.8, marginTop: 8 }}>
              Afrique francophone
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
            © 2025 We Connect · Cotonou, Bénin · Tous droits réservés
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
              Your Identity. One Touch.
            </p>
            {/* Admin access — discreet red dot */}
            <button
              onClick={() => setShowAdmin(true)}
              title="Admin"
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: '#EF4444',
                border: 'none', cursor: 'pointer', padding: 0,
                opacity: 0.4, transition: 'opacity 0.2s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.4'; }}
            />
          </div>
        </div>
      </div>

      {showAdmin && <AdminLoginModal onClose={() => setShowAdmin(false)} />}
    </footer>
  );
}
