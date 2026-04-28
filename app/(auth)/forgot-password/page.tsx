'use client';

import { useState, FormEvent } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState('');
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch {
      setError('Aucun compte trouvé avec cet email.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 420 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 32, letterSpacing: '-1px', color: '#F8F9FC', marginBottom: 10 }}>
          Mot de passe oublié
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 15 }}>
          Entrez votre email et nous vous enverrons un lien de réinitialisation.
        </p>
      </div>

      <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 36 }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>📬</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#10B981', marginBottom: 8 }}>
              Email envoyé !
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.6 }}>
              Vérifiez votre boîte mail (et vos spams). Le lien expire dans 1 heure.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Input
              label="Email"
              type="email"
              placeholder="vous@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && (
              <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
                {error}
              </p>
            )}

            <Button type="submit" variant="gradient" size="lg" loading={loading} style={{ width: '100%' }}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </Button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24 }}>
          <Link href="/login" style={{ color: '#818CF8', fontSize: 14, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
}
