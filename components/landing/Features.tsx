import styles from './features.module.css';

const icon = (d: React.ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{d}</svg>
);

const FEATURES = [
  { accent: '#6366F1', title: 'Analytics temps réel', desc: 'Scans par jour, pays, appareils et modules les plus visités.',
    icon: icon(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />) },
  { accent: '#06B6D4', title: '9 modules métier', desc: 'Fidélité, menu, accès, médical… activez seulement ce qui vous sert.',
    icon: icon(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6v6H9z" /></>) },
  { accent: '#8B5CF6', title: 'NFC instantané', desc: 'Un tap. Compatible iOS et Android. Zéro application.',
    icon: icon(<><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 12h8M12 8l4 4-4 4" /></>) },
  { accent: '#F59E0B', title: 'Profil dynamique', desc: 'Modifiez vos infos à tout moment : votre carte reste à jour.',
    icon: icon(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>) },
  { accent: '#22C55E', title: 'Multi-liens', desc: 'Téléphone, WhatsApp, LinkedIn, Calendly, portfolio : tous vos réseaux.',
    icon: icon(<><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>) },
  { accent: '#EC4899', title: 'Mode Équipe', desc: 'Dashboard centralisé et image unifiée pour toute votre équipe.',
    icon: icon(<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>) },
];

/** Compact feature overview: six tiles in one glass block. */
export default function Features() {
  return (
    <section id="features" className={`${styles.section} lp-deferred`}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>Pourquoi We Connect</p>
        <h2 className={styles.title}>Tout ce dont vous avez besoin.</h2>
      </div>
      <ul className={styles.glass}>
        {FEATURES.map((f) => (
          <li key={f.title} className={styles.tile}>
            <span className={styles.icon} style={{ color: f.accent, background: `${f.accent}14` }}>{f.icon}</span>
            <span className={styles.name}>{f.title}</span>
            <span className={styles.desc}>{f.desc}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
