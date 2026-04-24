import Link from 'next/link';
import LogoHorizontal from '@/components/logo/LogoHorizontal';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#08090C',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Grid */}
      <div
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          opacity: 0.6,
        }}
      />
      {/* Glow */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, height: '60vh',
        background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 70%)',
      }} />

      {/* Nav */}
      <nav style={{ padding: '24px 40px', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'inline-flex' }}>
          <LogoHorizontal symbolSize="sm" />
        </Link>
      </nav>

      {/* Content */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
        position: 'relative',
        zIndex: 1,
      }}>
        {children}
      </main>
    </div>
  );
}
