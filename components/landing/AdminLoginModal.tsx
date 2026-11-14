'use client';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

// Loaded on demand from the footer, so the Firebase Auth SDK stays out of the landing bundle
export default function AdminLoginModal({ onClose }: { onClose: () => void }) {
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
