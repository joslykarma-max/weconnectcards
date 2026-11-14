'use client';

import { useCallback, useEffect, useRef } from 'react';
import { EDITIONS } from '@/lib/editions';
import NfcCard from './NfcCard';
import styles from './hero.module.css';

const N = EDITIONS.length;

// Slot geometry for a card at relative position -2…2 (0 = centre). Positions ±2 are the
// same hidden spot behind the centre card, which is what makes the loop seamless.
const SLOTS = [
  { x: 0,   z: -0.95, r: 0,   s: 0.62, o: 0 },
  { x: -60, z: -0.42, r: 32,  s: 0.84, o: 1 },
  { x: 0,   z: 0,     r: 0,   s: 1,    o: 1 },
  { x: 60,  z: -0.42, r: -32, s: 0.84, o: 1 },
  { x: 0,   z: -0.95, r: 0,   s: 0.62, o: 0 },
];

/** Position of card `i` relative to the (possibly fractional) carousel position, in (-2, 2]. */
export function relativeOffset(i: number, pos: number): number {
  const r = (((i - pos) % N) + N) % N;
  return r > N / 2 ? r - N : r;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function slotStyle(rel: number): React.CSSProperties {
  const t = Math.min(Math.max(rel + 2, 0), 4);
  const i = Math.min(Math.floor(t), 3);
  const f = t - i;
  const A = SLOTS[i], B = SLOTS[i + 1];
  const x = lerp(A.x, B.x, f), z = lerp(A.z, B.z, f), r = lerp(A.r, B.r, f), s = lerp(A.s, B.s, f);
  return {
    transform: `translate3d(${x.toFixed(2)}%, 0, calc(var(--card-w) * ${z.toFixed(3)})) rotateY(${r.toFixed(2)}deg) scale(${s.toFixed(3)})`,
    opacity: lerp(A.o, B.o, f),
    '--dim':   (Math.min(Math.abs(rel), 1) * 0.34).toFixed(3),
    '--sheen': `calc(var(--card-w) * ${(0.8 - rel * 0.5).toFixed(3)})`,
  } as React.CSSProperties;
}

function applyStyle(el: HTMLElement, style: React.CSSProperties) {
  for (const [k, v] of Object.entries(style)) {
    if (k.startsWith('--')) el.style.setProperty(k, String(v));
    else (el.style as unknown as Record<string, string>)[k] = String(v);
  }
}

interface Props {
  pos:      number;
  flipped:  boolean;
  onStep:   (delta: number, direct?: boolean) => void;
  onFlip:   () => void;
  onHold:   (holding: boolean) => void;
  tiltable: boolean;
}

export default function NfcCardCarousel({ pos, flipped, onStep, onFlip, onHold, tiltable }: Props) {
  const stageRef  = useRef<HTMLDivElement>(null);
  const slotRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const tiltRefs  = useRef<(HTMLDivElement | null)[]>([]);
  const drag      = useRef<{ id: number; x0: number; y0: number; dx: number; active: boolean; samples: { t: number; x: number }[] } | null>(null);
  const suppressUntil = useRef(0);   // ignore the click that follows a drag
  const tiltFrame = useRef(0);
  const active    = ((pos % N) + N) % N;

  const slotPx = () => (slotRefs.current[0]?.offsetWidth ?? 300) * 0.6;

  const layout = useCallback((p: number) => {
    slotRefs.current.forEach((el, i) => { if (el) applyStyle(el, slotStyle(relativeOffset(i, p))); });
  }, []);

  useEffect(() => () => cancelAnimationFrame(tiltFrame.current), []);

  // ── Swipe / drag (pointer events; vertical scrolling stays native via touch-action: pan-y)
  function onPointerDown(e: React.PointerEvent) {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0)) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, dx: 0, active: false, samples: [{ t: e.timeStamp, x: e.clientX }] };
    onHold(true);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) { if (tiltable && e.pointerType === 'mouse') tiltTowards(e); return; }
    const dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    if (!d.active) {
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
      d.active = true;
      stageRef.current?.setPointerCapture(e.pointerId);
      stageRef.current?.classList.add(styles.dragging);
      resetTilt();
    }
    d.dx = dx;
    d.samples.push({ t: e.timeStamp, x: e.clientX });
    if (d.samples.length > 6) d.samples.shift();
    layout(pos - dx / slotPx());
  }

  function endDrag(e: React.PointerEvent, cancelled = false) {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    drag.current = null;
    onHold(false);
    if (!d.active) return;

    stageRef.current?.classList.remove(styles.dragging);
    suppressUntil.current = performance.now() + 350;

    const first = d.samples[0], last = d.samples[d.samples.length - 1];
    const v = last.t > first.t ? (last.x - first.x) / (last.t - first.t) : 0;   // px / ms
    // Controlled inertia: a flick or a short drag moves one card; two only after dragging past 1.5 cards
    const travelled = -d.dx / slotPx();
    const flick     = Math.abs(v) > 0.35 && Math.sign(-v) === Math.sign(travelled);
    let step = 0;
    if (!cancelled) {
      if (Math.abs(travelled) >= 1.5) step = 2 * Math.sign(travelled);
      else if (Math.abs(travelled) > 0.2 || flick) step = Math.sign(travelled);
    }

    layout(pos + step);   // also restores positions when snapping back
    if (step) onStep(step, true);
  }

  // ── Desktop tilt of the selected card (mouse only, no React render)
  function tiltTowards(e: React.PointerEvent) {
    const el = tiltRefs.current[active];
    if (!el || flipped) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(tiltFrame.current);
    tiltFrame.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(Math.max(-0.6, Math.min(0.6, px)) * 16).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(Math.max(-0.6, Math.min(0.6, py)) * -12).toFixed(2)}deg`);
    });
  }
  function resetTilt() {
    cancelAnimationFrame(tiltFrame.current);
    tiltRefs.current.forEach((el) => { el?.style.removeProperty('--rx'); el?.style.removeProperty('--ry'); });
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowRight') { e.preventDefault(); onStep(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); onStep(-1); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onFlip(); }
  }

  function onSlotClick(i: number) {
    if (performance.now() < suppressUntil.current) return;
    const rel = relativeOffset(i, pos);
    if (rel === 0) onFlip();
    else onStep(Math.round(rel));
  }

  return (
    <div
      ref={stageRef}
      className={styles.stage}
      tabIndex={0}
      role="group"
      aria-roledescription="carrousel"
      aria-label="Éditions de cartes We Connect"
      aria-describedby="hx-stage-help"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e)}
      onPointerCancel={(e) => endDrag(e, true)}
      onPointerLeave={(e) => { if (e.pointerType === 'mouse' && !drag.current) resetTilt(); }}
      onKeyDown={onKeyDown}
    >
      <p id="hx-stage-help" className={styles.srOnly}>
        Flèches gauche et droite pour changer d’édition, Entrée pour retourner la carte.
      </p>
      <div className={styles.focusRing} aria-hidden />
      <div className={styles.viewport}>
      <div className={styles.floor} aria-hidden />
      <div className={styles.track}>
        {EDITIONS.map((ed, i) => {
          const rel    = relativeOffset(i, pos);
          const isActive = rel === 0;
          return (
            <div
              key={ed.key}
              ref={(el) => { slotRefs.current[i] = el; }}
              className={`${styles.slot} ${isActive ? styles.slotActive : ''}`}
              style={slotStyle(rel)}
              role="group"
              aria-roledescription="diapositive"
              aria-label={`${ed.name} (${i + 1} sur ${N})`}
              aria-hidden={!isActive}
              onClick={() => onSlotClick(i)}
            >
              <div className={styles.float}>
                <div className={styles.tilt} ref={(el) => { tiltRefs.current[i] = el; }}>
                  <div className={`${styles.flip} ${isActive && flipped ? styles.flipped : ''}`}>
                    <NfcCard card={ed.card} name={ed.name} glow={ed.theme.glow} withBack={isActive} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
