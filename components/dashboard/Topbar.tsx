'use client';

import { useRouter, usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':           'Overview',
  '/dashboard/card':      'Ma carte',
  '/dashboard/profile':   'Mon profil',
  '/dashboard/preview':   'Aperçu carte',
  '/dashboard/analytics': 'Analytics',
  '/dashboard/modules':   'Modules',
  '/dashboard/contacts':  'Contacts',
  '/dashboard/team':      'Équipe',
  '/dashboard/settings':  'Paramètres',
};

export default function Topbar({ userEmail }: { userEmail?: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const title    = PAGE_TITLES[pathname] ?? 'Dashboard';

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <header style={{
      height: 64,
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: '#08090C',
      flexShrink: 0,
    }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC' }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Quick links */}
        <a
          href="/dashboard/profile"
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px',
            background: 'rgba(99,102,241,0.1)',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 6,
            textDecoration: 'none',
            color: '#818CF8',
            fontSize: 13,
            fontFamily: 'DM Sans, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
            <polyline points="15 3 21 3 21 9"/>
            <line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Voir ma page
        </a>

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'Syne, sans-serif',
          }}>
            {userEmail?.charAt(0).toUpperCase() ?? 'U'}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 6,
              padding: '8px 12px',
              color: '#6B7280',
              fontSize: 13,
              fontFamily: 'DM Sans, sans-serif',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#F8F9FC'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#6B7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
}
