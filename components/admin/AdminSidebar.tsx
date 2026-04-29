'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    href: '/admin',
    label: 'Vue d\'ensemble',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
    exact: true,
  },
  {
    href: '/admin/cards',
    label: 'Commandes / Cartes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
    exact: false,
  },
  {
    href: '/admin/clients',
    label: 'Clients',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    exact: false,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220,
      minHeight: '100vh',
      background: 'var(--t-sidebar)',
      borderRight: '1px solid rgba(239,68,68,0.15)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 14px',
      flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{ marginBottom: 32, paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{
            width: 24, height: 24, borderRadius: 4,
            background: 'linear-gradient(135deg, #EF4444, #F97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#F8F9FC' }}>
            We Connect
          </span>
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', paddingLeft: 32 }}>
          Admin Panel
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 6,
                textDecoration: 'none',
                color: isActive ? '#F8F9FC' : '#6B7280',
                background: isActive ? 'rgba(239,68,68,0.1)' : 'transparent',
                border: isActive ? '1px solid rgba(239,68,68,0.2)' : '1px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ flexShrink: 0, color: isActive ? '#EF4444' : 'currentColor' }}>{item.icon}</span>
              <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 16, marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <Link
          href="/dashboard"
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            borderRadius: 6, textDecoration: 'none', color: '#6B7280',
            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
            transition: 'color 0.2s',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
          </svg>
          Retour au dashboard
        </Link>
      </div>
    </aside>
  );
}
