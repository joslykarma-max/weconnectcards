import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { SavedContactDoc } from '@/lib/types';

export default async function ContactsPage() {
  const user = await requireAuth();

  const snap = await adminDb
    .collection('savedContacts')
    .where('profileId', '==', user.uid)
    .get();

  const contacts = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as SavedContactDoc) }))
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 24, color: '#F8F9FC', marginBottom: 6 }}>
          {contacts.length} contact{contacts.length !== 1 ? 's' : ''} sauvegardé{contacts.length !== 1 ? 's' : ''}
        </p>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Personnes qui ont enregistré votre contact depuis votre profil NFC.
        </p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {contacts.map((c) => (
            <div key={c.id} style={{
              background: '#12141C',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 8,
              padding: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>
                {c.device === 'iOS' ? '🍎' : c.device === 'Android' ? '🤖' : '👤'}
              </div>
              <div>
                <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                  {c.device ?? 'Appareil inconnu'}
                </p>
                <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>
                  {new Date(c.savedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
