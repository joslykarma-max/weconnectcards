import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090C',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 16px',
      textAlign: 'center',
    }}>
      <div>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 24 }}>
          Erreur 404
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(60px, 12vw, 120px)', color: '#F8F9FC', letterSpacing: '-4px', lineHeight: 1, marginBottom: 24 }}>
          404
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 18, marginBottom: 40, maxWidth: 400, margin: '0 auto 40px' }}>
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '14px 28px',
            background: 'linear-gradient(135deg, #4338CA, #6366F1)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            textDecoration: 'none',
          }}
        >
          Retour à l&apos;accueil →
        </Link>
      </div>
    </div>
  );
}
