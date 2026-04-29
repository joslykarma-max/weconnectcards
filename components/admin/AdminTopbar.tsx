'use client';

import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/dashboard/ThemeToggle';

export default function AdminTopbar() {
  const router = useRouter();

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <header style={{
      height: 56,
      borderBottom: '1px solid rgba(239,68,68,0.12)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'var(--t-sidebar)',
      flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase' }}>
        Admin Panel
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <ThemeToggle />
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'none', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '6px 12px', cursor: 'pointer',
            color: 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 12,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--t-text-muted)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'; }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Déconnexion
        </button>
      </div>
    </header>
  );
}
