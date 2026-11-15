'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './events.module.css';

type Detector = { detect(source: CanvasImageSource): Promise<{ rawValue: string }[]> };
type DetectorCtor = new (opts: { formats: string[] }) => Detector;

/**
 * Reads a QR code with the rear camera. Uses the browser's BarcodeDetector when it has one
 * (Chrome Android) and the jsQR library otherwise (iPhone Safari).
 */
export default function QrScanner({ onResult, onCancel }: { onResult: (text: string) => void; onCancel: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const canvas = document.createElement('canvas');
    const ctx    = canvas.getContext('2d', { willReadFrequently: true });

    async function start() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      } catch {
        setError('Caméra indisponible : autorisez l’accès à la caméra ou saisissez le numéro du billet.');
        return;
      }
      if (stopped) { stream.getTracks().forEach((t) => t.stop()); return; }
      const video = videoRef.current;
      if (!video) return;
      video.srcObject = stream;
      await video.play().catch(() => {});

      const Native = (window as Window & { BarcodeDetector?: DetectorCtor }).BarcodeDetector;
      const native = Native ? new Native({ formats: ['qr_code'] }) : null;
      const jsQR   = native ? null : (await import('jsqr')).default;

      const tick = async () => {
        if (stopped || !video.videoWidth || !ctx) { timer = setTimeout(tick, 200); return; }
        let text = '';
        try {
          if (native) {
            const found = await native.detect(video);
            text = found[0]?.rawValue ?? '';
          } else if (jsQR) {
            const w = Math.min(640, video.videoWidth);
            const h = Math.round(video.videoHeight * (w / video.videoWidth));
            canvas.width = w; canvas.height = h;
            ctx.drawImage(video, 0, 0, w, h);
            text = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' })?.data ?? '';
          }
        } catch { /* frame not ready */ }
        if (text) { navigator.vibrate?.(60); onResult(text.trim()); return; }
        timer = setTimeout(tick, 220);
      };
      tick();
    }
    start();

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onResult]);

  return (
    <div className={styles.card}>
      {error ? <p className={styles.errBox}>{error}</p> : (
        <video ref={videoRef} className={styles.video} playsInline muted aria-label="Caméra : visez le QR code du billet" />
      )}
      <button type="button" className={styles.secondary} onClick={onCancel}>Annuler</button>
    </div>
  );
}
