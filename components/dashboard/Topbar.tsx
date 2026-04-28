'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

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
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <header className="topbar-header" style={{
      height: 64,
      borderBottom: 'var(--t-border-full)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      background: 'var(--t-sidebar)',
      flexShrink: 0,
    }}>
      <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: 'var(--t-text)' }}>
        {title}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* "Voir ma page" — hidden on mobile via CSS */}
        <a
          href="/dashboard/preview"
          className="topbar-viewlink"
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

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Hamburger menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            style={{
              width: 36, height: 36,
              borderRadius: '50%',
              background: open
                ? 'rgba(99,102,241,0.15)'
                : 'linear-gradient(135deg, #6366F1, #06B6D4)',
              border: open ? '1px solid rgba(99,102,241,0.4)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s',
            }}
          >
            {open ? (
              /* X */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* Initial / avatar */
              <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Syne, sans-serif' }}>
                {userEmail?.charAt(0).toUpperCase() ?? 'U'}
              </span>
            )}
          </button>

          {open && (
            <div style={{
              position: 'absolute',
              top: 44,
              right: 0,
              width: 220,
              background: 'var(--t-sidebar)',
              border: 'var(--t-border-full)',
              borderRadius: 10,
              boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
              zIndex: 100,
              overflow: 'hidden',
            }}>
              {/* User info */}
              <div style={{ padding: '14px 16px', borderBottom: 'var(--t-border-full)' }}>
                <p style={{ fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: 1, color: 'var(--t-text-muted)', marginBottom: 3 }}>Connecté en tant que</p>
                <p style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', color: 'var(--t-text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userEmail ?? '—'}
                </p>
              </div>

              {/* Voir ma page (visible en mobile dans le menu) */}
              <a
                href="/dashboard/preview"
                onClick={() => setOpen(false)}
                className="topbar-menulink"
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px',
                  textDecoration: 'none',
                  color: 'var(--t-text-muted)',
                  fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif',
                  borderBottom: 'var(--t-border-full)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--t-surface)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Voir ma page publique
              </a>

              {/* Déconnexion */}
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  color: '#EF4444',
                  fontSize: 14,
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.06)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
