'use client';
import Link from 'next/link';
import LogoHorizontal from '@/components/logo/LogoHorizontal';

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(255,255,255,0.07)',
      background: '#0D0E14',
      padding: '60px 40px 40px',
    }}>
      <div className="footer-main" style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 60 }}>
          {/* Brand */}
          <div>
            <LogoHorizontal symbolSize="sm" showTagline />
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
            {['Comment ça marche', 'Features', 'Tarifs', 'Modules', 'Équipe'].map((item) => (
              <a key={item} href="#" style={{ display: 'block', color: '#6B7280', fontSize: 14, textDecoration: 'none', marginBottom: 12, transition: 'color 0.2s' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F9FC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6B7280')}
              >
                {item}
              </a>
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
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase' }}>
            Your Identity. One Touch.
          </p>
        </div>
      </div>
    </footer>
  );
}
