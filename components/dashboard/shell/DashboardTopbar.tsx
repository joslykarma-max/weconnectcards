'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import styles from './shell.module.css';

/** Light top bar: logo (home), back to home on sub-pages, preview and account menu. */
export default function DashboardTopbar({ email, initial }: { email?: string; initial: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef  = useRef<HTMLDivElement>(null);
  const isHome   = pathname === '/dashboard';

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setOpen(false); };
    const onKey  = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  async function signOut() {
    await fetch('/api/auth/session', { method: 'DELETE' });
    router.push('/login');
  }

  return (
    <header className={styles.topbar}>
      {isHome ? (
        <Link href="/dashboard" className={styles.brand} aria-label="Accueil du dashboard">
          <Image src="/logo-wordmark.png" alt="We Connect" width={152} height={26} priority />
        </Link>
      ) : (
        <Link href="/dashboard" className={styles.home}>← Accueil</Link>
      )}

      <div className={styles.topActions} ref={menuRef}>
        <Link href="/dashboard/preview" className={styles.iconBtn} aria-label="Aperçu de ma carte" title="Aperçu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
        </Link>
        <button type="button" className={styles.avatarBtn} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu" aria-label="Mon compte">
          {initial}
        </button>
        {open && (
          <div className={styles.menu} role="menu">
            {email && <p className={styles.menuEmail}>{email}</p>}
            <Link href="/dashboard/settings" className={styles.menuItem} role="menuitem" onClick={() => setOpen(false)}>⚙️ Paramètres</Link>
            <Link href="/annuaire" className={styles.menuItem} role="menuitem" onClick={() => setOpen(false)}>📖 Annuaire</Link>
            <button type="button" className={`${styles.menuItem} ${styles.menuDanger}`} role="menuitem" onClick={signOut}>↩︎ Déconnexion</button>
          </div>
        )}
      </div>
    </header>
  );
}
