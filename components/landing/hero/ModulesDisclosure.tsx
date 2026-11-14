'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { MODULES } from '../modules-data';
import styles from './hero.module.css';

/** Collapsible list of the nine business modules. */
export default function ModulesDisclosure() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={styles.modules}>
      <button type="button" className={styles.modBtn} aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
        <span>Les modules métier<span className={styles.modCount}>{MODULES.length}</span></span>
        <svg className={`${styles.chev} ${open ? styles.chevOpen : ''}`} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div id={panelId} className={`${styles.modPanel} ${open ? styles.modPanelOpen : ''}`} inert={!open}>
        <div className={styles.modClip}>
          <div className={styles.modGrid}>
            {MODULES.map((m) => (
              <Link key={m.slug} href={`/modules/${m.slug}`} className={styles.modItem}>
                <span className={styles.modEmoji} aria-hidden>{m.emoji}</span>
                {m.name}
              </Link>
            ))}
          </div>
          <a href="#modules" className={styles.modAll}>Voir le détail des modules →</a>
        </div>
      </div>
    </div>
  );
}
