'use client';

import Link from 'next/link';
import styles from './nav.module.css';

export interface NavLink { href: string; label: string }

/** Drop-down menu shown under the header on small screens. */
export default function MobileNavigation({ id, links, isLoggedIn, onClose }: {
  id: string; links: NavLink[]; isLoggedIn: boolean; onClose: () => void;
}) {
  return (
    <div id={id} className={styles.menu}>
      <nav aria-label="Menu principal">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={styles.menuLink} onClick={onClose}>
            {l.label}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M9 18l6-6-6-6" /></svg>
          </Link>
        ))}
      </nav>
      <div className={styles.menuActions}>
        <Link href={isLoggedIn ? '/dashboard' : '/login'} className={styles.login} onClick={onClose}>
          {isLoggedIn ? 'Mon dashboard' : 'Connexion'}
        </Link>
        <Link href="/register" className={styles.order} onClick={onClose}>Commander ma carte</Link>
      </div>
    </div>
  );
}
