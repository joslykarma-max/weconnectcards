// One visit of a public profile = one document in `scans`.
// Since 2026-11-15 each record says where the visit came from (`source`), the NFC route no
// longer logs a second record when it opens the profile, and bots, the owner's own visits
// and the dashboard preview are not counted. `cleanScans` makes older records comparable.
import { getDeviceFromUA } from './utils';
import type { ScanDoc } from './types';

export type ScanSource = 'nfc' | 'qr' | 'link';

export const SOURCE_LABELS: Record<ScanSource, string> = { nfc: 'Tap NFC', qr: 'QR code', link: 'Lien partagé' };

/** ?src=… on a profile URL → where the visit came from. */
export function scanSource(raw: string | string[] | undefined): ScanSource {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === 'nfc' || v === 'qr' ? v : 'link';
}

// Link-preview fetchers (WhatsApp, Facebook, Telegram…), search engines, monitoring and scripts
const BOT_UA = /bot\b|bot\/|crawl|spider|slurp|facebookexternalhit|facebot|meta-externalagent|whatsapp\/|telegram|twitterbot|linkedinbot|discordbot|slackbot|skypeuripreview|pinterest|embedly|quora link preview|vkshare|bitlybot|googleother|google-inspectiontool|google-read-aloud|bingpreview|applebot|yandex|baiduspider|duckduckbot|petalbot|semrush|ahrefs|mj12bot|dotbot|headlesschrome|lighthouse|pagespeed|gtmetrix|pingdom|uptimerobot|statuscake|vercel-screenshot|preview|curl\/|wget\/|python-requests|python-urllib|aiohttp|axios\/|node-fetch|undici|go-http-client|okhttp|java\/|libwww|httpclient/i;

export function isBotUA(ua: string | null | undefined): boolean {
  return !ua || ua.length < 20 || BOT_UA.test(ua);
}

export type CleanScan = ScanDoc & { source: ScanSource; device: 'iOS' | 'Android' | 'Other' };

/** How close the profile visit followed the NFC tap in the old double-logging flow. */
const LEGACY_PAIR_MS = 30_000;

/**
 * Drops bots and merges the old double record of an NFC tap (a `device: 'nfc'` record at the
 * tap, then a second one when the profile opened) into a single visit with source « nfc ».
 */
export function cleanScans(scans: ScanDoc[]): CleanScan[] {
  const sorted = [...scans].sort((a, b) => a.scannedAt.localeCompare(b.scannedAt));
  const out: CleanScan[] = [];
  const merged = new Set<number>();

  sorted.forEach((s, i) => {
    if (merged.has(i)) return;
    const device = s.device === 'iOS' || s.device === 'Android' ? s.device : getDeviceFromUA(s.userAgent ?? '');

    if (s.source) {                                   // current format
      if (!isBotUA(s.userAgent)) out.push({ ...s, source: s.source, device });
      return;
    }
    if (s.device === 'nfc') {                         // legacy tap record
      const t = new Date(s.scannedAt).getTime();
      for (let j = i + 1; j < sorted.length; j++) {
        const next = sorted[j];
        if (new Date(next.scannedAt).getTime() - t > LEGACY_PAIR_MS) break;
        if (!merged.has(j) && !next.source && next.device !== 'nfc' && next.userId === s.userId && next.profileId === s.profileId) {
          merged.add(j);                              // the profile-page record of the same tap
          break;
        }
      }
      out.push({ ...s, source: 'nfc', device });       // the tap itself always counts once
      return;
    }
    if (!isBotUA(s.userAgent)) out.push({ ...s, source: 'link', device });
  });
  return out;
}
