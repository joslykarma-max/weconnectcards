import Link from 'next/link';
import styles from './shell.module.css';

export interface LauncherStats {
  name: string; avatar: string | null; username: string | null;
  scans30: number; contacts: number; activeModules: number; activeCards: number; isPro: boolean;
  events: number; // events this account organises with We Connect NFC passes
}

interface Tile { href: string; label: string; emoji: string; soft: string; edge: string; stat?: string; badge?: string }

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`;

/** Home: every section is a 3D tile; the grid always fits the screen. */
export default function Launcher({ s }: { s: LauncherStats }) {
  const tiles: Tile[] = [
    { href: '/dashboard/profile',   label: 'Mon profil',   emoji: '👤', soft: '#E0E7FF', edge: '#C7D2FE', stat: 'Infos, liens, style' },
    { href: '/dashboard/card',      label: 'Ma carte',     emoji: '💳', soft: '#DBEAFE', edge: '#BFDBFE', stat: plural(s.activeCards, 'carte active', 'cartes actives') },
    { href: '/ma-carte',            label: 'Carte virtuelle', emoji: '📱', soft: '#E0E7FF', edge: '#A5B4FC', stat: 'QR plein écran' },
    { href: '/dashboard/modules',   label: 'Modules',      emoji: '🧩', soft: '#CFFAFE', edge: '#A5F3FC', stat: plural(s.activeModules, 'actif', 'actifs') },
    { href: '/dashboard/activite',  label: 'Activité',     emoji: '⚡', soft: '#FEF3C7', edge: '#FDE68A', stat: 'Vue d’ensemble' },
    { href: '/dashboard/analytics', label: 'Statistiques', emoji: '📊', soft: '#EDE9FE', edge: '#DDD6FE', stat: `${s.scans30} scans · 30 j` },
    { href: '/dashboard/contacts',  label: 'Contacts',     emoji: '👥', soft: '#DCFCE7', edge: '#BBF7D0', stat: plural(s.contacts, 'contact', 'contacts') },
    { href: '/dashboard/qrcode',    label: 'QR codes',     emoji: '🔳', soft: '#F1F5F9', edge: '#E2E8F0', stat: 'Créer et suivre' },
    { href: '/dashboard/team',      label: 'Équipe',       emoji: '🏢', soft: '#FCE7F3', edge: '#FBCFE8', stat: 'Membres', badge: s.isPro ? undefined : 'PRO' },
    { href: '/dashboard/preview',   label: 'Aperçu',       emoji: '👁️', soft: '#E0F2FE', edge: '#BAE6FD', stat: 'Ma carte en direct' },
    { href: '/dashboard/settings',  label: 'Paramètres',   emoji: '⚙️', soft: '#F1F5F9', edge: '#E2E8F0', stat: 'Compte et offre' },
    { href: '/annuaire',            label: 'Annuaire',     emoji: '📖', soft: '#FFEDD5', edge: '#FED7AA', stat: 'Les membres' },
  ];
  // Organisers supplied with NFC passes get their event space first
  if (s.events > 0) {
    tiles.unshift({ href: '/dashboard/events', label: 'Événements', emoji: '🎟️', soft: '#EDE9FE', edge: '#C4B5FD', stat: plural(s.events, 'événement', 'événements') });
  }
  const first = s.name.split(' ')[0] || 'à vous';

  return (
    <div className={styles.launcher}>
      <div className={styles.hello}>
        {s.avatar
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={s.avatar} alt="" className={styles.helloAvatar} />
          : <span className={styles.helloAvatar} aria-hidden>{(s.name[0] ?? 'W').toUpperCase()}</span>}
        <div className={styles.helloText}>
          <p className={styles.helloTitle}>Bonjour {first}</p>
          <p className={styles.helloSub}>Que voulez-vous faire ?</p>
        </div>
        {s.username && (
          <a href={`/${s.username}`} target="_blank" rel="noopener noreferrer" className={styles.publicLink}>Ma page ↗</a>
        )}
      </div>

      <nav className={styles.tiles} aria-label="Sections du dashboard">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className={styles.tile} style={{ '--soft': t.soft, '--edge': t.edge } as React.CSSProperties}>
            {t.badge && <span className={styles.badge}>{t.badge}</span>}
            <span className={styles.tileIcon} aria-hidden>{t.emoji}</span>
            <span>
              <span className={styles.tileLabel} style={{ display: 'block' }}>{t.label}</span>
              {t.stat && <span className={styles.tileStat} style={{ display: 'block' }}>{t.stat}</span>}
            </span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
