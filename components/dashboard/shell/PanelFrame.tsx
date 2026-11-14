'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './shell.module.css';
import clair from './clair.module.css';

/**
 * Floating panel over the dashboard home (bottom sheet on phones, window on desktop).
 * Rendered by the intercepted routes in app/(dashboard)/dashboard/@panel, so the URL
 * follows the panel and the back button closes it.
 */
export default function PanelFrame({ title, children }: { title: string; children?: React.ReactNode }) {
  const router   = useRouter();
  const panelRef = useRef<HTMLElement>(null);

  const close = useCallback(() => {
    if (window.history.length > 1) router.back();
    else router.push('/dashboard');
  }, [router]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [close]);

  return (
    <div className={styles.overlay} onClick={close}>
      <section
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={styles.panel}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.panelHead}>
          <span className={styles.grabber} aria-hidden />
          <h2 className={styles.panelTitle}>{title}</h2>
          <button type="button" className={styles.close} onClick={close} aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </header>
        <div className={`${styles.panelBody} ${clair.scope} in-panel`}>{children}</div>
      </section>
    </div>
  );
}

/** Same frame while the section loads (shown instantly on tap). */
export function PanelLoading() {
  return (
    <div className={styles.overlay}>
      <section className={styles.panel} aria-busy="true" aria-label="Chargement">
        <header className={styles.panelHead}><span className={styles.grabber} aria-hidden /><h2 className={styles.panelTitle}>Chargement…</h2></header>
        <div className={styles.panelLoading}><span className={styles.spinner} /></div>
      </section>
    </div>
  );
}
