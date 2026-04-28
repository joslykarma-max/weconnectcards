import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import KPICard from '@/components/dashboard/KPICard';
import Link from 'next/link';
import type { ScanDoc, ProfileDoc } from '@/lib/types';

async function getDashboardData(uid: string) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  try {
    const [scansSnap, profileSnap, contactsSnap, clicksSnap] = await Promise.all([
      adminDb.collection('scans').where('userId', '==', uid).get(),
      adminDb.collection('profiles').doc(uid).get(),
      adminDb.collection('savedContacts').where('profileId', '==', uid).get(),
      adminDb.collection('linkClicks').where('profileId', '==', uid).get(),
    ]);

    const allScans     = scansSnap.docs.map((d) => d.data() as ScanDoc);
    const recentScans  = allScans.filter((s) => s.scannedAt >= thirtyDaysAgo);
    const recentClicks = clicksSnap.docs.filter((d) => (d.data() as { clickedAt: string }).clickedAt >= thirtyDaysAgo);
    const profile      = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;

    const sortedScans  = [...allScans].sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));

    return {
      totalScans:     allScans.length,
      recentScans:    recentScans.slice(0, 10),
      recentAllScans: sortedScans.slice(0, 6),
      totalContacts:  contactsSnap.size,
      totalClicks:    recentClicks.length,
      profile,
    };
  } catch (err) {
    console.error('[dashboard] data fetch error:', err);
    return { totalScans: 0, recentScans: [], recentAllScans: [], totalContacts: 0, totalClicks: 0, profile: null };
  }
}

export default async function DashboardPage() {
  const user = await requireAuth();
  const { totalScans, recentAllScans, totalClicks, totalContacts, profile } =
    await getDashboardData(user.uid);

  const engagement = totalScans > 0 ? Math.round((totalClicks / totalScans) * 100) : 0;

  const kpis = [
    { label: 'Scans totaux',         value: totalScans,     trend: 12, description: '30 derniers jours' },
    { label: 'Liens cliqués',         value: totalClicks,    trend: 8,  description: '30 derniers jours' },
    { label: 'Contacts sauvegardés', value: totalContacts,  trend: 5,  description: 'Total' },
    { label: 'Taux engagement',       value: `${engagement}%`, trend: 3, description: 'Clics / Scans' },
  ];

  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 6 }}>
          Bonjour, {profile?.displayName?.split(' ')[0] ?? 'là'} 👋
        </h2>
        <p style={{ color: '#6B7280', fontSize: 14 }}>
          Voici ce qui se passe avec votre profil{profile?.username ? ` weconnect.io/${profile.username}` : ''}.
        </p>
      </div>

      <div className="dash-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
        {kpis.map((kpi) => <KPICard key={kpi.label} {...kpi} />)}
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Recent Scans */}
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC' }}>Activité récente</h3>
            <Link href="/dashboard/analytics" style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#818CF8', textDecoration: 'none', letterSpacing: 2, textTransform: 'uppercase' }}>
              Voir tout →
            </Link>
          </div>
          {recentAllScans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#6B7280', fontSize: 14 }}>Pas encore de scans.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentAllScans.map((scan, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 6 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: scan.device === 'iOS' ? 'rgba(99,102,241,0.15)' : 'rgba(6,182,212,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {scan.device === 'iOS' ? '🍎' : scan.device === 'Android' ? '🤖' : '💻'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: '#F8F9FC', fontSize: 13 }}>{scan.device ?? 'Appareil inconnu'}</p>
                    <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>
                      {new Date(scan.scannedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 28 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>Actions rapides</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/dashboard/profile', icon: '✏️', label: 'Modifier mon profil',   desc: 'Photo, liens, bio' },
              { href: profile?.username ? `/${profile.username}` : '#', icon: '👁️', label: 'Voir ma page publique', desc: `weconnect.io/${profile?.username ?? '...'}` },
              { href: '/dashboard/card',    icon: '💳', label: 'Gérer ma carte',        desc: 'NFC, QR code, activation' },
              { href: '/dashboard/analytics', icon: '📊', label: 'Voir les analytics',  desc: 'Stats détaillées' },
            ].map((action) => (
              <Link key={action.label} href={action.href} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 6, textDecoration: 'none', transition: 'all 0.2s' }}>
                <span style={{ fontSize: 20 }}>{action.icon}</span>
                <div>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontWeight: 500 }}>{action.label}</p>
                  <p style={{ color: '#6B7280', fontSize: 12 }}>{action.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
