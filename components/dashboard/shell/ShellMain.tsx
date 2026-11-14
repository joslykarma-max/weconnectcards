'use client';

import { usePathname } from 'next/navigation';
import styles from './shell.module.css';
import clair from './clair.module.css';

/** Home is the full-screen launcher; sections opened directly by URL get a padded light page. */
export default function ShellMain({ children }: { children: React.ReactNode }) {
  const isHome = usePathname() === '/dashboard';
  return (
    <main className={styles.main}>
      {isHome ? children : <div className={`${styles.page} ${clair.scope}`}>{children}</div>}
    </main>
  );
}
