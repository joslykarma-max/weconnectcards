'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import LogoHorizontal from '@/components/logo/LogoHorizontal';
import Button from '@/components/ui/Button';

const navLinks = [
  { href: '#how-it-works', label: 'Comment ça marche' },
  { href: '#features',     label: 'Features' },
  { href: '#pricing',      label: 'Tarifs' },
];

export default function Nav() {
  const [scrolled, setScrolled]     = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  const navBg = scrolled || menuOpen ? 'rgba(8,9,12,0.96)' : 'transparent';
  const navBlur = scrolled || menuOpen ? 'blur(14px)' : 'none';
  const navBorder = scrolled || menuOpen ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent';

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
        background: navBg,
        backdropFilter: navBlur,
        borderBottom: navBorder,
      }}
    >
      {/* ── Top bar ── */}
      <div style={{
        maxWidth: 1280,
        margin: '0 auto',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 24,
      }}>
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <LogoHorizontal symbolSize="sm" />
        </Link>

        {/* Desktop links */}
        <div className="nav-links-desktop" style={{ display: 'flex', gap: 32, alignItems: 'center', flex: 1, justifyContent: 'center' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#9CA3AF', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F9FC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="nav-actions-desktop" style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          {isLoggedIn ? (
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">Dashboard →</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm">Connexion</Button>
            </Link>
          )}
          <Link href="/register">
            <Button variant="gradient" size="sm">Commander ma carte</Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          style={{
            background: 'none',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            cursor: 'pointer',
            padding: '8px 10px',
            color: '#F8F9FC',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.2s',
          }}
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>
      </div>

      {/* ── Mobile menu drawer ── */}
      <div style={{
        overflow: 'hidden',
        maxHeight: menuOpen ? 500 : 0,
        transition: 'max-height 0.35s cubic-bezier(0.23,1,0.32,1)',
        borderTop: menuOpen ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      }}>
        <div style={{ padding: '12px 24px 28px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 16,
                color: '#9CA3AF',
                textDecoration: 'none',
                padding: '13px 4px',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'block',
              }}
            >
              {link.label}
            </a>
          ))}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setMenuOpen(false)} style={{ display: 'block' }}>
                <Button variant="ghost" size="md" style={{ width: '100%' }}>Dashboard →</Button>
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{ display: 'block' }}>
                <Button variant="ghost" size="md" style={{ width: '100%' }}>Connexion</Button>
              </Link>
            )}
            <Link href="/register" onClick={() => setMenuOpen(false)} style={{ display: 'block' }}>
              <Button variant="gradient" size="md" style={{ width: '100%' }}>
                Commander ma carte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
