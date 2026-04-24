'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function ActivateClient({
  nfcId,
  isLoggedIn,
}: {
  nfcId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [code, setCode]         = useState(nfcId);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  async function activate() {
    if (!code.trim()) { setError('Entre ton code NFC.'); return; }
    setLoading(true);
    setError('');

    const res  = await fetch('/api/activate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ nfcId: code }),
    });
    const data = await res.json() as { error?: string };

    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push('/dashboard/card'), 1800);
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>🎉</span>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F8F9FC', marginBottom: 8 }}>
          Carte activée !
        </p>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Redirection vers ton dashboard...
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 48, display: 'block', marginBottom: 20 }}>🔐</span>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC', marginBottom: 10 }}>
          Connecte-toi pour activer ta carte
        </p>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 32 }}>
          Tu as besoin d&apos;un compte We Connect pour lier ta carte NFC à ton profil.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <a href={`/register?redirect=/activate${nfcId ? `?nfc=${nfcId}` : ''}`}>
            <Button variant="gradient" size="lg" style={{ width: '100%' }}>
              Créer mon compte →
            </Button>
          </a>
          <a href={`/login?redirect=/activate${nfcId ? `?nfc=${nfcId}` : ''}`}>
            <Button variant="secondary" size="md" style={{ width: '100%' }}>
              J&apos;ai déjà un compte
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
        Entre le code NFC imprimé à l&apos;intérieur de l&apos;emballage de ta carte (ex : <span style={{ color: '#818CF8', fontFamily: 'Space Mono, monospace', fontSize: 12 }}>WC-A1B2C3</span>).
      </p>

      <div style={{ marginBottom: 20 }}>
        <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
          Code NFC
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="WC-XXXXXX"
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
            borderRadius: 8,
            padding: '14px 16px',
            color: '#F8F9FC',
            fontFamily: 'Space Mono, monospace',
            fontSize: 16,
            letterSpacing: 4,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p style={{ color: '#EF4444', fontSize: 12, marginTop: 8 }}>{error}</p>
        )}
      </div>

      <Button variant="gradient" size="lg" loading={loading} onClick={activate} style={{ width: '100%' }}>
        {loading ? 'Activation...' : 'Activer ma carte ⚡'}
      </Button>

      <p style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', marginTop: 16 }}>
        Le code se trouve sur l&apos;autocollant à l&apos;intérieur de la boîte.
      </p>
    </div>
  );
}
