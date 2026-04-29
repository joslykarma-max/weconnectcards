import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Check admin privileges
  const envAdmins = (process.env.ADMIN_UIDS ?? '').split(',').map(s => s.trim()).filter(Boolean);
  let isAdmin = envAdmins.includes(session.uid);

  if (!isAdmin) {
    const snap = await adminDb.collection('admins').doc(session.uid).get();
    isAdmin = snap.exists;
  }

  if (!isAdmin) redirect('/dashboard');

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--t-bg)' }}>
      <AdminSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <AdminTopbar />
        <main style={{ flex: 1, overflowY: 'auto', padding: '32px 40px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
