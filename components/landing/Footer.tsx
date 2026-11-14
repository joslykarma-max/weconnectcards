'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import styles from './footer.module.css';

const AdminLoginModal = dynamic(() => import('./AdminLoginModal'), { ssr: false });

const PRODUCT_LINKS = [
  { label: 'Comment ça marche', href: '/comment-ca-marche' },
  { label: 'Features',          href: '/features' },
  { label: 'Tarifs',            href: '/tarifs' },
  { label: 'Modules',           href: '/#how-it-works' },
  { label: 'Équipe',            href: '/features' },
];

const LEGAL_LINKS = ['Politique de confidentialité', 'CGU', 'Mentions légales', 'Cookies'];
const SOCIALS = ['LinkedIn', 'Instagram', 'Twitter'];

export default function Footer() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Link href="/" aria-label="We Connect — accueil" className={styles.logo}>
            <Image src="/logo-wordmark.png" alt="We Connect" width={175} height={30} style={{ height: 28, width: 'auto' }} />
          </Link>
          <p className={styles.pitch}>La plateforme NFC premium pour les professionnels. Partagez votre identité en un geste.</p>
          <div className={styles.socials}>
            {SOCIALS.map((name) => <a key={name} href="#" aria-label={name} className={styles.social}>{name[0]}</a>)}
          </div>
        </div>

        <nav className={styles.col} aria-label="Produit">
          <p className={styles.colTitle}>Produit</p>
          {PRODUCT_LINKS.map((item) => <Link key={item.label} href={item.href} className={styles.link}>{item.label}</Link>)}
        </nav>

        <nav className={styles.col} aria-label="Légal">
          <p className={styles.colTitle}>Légal</p>
          {LEGAL_LINKS.map((item) => <a key={item} href="#" className={styles.link}>{item}</a>)}
        </nav>

        <div className={`${styles.col} ${styles.contact}`}>
          <p className={styles.colTitle}>Contact</p>
          <p className={styles.text}>hello@weconnect.io</p>
          <p className={styles.text}>Cotonou, Bénin</p>
          <p className={styles.text}>Afrique francophone</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>© 2025 We Connect · Cotonou, Bénin · Tous droits réservés</p>
        <div className={styles.bottomRight}>
          <p>Your Identity. One Touch.</p>
          {/* Admin access — discreet red dot */}
          <button type="button" onClick={() => setShowAdmin(true)} title="Admin" aria-label="Accès admin" className={styles.admin} />
        </div>
      </div>

      {showAdmin && <AdminLoginModal onClose={() => setShowAdmin(false)} />}
    </footer>
  );
}
