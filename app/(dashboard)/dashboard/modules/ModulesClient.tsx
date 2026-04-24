'use client';

import { useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';

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
  const [states, setStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    activeModules.forEach((m) => { init[m.type] = m.isActive; });
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
      setStates((prev) => ({ ...prev, [type]: !current }));
    }
    setLoading(null);
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ color: '#9CA3AF', fontSize: 14 }}>
          {isPro ? 'Tous les modules sont disponibles.' : 'Certains modules nécessitent le plan Pro.'}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {modules.map((mod) => {
          const isActive  = !!states[mod.type];
          const isLocked  = mod.pro && !isPro;
          const isLoading = loading === mod.type;

          return (
            <div
              key={mod.type}
              style={{
                background: '#12141C',
                border: `1px solid ${isActive ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 8,
                padding: 24,
                transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
                opacity: isLocked ? 0.6 : 1,
                position: 'relative',
              }}
            >
              {isLocked && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <Badge variant="electric">PRO</Badge>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>{mod.emoji}</span>
                {/* Toggle */}
                <button
                  onClick={() => toggle(mod.type, mod.pro)}
                  disabled={isLocked || isLoading}
                  style={{
                    width: 44, height: 24,
                    borderRadius: 12,
                    border: 'none',
                    background: isActive ? '#6366F1' : 'rgba(255,255,255,0.1)',
                    position: 'relative',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'background 0.3s',
                    flexShrink: 0,
                    marginTop: 4,
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    top: 2, left: isActive ? 22 : 2,
                    width: 20, height: 20,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.3s cubic-bezier(0.23,1,0.32,1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isLoading && (
                      <svg className="animate-spin" width="10" height="10" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="#6366F1" strokeWidth="3" strokeDasharray="30 70" />
                      </svg>
                    )}
                  </span>
                </button>
              </div>

              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 6 }}>
                {mod.name}
              </h3>
              <p style={{ color: '#6B7280', fontSize: 13, lineHeight: 1.6 }}>
                {mod.desc}
              </p>

              {isActive && !isLocked && (
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <Link href={`/dashboard/modules/${mod.type}`} style={{
                    color: '#818CF8', fontFamily: 'Space Mono, monospace',
                    fontSize: 9, letterSpacing: 2, textTransform: 'uppercase',
                    textDecoration: 'none',
                  }}>
                    Configurer →
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
