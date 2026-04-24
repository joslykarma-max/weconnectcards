'use client';

import { Suspense, useState, FormEvent } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const plan         = searchParams.get('plan') ?? 'essentiel';

  const [form, setForm]     = useState({ name: '', email: '', password: '', username: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.');
        setLoading(false);
        return;
      }

      // Sign in with Firebase to get an ID token, then create session cookie
      const credential = await signInWithEmailAndPassword(auth, form.email, form.password);
      const idToken    = await credential.user.getIdToken();
      await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken }),
      });

      router.push('/dashboard');
    } catch {
      setError('Erreur de connexion. Réessayez.');
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 460 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Badge variant="gradient" className="mb-4">
          Plan {plan.charAt(0).toUpperCase() + plan.slice(1)}
        </Badge>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 10, marginTop: 12 }}>
          Créer mon compte.
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 15 }}>
          Commencez à partager votre identité en 2 minutes.
        </p>
      </div>

      <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 36 }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            label="Nom complet"
            placeholder="Sophie Martin"
            value={form.name}
            onChange={set('name')}
            required
          />
          <Input
            label="Email"
            type="email"
            placeholder="vous@example.com"
            value={form.email}
            onChange={set('email')}
            required
          />
          <Input
            label="Nom d'utilisateur"
            placeholder="sophie-martin"
            value={form.username}
            onChange={set('username')}
            hint="weconnect.io/votre-username"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            placeholder="Min. 8 caractères"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
          />

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </p>
          )}

          <Button type="submit" variant="gradient" size="lg" loading={loading} style={{ width: '100%', marginTop: 4 }}>
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </Button>

          <p style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', lineHeight: 1.7 }}>
            En créant un compte, vous acceptez nos{' '}
            <a href="/cgu" style={{ color: '#818CF8', textDecoration: 'none' }}>CGU</a>
            {' '}et notre{' '}
            <a href="/privacy" style={{ color: '#818CF8', textDecoration: 'none' }}>politique de confidentialité</a>.
          </p>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Déjà un compte ?{' '}
            <Link href="/login" style={{ color: '#818CF8', textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div style={{ width: '100%', maxWidth: 460, textAlign: 'center', padding: 40 }}>
        <div style={{ color: '#6B7280', fontSize: 14 }}>Chargement...</div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
