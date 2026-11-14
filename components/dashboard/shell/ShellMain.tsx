'use client';

import { usePathname } from 'next/navigation';
import styles from './shell.module.css';

// Sections already redesigned in the light style (the others keep their dark surface for now)
export const LIGHT_SECTIONS = ['/dashboard/modules', '/dashboard/profile', '/dashboard/card'];

/** Home is the full-screen launcher; other sections opened directly by URL get a padded page. */
export default function ShellMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome   = pathname === '/dashboard';
  const isLight  = LIGHT_SECTIONS.includes(pathname);
  return (
    <main className={styles.main}>
      {isHome ? children : <div className={`${styles.page} ${isLight ? '' : styles.legacyPage}`}>{children}</div>}
    </main>
  );
}
