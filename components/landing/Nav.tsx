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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)',
        background: scrolled ? 'rgba(8,9,12,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '0 40px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 40,
        }}
      >
        <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <LogoHorizontal symbolSize="sm" />
        </Link>

        <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 14,
                color: '#9CA3AF',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#F8F9FC')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Connexion
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="gradient" size="sm">
              Commander ma carte
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
