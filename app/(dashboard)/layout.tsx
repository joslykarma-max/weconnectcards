import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import BottomNav from '@/components/dashboard/BottomNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const userSnap = await adminDb.collection('users').doc(session.uid).get();
  const isPro = userSnap.exists ? ((userSnap.data() as { plan?: string }).plan === 'pro') : false;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#08090C' }}>
      <Sidebar isPro={isPro} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar userEmail={session.email ?? undefined} />
        <main className="dash-content" style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
