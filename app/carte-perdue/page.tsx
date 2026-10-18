import type { Metadata } from 'next';
import Link from 'next/link';
import LogoStacked from '@/components/logo/LogoStacked';

export const metadata: Metadata = {
  title: 'Carte perdue · We Connect',
  robots: { index: false },
};

// Shown when someone taps a card its owner has deactivated
export default function LostCardPage() {
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
        padding: '40px 32px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 72, height: 72,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 32,
        }}>
          💳
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', marginBottom: 10 }}>
          Cette carte a été perdue
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 28, fontFamily: 'DM Sans, sans-serif' }}>
          Son propriétaire l&apos;a désactivée. Si vous l&apos;avez trouvée, contactez We Connect.
        </p>
        <Link
          href="/contact"
          style={{
            display: 'inline-block',
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #4338CA, #6366F1)',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            textDecoration: 'none',
          }}
        >
          Contacter We Connect
        </Link>
      </div>
    </div>
  );
}
