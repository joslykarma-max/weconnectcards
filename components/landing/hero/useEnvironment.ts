'use client';

import { useSyncExternalStore } from 'react';

/** Live media-query match; `false` during server rendering. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

const noSubscribe = () => () => {};

/** Low-end device or data saver: fewer moving parts. */
export function useLiteMode(): boolean {
  return useSyncExternalStore(
    noSubscribe,
    () => {
      const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
      return (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2 || !!nav.connection?.saveData;
    },
    () => false,
  );
}

/** Whether the document is currently visible (tab in the foreground). */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      document.addEventListener('visibilitychange', onChange);
      return () => document.removeEventListener('visibilitychange', onChange);
    },
    () => document.visibilityState === 'visible',
    () => true,
  );
}
