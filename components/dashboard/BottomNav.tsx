'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
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
    href: '/dashboard/analytics',
    label: 'Stats',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6"  y1="20" x2="6"  y2="14"/>
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
  {
    href: '/dashboard/settings',
    label: 'Plus',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
      </svg>
    ),
    isMore: true,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
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
      {items.map((item) => {
        const isMore = item.isMore;
        const isActive = isMore
          ? (pathname.startsWith('/dashboard/settings') ||
             pathname.startsWith('/dashboard/modules') ||
             pathname.startsWith('/dashboard/contacts') ||
             pathname.startsWith('/dashboard/team') ||
             pathname.startsWith('/dashboard/preview'))
          : item.href === '/dashboard'
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
            <span style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              letterSpacing: 0.5,
              lineHeight: 1,
            }}>
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
    </nav>
  );
}
