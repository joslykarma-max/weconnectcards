'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const PRIMARY_ITEMS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/profile',
    label: 'Profil',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/modules',
    label: 'Modules',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    ),
  },
  {
    href: '/dashboard/card',
    label: 'Carte',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
];

const MORE_ITEMS = [
  {
    href:  '/dashboard/qrcode',
    label: 'QR Codes',
    icon:  '⬛',
  },
  {
    href:  '/dashboard/analytics',
    label: 'Analytics',
    icon:  '📊',
  },
  {
    href:  '/dashboard/contacts',
    label: 'Contacts',
    icon:  '👥',
  },
  {
    href:  '/dashboard/team',
    label: 'Équipe',
    icon:  '🏢',
  },
  {
    href:  '/dashboard/preview',
    label: 'Aperçu',
    icon:  '👁️',
  },
  {
    href:  '/dashboard/settings',
    label: 'Paramètres',
    icon:  '⚙️',
  },
];

const MORE_PATHS = MORE_ITEMS.map(i => i.href);

export default function BottomNav() {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  const isMoreActive = MORE_PATHS.some(p => pathname.startsWith(p));

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 88, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Slide-up drawer */}
      <div style={{
        position: 'fixed',
        bottom: open ? 64 : -260,
        left: 0,
        right: 0,
        zIndex: 89,
        background: '#12141C',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px 16px 0 0',
        padding: '16px 20px 8px',
        transition: 'bottom 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {MORE_ITEMS.map(item => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  padding: '12px 8px',
                  borderRadius: 10,
                  background: isActive ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  textDecoration: 'none',
                  color: isActive ? '#818CF8' : '#9CA3AF',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 0.5, lineHeight: 1, textAlign: 'center' }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <nav
        className="bottom-nav"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          background: '#0D0E14',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          zIndex: 90,
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        {PRIMARY_ITEMS.map((item) => {
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                padding: '8px 0',
                color: isActive ? '#818CF8' : '#6B7280',
                textDecoration: 'none',
                flex: 1,
                transition: 'color 0.2s',
              }}
            >
              {item.icon}
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 0.5, lineHeight: 1 }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  width: 24,
                  height: 2,
                  borderRadius: '0 0 2px 2px',
                  background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
                }} />
              )}
            </Link>
          );
        })}

        {/* Plus button */}
        <button
          onClick={() => setOpen(p => !p)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
            padding: '8px 0',
            color: isMoreActive || open ? '#818CF8' : '#6B7280',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            flex: 1,
            transition: 'color 0.2s',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ transform: open ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 0.5, lineHeight: 1 }}>
            {open ? 'Fermer' : 'Plus'}
          </span>
          {(isMoreActive && !open) && (
            <div style={{
              position: 'absolute',
              top: 0,
              width: 24,
              height: 2,
              borderRadius: '0 0 2px 2px',
              background: 'linear-gradient(90deg, #6366F1, #06B6D4)',
            }} />
          )}
        </button>
      </nav>
    </>
  );
}
