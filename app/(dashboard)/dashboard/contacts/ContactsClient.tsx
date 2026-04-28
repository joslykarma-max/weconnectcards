'use client';

import type { SavedContactDoc } from '@/lib/types';

type Contact = { id: string } & SavedContactDoc;

function exportCsv(contacts: Contact[]) {
  const rows = [
    ['Nom', 'Email', 'Téléphone', 'Appareil', 'Date'],
    ...contacts.map((c) => [
      c.name  ?? '',
      c.email ?? '',
      c.phone ?? '',
      c.device,
      new Date(c.savedAt).toLocaleDateString('fr-FR'),
    ]),
  ];
  const csv  = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'contacts.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ContactsClient({ contacts }: { contacts: Contact[] }) {
  return (
    <div>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#F8F9FC', marginBottom: 6 }}>
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''} sauvegardé{contacts.length !== 1 ? 's' : ''}
          </p>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Personnes qui ont enregistré votre contact depuis votre profil NFC.
          </p>
        </div>
        {contacts.length > 0 && (
          <button
            onClick={() => exportCsv(contacts)}
            style={{
              padding: '10px 18px',
              background: 'rgba(99,102,241,0.1)',
              border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: 8,
              color: '#818CF8',
              fontFamily: 'Syne, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exporter CSV
          </button>
        )}
      </div>

      {contacts.length === 0 ? (
        <div style={{
          background: '#12141C',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 8,
          padding: '60px 40px',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: 40, display: 'block', marginBottom: 16 }}>📇</span>
          <p style={{ color: '#9CA3AF', fontSize: 15, marginBottom: 8 }}>Pas encore de contacts.</p>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Quand quelqu&apos;un enregistre votre vCard depuis votre profil, il apparaît ici.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contacts.map((c) => {
            const initials = c.name
              ? c.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
              : (c.device === 'iOS' ? '🍎' : c.device === 'Android' ? '🤖' : '?');
            const hasName = !!c.name;

            return (
              <div key={c.id} style={{
                background: '#12141C',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 8,
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: hasName ? 14 : 20,
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  color: '#818CF8',
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, marginBottom: 2 }}>
                    {c.name ?? <span style={{ color: '#6B7280' }}>Anonyme</span>}
                  </p>
                  {c.email && (
                    <p style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                      {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                      {c.phone}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: 0.5 }}>
                    {c.device}
                  </p>
                  <p style={{ color: '#4B5563', fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 2 }}>
                    {new Date(c.savedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
