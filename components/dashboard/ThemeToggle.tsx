'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(document.documentElement.classList.contains('light'));
  }, []);

  function toggle() {
    const html = document.documentElement;
    const next = !isLight;
    html.classList.toggle('light', next);
    try { localStorage.setItem('wc-theme', next ? 'light' : 'dark'); } catch {}
    setIsLight(next);
  }

  return (
    <button
      onClick={toggle}
      title={isLight ? 'Passer en mode sombre' : 'Passer en mode clair'}
      style={{
        width: 36,
        height: 36,
        borderRadius: 8,
        background: isLight ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.05)',
        border: isLight
          ? '1px solid rgba(99,102,241,0.2)'
          : '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: isLight ? '#6366F1' : '#9CA3AF',
        transition: 'all 0.2s',
        flexShrink: 0,
      }}
    >
      {isLight ? (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      ) : (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      )}
    </button>
  );
}
