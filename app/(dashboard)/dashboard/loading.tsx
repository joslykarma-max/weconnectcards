import styles from '@/components/dashboard/shell/shell.module.css';

// Instant placeholder while a dashboard page loads: the launcher's silhouette, in the light style
export default function DashboardLoading() {
  return (
    <div className={styles.launcher} role="status" aria-label="Chargement">
      <div className={styles.hello}>
        <span className={`${styles.helloAvatar} ${styles.skeleton}`} />
        <div className={styles.helloText}><span className={styles.skeleton} style={{ display: 'block', height: 22, width: 160, borderRadius: 8 }} /></div>
      </div>
      <div className={styles.tiles}>
        {Array.from({ length: 11 }, (_, i) => <span key={i} className={`${styles.tile} ${styles.skeleton}`} style={{ '--soft': '#EEF2F7', '--edge': '#E2E8F0' } as React.CSSProperties} />)}
      </div>
    </div>
  );
}
