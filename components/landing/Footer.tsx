'use client';
import { useState } from 'react';
import Link from 'next/link';
import LogoHorizontal from '@/components/logo/LogoHorizontal';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

function AdminLoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();
      const res = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error('session');
      router.push('/admin');
    } catch {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        background: '#0D0E14',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: 12,
        padding: 32,
        width: '100%',
        maxWidth: 360,
        boxShadow: '0 0 40px rgba(239,68,68,0.1)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: 'linear-gradient(135deg, #EF4444, #F97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#F8F9FC', lineHeight: 1 }}>
              Admin
            </p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#EF4444', textTransform: 'uppercase', marginTop: 3 }}>
              Accès restreint
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="email"
            placeholder="Email admin"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '10px 14px',
              color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 6, padding: '10px 14px',
              color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
              outline: 'none', width: '100%', boxSizing: 'border-box',
            }}
          />

          {error && (
            <p style={{ color: '#EF4444', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              background: loading ? 'rgba(239,68,68,0.5)' : 'linear-gradient(135deg, #EF4444, #F97316)',
              border: 'none', borderRadius: 6, padding: '11px',
              color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer', transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Connexion…' : 'Accéder au panel →'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Footer() {
  const [showAdmin, setShowAdmin] = useState(false);

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
