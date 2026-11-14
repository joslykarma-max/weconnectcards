'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { EDITIONS, editionVars } from '@/lib/editions';
import DynamicTheme from './DynamicTheme';
import NfcCardCarousel from './NfcCardCarousel';
import EditionSelector from './EditionSelector';
import ProductInformation from './ProductInformation';
import ModulesDisclosure from './ModulesDisclosure';
import { useLiteMode, useMediaQuery, usePageVisible } from './useEnvironment';
import styles from './hero.module.css';

const N = EDITIONS.length;
const AUTOPLAY_MS = 6000;

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [pos, setPos]           = useState(0);       // unbounded: keeps the direction of travel
  const [flipped, setFlipped]   = useState(false);
  const [choice, setChoice]     = useState<'auto' | 'play' | 'pause'>('auto');   // play / pause button
  const [hover, setHover]       = useState(false);
  const [focused, setFocused]   = useState(false);
  const [holding, setHolding]   = useState(false);
  const [inView, setInView]     = useState(true);
  const [idle, setIdle]         = useState(false);   // decorative motion starts once the page is interactive
  const reduced   = useMediaQuery('(prefers-reduced-motion: reduce)');
  const finePtr   = useMediaQuery('(hover: hover) and (pointer: fine)');
  const lite      = useLiteMode();
  const pageShown = usePageVisible();
  const playing   = choice === 'play' || (choice === 'auto' && !reduced);   // no autoplay by default when motion is reduced
  const hopTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const active  = ((pos % N) + N) % N;
  const edition = EDITIONS[active];

  const step = useCallback((delta: number, direct = false) => {
    clearTimeout(hopTimer.current);
    setFlipped(false);
    // Two-slot jumps go through the neighbour so cards never cross each other
    // (not needed after a drag: the cards are already near their target)
    if (Math.abs(delta) === 2 && !direct) {
      const dir = Math.sign(delta);
      setPos((p) => p + dir);
      hopTimer.current = setTimeout(() => setPos((p) => p + dir), 170);
    } else if (delta) {
      setPos((p) => p + delta);
    }
  }, []);

  const select = useCallback((i: number) => {
    let delta = i - active;
    if (delta > N / 2) delta -= N;
    if (delta < -N / 2) delta += N;
    step(delta);
  }, [active, step]);

  // Pause when the hero leaves the screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cic = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = ric(() => setIdle(true), { timeout: 2500 });
    return () => { io.disconnect(); cic(idleId); clearTimeout(hopTimer.current); };
  }, []);

  const autoplaying = playing && !hover && !focused && !holding && !flipped && inView && pageShown;
  useEffect(() => {
    if (!autoplaying) return;
    const t = setTimeout(() => setPos((p) => p + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [autoplaying, pos]);

  return (
    <section
      ref={sectionRef}
      className={`${styles.hero} ${lite ? styles.lite : ''}`}
      style={editionVars(edition) as React.CSSProperties}
      data-edition={edition.key}
    >
      <DynamicTheme active={active} bubbles={idle} />

      <div className={styles.inner}>
        <div className={styles.colText}>
          <p className={styles.eyebrow}><span className={styles.eyebrowDot} />Technologie NFC · Carte intelligente</p>
          <h1 className={styles.title}>
            Une touche. <span className={styles.titleAccent}>Toute votre identité.</span>
          </h1>
          <p className={styles.sub}>
            Découvrez la carte NFC intelligente qui transforme votre manière de vous présenter, de partager et de connecter.
          </p>
          <div className={styles.ctas}>
            <Link href="/register" className={styles.cta}>
              Commander ma carte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
            <a href="#pricing" className={styles.ctaGhost}>Voir les tarifs</a>
          </div>
          <ModulesDisclosure />
        </div>

        <div
          className={styles.colStage}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true); }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') setHover(false); }}
          // Keyboard focus pauses autoplay; a tap only restarts the 6 s timer (pos changes)
          onFocus={(e) => { if ((e.target as HTMLElement).matches(':focus-visible')) setFocused(true); }}
          onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false); }}
        >
          <NfcCardCarousel
            pos={pos}
            flipped={flipped}
            onStep={step}
            onFlip={() => setFlipped((f) => !f)}
            onHold={setHolding}
            tiltable={finePtr && !reduced}
          />
          <EditionSelector active={active} onPrev={() => step(-1)} onNext={() => step(1)} onSelect={select} />
          <ProductInformation
            edition={edition}
            flipped={flipped}
            onFlip={() => setFlipped((f) => !f)}
            playing={playing}
            onTogglePlay={() => setChoice(playing ? 'pause' : 'play')}
            announce={!autoplaying}
          />
        </div>
      </div>
    </section>
  );
}
