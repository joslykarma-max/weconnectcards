import Link from 'next/link';
import styles from './cta.module.css';

const TRUST = [
  { icon: '📍', value: 'Cotonou, Bénin',  label: 'Siège social' },
  { icon: '🌍', value: 'Afrique + Monde', label: 'Livraison' },
  { icon: '🔒', value: 'SSL + Firebase',  label: 'Données sécurisées' },
  { icon: '💬', value: 'Support 24/7',    label: 'Pour les Pro' },
];

/** Final call to action, compact. */
export default function CTA() {
  return (
    <section className={`${styles.section} lp-deferred`}>
      <div className={styles.glowA} aria-hidden />
      <div className={styles.glowB} aria-hidden />
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Prêt à vous lancer ?</p>
        <h2 className={styles.title}>Faites le <span className="text-gradient">premier geste.</span></h2>
        <p className={styles.sub}>Zéro papier. Zéro friction. Juste votre profil, sur leur téléphone. La carte qui évolue avec vous.</p>
        <div className={styles.actions}>
          <Link href="/register" className={styles.primary}>
            Commander ma carte
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
          <Link href="/login" className={styles.secondary}>J&apos;ai déjà un compte</Link>
        </div>
        <ul className={styles.trust}>
          {TRUST.map((t) => (
            <li key={t.label}>
              <span aria-hidden>{t.icon}</span>
              <strong>{t.value}</strong>
              <small>{t.label}</small>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
