'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PROFILE_MODULE } from '@/lib/modules';
import styles from './modules.module.css';

interface Module {
  type: string;
  name: string;
  emoji: string;
  desc: string;
  pro: boolean;
}

interface ActiveModule {
  id: string;
  type: string;
  isActive: boolean;
}

interface Props {
  modules: readonly Module[];
  activeModules: ActiveModule[];
  profileId: string;
  isPro: boolean;
}

export default function ModulesClient({ modules, activeModules, profileId, isPro }: Props) {
  const router = useRouter();
  const [states, setStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    activeModules.forEach((m) => { init[m.type] = m.isActive; });
    init[PROFILE_MODULE] ??= true; // on until explicitly switched off
    return init;
  });
  const [loading, setLoading] = useState<string | null>(null);

  async function toggle(type: string, requiresPro: boolean) {
    if (requiresPro && !isPro) return;
    setLoading(type);
    const current = !!states[type];

    const res = await fetch('/api/modules', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type, isActive: !current, profileId }),
    });

    if (res.ok) {
      // Single-module plans swap the digital profile with the toggled module
      const { changes = {} } = await res.json() as { changes?: Record<string, boolean> };
      setStates((prev) => ({ ...prev, ...changes, [type]: !current }));
    }
    setLoading(null);
  }

  return (
    <div className={styles.wrap}>
      <p className={styles.note}>
        {isPro
          ? 'Tous les modules sont disponibles. Activez ceux qui vous servent.'
          : 'Offre Essentiel : 1 module actif à la fois (il remplace le profil digital). Les modules PRO demandent l’offre Pro.'}
      </p>

      <ul className={styles.grid}>
        {modules.map((mod) => {
          const isActive  = !!states[mod.type];
          const isLocked  = mod.pro && !isPro;
          const isLoading = loading === mod.type;
          const href      = mod.type === PROFILE_MODULE ? '/dashboard/profile' : `/dashboard/modules/${mod.type}`;

          return (
            <li key={mod.type} className={`${styles.tile} ${isActive ? styles.on : ''} ${isLocked ? styles.locked : ''}`}>
              <div className={styles.top}>
                <span className={styles.emoji} aria-hidden>{mod.emoji}</span>
                {isLocked ? (
                  <span className={styles.pro}>PRO</span>
                ) : (
                  <button type="button" role="switch" aria-checked={isActive} aria-label={`${isActive ? 'Désactiver' : 'Activer'} ${mod.name}`}
                    className={styles.switchBtn} onClick={() => toggle(mod.type, mod.pro)} disabled={isLoading}>
                    <span className={styles.switch}><span className={styles.knob}>{isLoading && <span className={styles.spin} />}</span></span>
                  </button>
                )}
              </div>
              <p className={styles.name}>{mod.name}</p>
              <p className={styles.desc}>{mod.desc}</p>
              {isActive && !isLocked
                ? <Link href={href} className={styles.configure}>Configurer →</Link>
                : <span className={styles.state}>{isLocked ? 'Offre Pro' : 'Inactif'}</span>}
            </li>
          );
        })}
      </ul>

      <div className={styles.custom}>
        <span className={styles.customIcon} aria-hidden>✦</span>
        <p className={styles.customText}><strong>Module sur mesure</strong><span>Un besoin spécifique ? Nous le développons pour vous.</span></p>
        <button type="button" className={styles.customBtn} onClick={() => router.push('/dashboard/modules/custom')}>Demander →</button>
      </div>
    </div>
  );
}
