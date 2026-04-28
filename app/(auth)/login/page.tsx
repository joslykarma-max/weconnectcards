'use client';

import { useState, FormEvent, Suspense } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') ?? '/dashboard';
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });

      if (!res.ok) throw new Error('session');
      router.push(redirect);
    } catch {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 10 }}>
          Bon retour.
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 15 }}>
          Connectez-vous à votre espace We Connect.
        </p>
      </div>

      <div style={{
        background: '#181B26',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 8,
        padding: 36,
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Input
            label="Email"
            type="email"
            placeholder="vous@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <Button type="submit" variant="gradient" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/forgot-password" style={{ color: '#6B7280', fontSize: 13, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
            Mot de passe oublié ?
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Pas encore de compte ?{' '}
            <Link href="/register" style={{ color: '#818CF8', textDecoration: 'none' }}>
              Commander ma carte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
