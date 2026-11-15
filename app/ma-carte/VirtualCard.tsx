'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LightBubbles from '@/components/ui/LightBubbles';
import styles from './carte.module.css';

export interface VirtualProfile {
  id:          string;
  label:       string;
  username:    string;
  url:         string;
  displayName: string;
  title:       string;
  avatar:      string | null;
  isPublic:    boolean;
  editionName: string;
  cardBg:      string;
  accent:      string;
  qrSvg:       string;
}

// ── Web NFC (Chrome Android only) ───────────────────────────────────────────
interface NdefWriter {
  write(message: { records: { recordType: string; data: string }[] }, options?: { signal?: AbortSignal }): Promise<void>;
}
type NdefWindow = Window & { NDEFReader?: new () => NdefWriter };

// ── Install prompt (Chrome / Edge / Samsung Internet) ───────────────────────
interface InstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PROFILE_KEY = 'wc-ma-carte-profile';
const noSubscribe = () => () => {};

function readStore(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function writeStore(key: string, value: string) {
  try { localStorage.setItem(key, value); } catch { /* private mode */ }
}
/** A browser-only fact (false while rendering on the server). */
function useClientFlag(read: () => boolean): boolean {
  return useSyncExternalStore(noSubscribe, read, () => false);
}

type NfcState = { step: 'idle' } | { step: 'waiting' } | { step: 'done' } | { step: 'error'; message: string };
type Sheet = null | 'install' | 'nfc' | 'info';

export default function VirtualCard({ profiles }: { profiles: VirtualProfile[] }) {
  const storedId = useSyncExternalStore(noSubscribe, () => readStore(PROFILE_KEY), () => null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const current = profiles.find((p) => p.id === (pickedId ?? storedId)) ?? profiles[0];

  const canNfc    = useClientFlag(() => 'NDEFReader' in window);
  const canShare  = useClientFlag(() => typeof navigator.share === 'function');
  const installed = useClientFlag(() => window.matchMedia('(display-mode: standalone)').matches
    || (navigator as Navigator & { standalone?: boolean }).standalone === true);
  const isIos     = useClientFlag(() => /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const [zoom,   setZoom]   = useState(false);
  const [sheet,  setSheet]  = useState<Sheet>(null);
  const [copied, setCopied] = useState(false);
  const [awake,  setAwake]  = useState(false);
  const [nfc,    setNfc]    = useState<NfcState>({ step: 'idle' });
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const nfcAbort = useRef<AbortController | null>(null);

  // Keep the screen on while the card is shown (re-acquired when the page comes back)
  useEffect(() => {
    if (!('wakeLock' in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || lock) return;
      try {
        lock = await navigator.wakeLock.request('screen');
        if (cancelled) { lock.release().catch(() => {}); return; }
        setAwake(true);
        lock.addEventListener('release', () => { lock = null; setAwake(false); });
      } catch { /* battery saver, unsupported… */ }
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      lock?.release().catch(() => {});
    };
  }, []);

  useEffect(() => {
    const onPrompt = (e: Event) => { e.preventDefault(); setInstallEvent(e as InstallPromptEvent); };
    const onInstalled = () => { setInstallEvent(null); setSheet(null); };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!zoom && !sheet) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setZoom(false); closeSheet(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!current) {
    return (
      <div className={styles.root}>
        <main className={styles.empty}>
          <p className={styles.emptyEmoji} aria-hidden>📇</p>
          <h1 className={styles.emptyTitle}>Votre profil n’est pas encore prêt</h1>
          <p className={styles.emptyText}>Choisissez un nom d’utilisateur pour obtenir votre carte virtuelle.</p>
          <Link href="/dashboard/profile" className={styles.primary}>Configurer mon profil</Link>
        </main>
      </div>
    );
  }

  const shortUrl = current.url.replace(/^https?:\/\//, '');

  function pick(id: string) {
    setPickedId(id);
    writeStore(PROFILE_KEY, id);
    setNfc({ step: 'idle' });
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(current.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard blocked */ }
  }

  async function share() {
    if (!canShare) return copy();
    try {
      await navigator.share({ title: current.displayName, text: `${current.displayName} — ma carte We Connect`, url: current.url });
    } catch { /* cancelled */ }
  }

  async function install() {
    if (installEvent) {
      try {
        await installEvent.prompt();
        await installEvent.userChoice;
        setInstallEvent(null);
        return;
      } catch { /* prompt already used or refused: show the manual steps */ }
    }
    setSheet('install');
  }

  async function writeTag() {
    const Reader = (window as NdefWindow).NDEFReader;
    if (!Reader) return;
    nfcAbort.current?.abort();
    const ctrl = new AbortController();
    nfcAbort.current = ctrl;
    setNfc({ step: 'waiting' });
    try {
      await new Reader().write({ records: [{ recordType: 'url', data: `${current.url}?src=nfc` }] }, { signal: ctrl.signal });
      setNfc({ step: 'done' });
      navigator.vibrate?.(80);
    } catch (err) {
      if (ctrl.signal.aborted) return;
      const name = (err as DOMException)?.name;
      setNfc({
        step: 'error',
        message: name === 'NotAllowedError'
          ? 'Autorisez l’accès NFC à votre navigateur, puis réessayez.'
          : name === 'NotSupportedError'
            ? 'Activez le NFC dans les réglages du téléphone, puis réessayez.'
            : 'Le tag n’a pas pu être écrit. Il est peut-être verrouillé ou trop petit.',
      });
    }
  }

  function openNfc() {
    setSheet('nfc');
    writeTag();
  }

  function closeSheet() {
    nfcAbort.current?.abort();
    nfcAbort.current = null;
    setNfc({ step: 'idle' });
    setSheet(null);
  }

  const qr = { __html: current.qrSvg };

  return (
    <div className={styles.root}>
      <div className={styles.bubbles} aria-hidden><LightBubbles tints={['#93C5FD', '#A5B4FC']} /></div>

      <header className={styles.top}>
        <Link href="/dashboard" className={styles.chip} aria-label="Retour au tableau de bord">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M15 18l-6-6 6-6" /></svg>
          <span className={styles.chipText}>Accueil</span>
        </Link>
        <p className={styles.topTitle}>Ma carte</p>
        <div className={styles.topActions}>
          <button type="button" className={styles.iconBtn} onClick={() => setSheet('info')} aria-label="Comment ça marche ?">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9.5" /><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6" /><circle cx="12" cy="17.2" r="0.6" fill="currentColor" /></svg>
          </button>
          {!installed && (
            <button type="button" className={styles.iconBtn} onClick={install} aria-label="Ajouter à l’écran d’accueil">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="6" y="2.5" width="12" height="19" rx="3" /><path d="M12 8v6M9 11h6" /></svg>
            </button>
          )}
        </div>
      </header>

      <main className={styles.main}>
        {profiles.length > 1 && (
          <div className={styles.switcher} role="tablist" aria-label="Profil affiché">
            {profiles.map((p) => (
              <button key={p.id} type="button" role="tab" aria-selected={p.id === current.id}
                className={`${styles.switchBtn} ${p.id === current.id ? styles.switchOn : ''}`} onClick={() => pick(p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        <section className={styles.pass} aria-label={`Carte de ${current.displayName}`}>
          <div className={styles.passHead} style={{ background: current.cardBg }}>
            <div className={styles.passTopRow}>
              <span className={styles.brand}>
                <Image src="/logo-symbol.png" alt="" width={26} height={14} />
                WE CONNECT
              </span>
              {awake && <span className={styles.awake}><i aria-hidden />Écran actif</span>}
            </div>
            <div className={styles.person}>
              {current.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.avatar} alt="" className={styles.avatar} />
              ) : (
                <span className={styles.avatar} style={{ background: current.accent }} aria-hidden>
                  {current.displayName.trim().charAt(0).toUpperCase()}
                </span>
              )}
              <div className={styles.who}>
                <h1 className={styles.name}>{current.displayName}</h1>
                {current.title && <p className={styles.role}>{current.title}</p>}
              </div>
            </div>
            <span className={styles.passLine} style={{ background: `linear-gradient(90deg, ${current.accent}, #06B6D4)` }} aria-hidden />
          </div>

          <button type="button" className={styles.qrBtn} onClick={() => setZoom(true)} aria-label="Agrandir le QR code">
            <span className={styles.qr} dangerouslySetInnerHTML={qr} />
            <span className={styles.qrHint}>Scannez pour voir mon profil</span>
            <span className={styles.url}>{shortUrl}</span>
          </button>
        </section>

        {!current.isPublic && (
          <p className={styles.warn}>
            Ce profil est privé : les personnes qui scannent ne le verront pas.{' '}
            <Link href="/dashboard/profile">Le rendre public</Link>
          </p>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.primary} onClick={share}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v12M7 8l5-5 5 5" /><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" /></svg>
            Partager
          </button>
          <button type="button" className={styles.secondary} onClick={copy} aria-live="polite">
            {copied ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 6L9 17l-5-5" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="9" y="9" width="12" height="12" rx="2.5" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
            )}
            {copied ? 'Copié' : 'Copier le lien'}
          </button>
          {canNfc && (
            <button type="button" className={`${styles.secondary} ${styles.wide}`} onClick={openNfc}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" /></svg>
              Écrire sur un tag NFC
            </button>
          )}
        </div>
      </main>

      {/* Full-screen QR, easy to scan from a distance */}
      {zoom && (
        <button type="button" className={styles.zoom} onClick={() => setZoom(false)} aria-label="Fermer le QR code agrandi">
          <span className={styles.zoomQr} dangerouslySetInnerHTML={qr} />
          <span className={styles.zoomName}>{current.displayName}</span>
          <span className={styles.zoomUrl}>{shortUrl}</span>
          <span className={styles.zoomClose}>Touchez pour fermer</span>
        </button>
      )}

      {sheet && (
        <div className={styles.overlay} onClick={closeSheet}>
          <div className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="sheet-title" onClick={(e) => e.stopPropagation()}>
            <span className={styles.grab} aria-hidden />

            {sheet === 'info' && (
              <>
                <h2 id="sheet-title" className={styles.sheetTitle}>Votre téléphone, votre carte</h2>
                <ul className={styles.tips}>
                  <li><b>Montrez ce QR code</b> : n’importe quel téléphone l’ouvre avec son appareil photo, sans application.</li>
                  <li><b>Ajoutez la page à l’écran d’accueil</b> pour l’ouvrir en un geste, comme une application.</li>
                  <li><b>L’écran reste allumé</b> tant que la carte est affichée.</li>
                  {canNfc && <li><b>Écrivez votre lien sur un tag NFC</b> (autocollant, porte-clés) : il s’ouvrira d’un simple tap.</li>}
                </ul>
                <p className={styles.sheetNote}>
                  Un site web ne peut pas faire émettre un signal NFC à votre téléphone : iOS et Android réservent cette fonction aux applications installées (paiement, badges). Votre carte physique reste la plus rapide.
                </p>
                <button type="button" className={styles.primary} onClick={closeSheet}>J’ai compris</button>
              </>
            )}

            {sheet === 'install' && (
              <>
                <h2 id="sheet-title" className={styles.sheetTitle}>Ajouter à l’écran d’accueil</h2>
                {isIos ? (
                  <ol className={styles.steps}>
                    <li>Ouvrez cette page dans <b>Safari</b>.</li>
                    <li>Touchez <b>Partager</b> <span className={styles.kbd} aria-hidden>⬆︎</span> en bas de l’écran.</li>
                    <li>Choisissez <b>« Sur l’écran d’accueil »</b>, puis <b>Ajouter</b>.</li>
                  </ol>
                ) : (
                  <ol className={styles.steps}>
                    <li>Ouvrez le menu du navigateur <span className={styles.kbd} aria-hidden>⋮</span>.</li>
                    <li>Choisissez <b>« Ajouter à l’écran d’accueil »</b> ou <b>« Installer l’application »</b>.</li>
                  </ol>
                )}
                <p className={styles.sheetNote}>L’icône « Ma carte » ouvrira directement cette page.</p>
                <button type="button" className={styles.primary} onClick={closeSheet}>OK</button>
              </>
            )}

            {sheet === 'nfc' && (
              <>
                <h2 id="sheet-title" className={styles.sheetTitle}>Écrire sur un tag NFC</h2>
                <div className={`${styles.nfcIcon} ${nfc.step === 'waiting' ? styles.nfcPulse : ''} ${nfc.step === 'done' ? styles.nfcDone : ''}`} aria-hidden>
                  {nfc.step === 'done' ? '✓' : nfc.step === 'error' ? '!' : (
                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 8.5a5 5 0 0 1 0 7M9.5 6a9 9 0 0 1 0 12M13 3.5a13 13 0 0 1 0 17" /></svg>
                  )}
                </div>
                <p className={styles.nfcText} role="status">
                  {nfc.step === 'waiting' && <>Approchez un tag NFC vierge du dos du téléphone…</>}
                  {nfc.step === 'done' && <>Tag programmé ! Il ouvre maintenant <b>{shortUrl}</b>.</>}
                  {nfc.step === 'error' && nfc.message}
                  {nfc.step === 'idle' && <>Prêt à écrire <b>{shortUrl}</b>.</>}
                </p>
                <div className={styles.sheetRow}>
                  {(nfc.step === 'done' || nfc.step === 'error') && (
                    <button type="button" className={styles.secondary} onClick={writeTag}>{nfc.step === 'done' ? 'Un autre tag' : 'Réessayer'}</button>
                  )}
                  <button type="button" className={nfc.step === 'done' ? styles.primary : styles.secondary} onClick={closeSheet}>
                    {nfc.step === 'done' ? 'Terminé' : 'Annuler'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
