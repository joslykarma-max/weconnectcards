'use client';

import { useEffect, useState, useSyncExternalStore, FormEvent, Suspense } from 'react';
import { signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import LightBubbles from '@/components/ui/LightBubbles';
import styles from './login.module.css';

const THEME_KEY    = 'wc-auth-theme';     // 'dark' | 'light' (light by default)
const REMEMBER_KEY = 'wc-login-remember'; // '0' when the user unticked « Se souvenir de moi »
const EMAIL_KEY    = 'wc-login-email';

function readStore(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStore(key: string, value: string | null) {
  try { if (value === null) localStorage.removeItem(key); else localStorage.setItem(key, value); } catch { /* private mode */ }
}

const noSubscribe = () => () => {};
/** A value saved in localStorage (null on the server and when missing). */
function useStored(key: string): string | null {
  return useSyncExternalStore(noSubscribe, () => readStore(key), () => null);
}

// Theme lives on <html data-auth-theme> (set before paint by app/(auth)/layout.tsx); React only mirrors it for the toggle button
const themeListeners = new Set<() => void>();
function useAuthTheme(): ['light' | 'dark', () => void] {
  const theme = useSyncExternalStore(
    (cb) => { themeListeners.add(cb); return () => { themeListeners.delete(cb); }; },
    () => (document.documentElement.dataset.authTheme === 'dark' ? 'dark' : 'light'),
    () => 'light' as const,
  );
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.authTheme = next;
    writeStore(THEME_KEY, next);
    themeListeners.forEach((l) => l());
  };
  return [theme, toggle];
}

function LoginForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const redirect     = searchParams.get('redirect') ?? '/dashboard';
  const [theme, toggleTheme] = useAuthTheme();
  // Saved e-mail / choice are used until the user types or ticks something
  const storedEmail    = useStored(EMAIL_KEY);
  const storedRemember = useStored(REMEMBER_KEY);
  const [emailInput, setEmail]       = useState<string | null>(null);
  const [rememberInput, setRemember] = useState<boolean | null>(null);
  const email    = emailInput ?? storedEmail ?? '';
  const remember = rememberInput ?? storedRemember !== '0';
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  // Soft navigations don't run the inline script: apply the saved theme here too
  useEffect(() => {
    if (readStore(THEME_KEY) === 'dark' && document.documentElement.dataset.authTheme !== 'dark') toggleTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken    = await credential.user.getIdToken();

      const res = await fetch('/api/auth/session', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ idToken, remember }),
      });

      if (!res.ok) throw new Error('session');
      writeStore(REMEMBER_KEY, remember ? '1' : '0');
      writeStore(EMAIL_KEY, remember ? email.trim() : null);
      router.push(redirect);
    } catch {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  }

  return (
    <div className={styles.root}>
      <div className={styles.bubbles} aria-hidden><LightBubbles tints={['#93C5FD', '#A5B4FC']} /></div>

      <header className={styles.top}>
        <Link href="/" className={styles.logo} aria-label="We Connect — accueil">
          <Image src="/logo-wordmark.png" alt="We Connect" width={152} height={26} priority />
        </Link>
        <button type="button" className={styles.themeBtn} onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          {theme === 'dark' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          )}
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.box}>
          <h1 className={styles.title}>Bon retour.</h1>
          <p className={styles.sub}>Connectez-vous à votre espace We Connect.</p>

          <form onSubmit={handleSubmit} className={styles.card}>
            <label className={styles.field}>
              <span>E-mail</span>
              <input type="email" autoComplete="email" placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>

            <label className={styles.field}>
              <span>Mot de passe</span>
              <span className={styles.pwd}>
                <input type={showPwd ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" className={styles.eye} onClick={() => setShowPwd((p) => !p)} aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                  {showPwd ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                  )}
                </button>
              </span>
            </label>

            <div className={styles.row}>
              <label className={styles.remember}>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span className={styles.check} aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>
                Se souvenir de moi
              </label>
              <Link href="/forgot-password" className={styles.forgot}>Mot de passe oublié ?</Link>
            </div>

            {error && <p className={styles.error} role="alert">{error}</p>}

            <button type="submit" className={styles.submit} disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>

            <p className={styles.signup}>
              Pas encore de compte ? <Link href="/register">Commander ma carte</Link>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
