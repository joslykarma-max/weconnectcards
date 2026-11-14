import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import DashboardTopbar from '@/components/dashboard/shell/DashboardTopbar';
import ShellMain from '@/components/dashboard/shell/ShellMain';
import styles from '@/components/dashboard/shell/shell.module.css';

// « Clair » shell: light top bar + launcher home; sections open as floating panels
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  const initial = (session.name || session.email || 'W').trim().charAt(0).toUpperCase();

  return (
    <div className={styles.shell}>
      <DashboardTopbar email={session.email ?? undefined} initial={initial} />
      <ShellMain>{children}</ShellMain>
    </div>
  );
}
