'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileNavigation, { type NavLink } from './MobileNavigation';
import styles from './nav.module.css';

const NAV_LINKS: NavLink[] = [
  { href: '/comment-ca-marche', label: 'Comment ça marche' },
  { href: '/features',          label: 'Features' },
  { href: '/tarifs',            label: 'Tarifs' },
];

export default function Nav() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const rootRef   = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const menuId    = useId();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => { if (d.authenticated) setIsLoggedIn(true); })
      .catch(() => {});
  }, []);

  // Close the menu on Escape or a tap outside the header
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenuOpen(false); burgerRef.current?.focus(); } };
    const onDown = (e: PointerEvent) => { if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('pointerdown', onDown); };
  }, [menuOpen]);

  return (
    <header ref={rootRef} className={styles.nav}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logo} aria-label="We Connect — accueil">
          <Image src="/logo-symbol.png" alt="" width={57} height={30} priority className={styles.logoSymbol} />
          <Image src="/logo-wordmark.png" alt="" width={175} height={30} priority className={styles.logoWordmark} />
        </Link>

        <nav className={styles.links} aria-label="Navigation principale">
          {NAV_LINKS.map((l) => <Link key={l.href} href={l.href} className={styles.link}>{l.label}</Link>)}
        </nav>

        <div className={styles.actions}>
          <Link href={isLoggedIn ? '/dashboard' : '/login'} className={styles.login}>
            {isLoggedIn ? 'Dashboard →' : 'Connexion'}
          </Link>
          <Link href="/register" className={styles.order}>
            <span className={styles.orderShort}>Commander</span>
            <span className={styles.orderLong}>Commander ma carte</span>
          </Link>
          <button
            ref={burgerRef}
            type="button"
            className={styles.burger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && <MobileNavigation id={menuId} links={NAV_LINKS} isLoggedIn={isLoggedIn} onClose={() => setMenuOpen(false)} />}
    </header>
  );
}
