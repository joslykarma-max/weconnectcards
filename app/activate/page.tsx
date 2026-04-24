import { getSession } from '@/lib/session';
import ActivateClient from './ActivateClient';
import LogoStacked from '@/components/logo/LogoStacked';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ nfc?: string }>;
}

export default async function ActivatePage({ searchParams }: Props) {
  const { nfc }   = await searchParams;
  const session   = await getSession();
  const isLoggedIn = !!session;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090C',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 48 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <LogoStacked symbolSize="sm" />
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 460,
        background: '#0D0E14',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16,
        padding: 40,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.1))',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}>
            💳
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', marginBottom: 8 }}>
            Activer ma carte NFC
          </h1>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            {nfc ? `Code détecté : ${nfc}` : 'Lie ta carte physique à ton profil We Connect'}
          </p>
        </div>

        <ActivateClient nfcId={nfc ?? ''} isLoggedIn={isLoggedIn} />
      </div>

      {isLoggedIn && (
        <a href="/dashboard" style={{ color: '#6B7280', fontSize: 13, marginTop: 24, textDecoration: 'none' }}>
          ← Retour au dashboard
        </a>
      )}
    </div>
  );
}
