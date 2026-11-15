import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import AnalyticsClient from './AnalyticsClient';
import { cleanScans, SOURCE_LABELS } from '@/lib/scans';
import type { ScanDoc, LinkClickDoc, ProfileDoc, LinkDoc } from '@/lib/types';

async function getAnalyticsData(uid: string) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [scansSnap, clicksSnap, profileSnap, linksSnap] = await Promise.all([
    adminDb.collection('scans').where('userId', '==', uid).where('scannedAt', '>=', ninetyDaysAgo).get(),
    adminDb.collection('linkClicks').where('profileId', '==', uid).where('clickedAt', '>=', ninetyDaysAgo).get(),
    adminDb.collection('profiles').doc(uid).get(),
    adminDb.collection('profiles').doc(uid).collection('links').get(),
  ]);

  const scans  = cleanScans(scansSnap.docs.map((d) => d.data() as ScanDoc));   // no bots, one visit per NFC tap
  const clicks = clicksSnap.docs.map((d) => d.data() as LinkClickDoc);
  const profile = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const linksById = Object.fromEntries(
    linksSnap.docs.map((d) => [d.id, d.data() as LinkDoc])
  );

  const scansByDay: Record<string, number> = {};
  scans.forEach((s) => {
    const day = s.scannedAt.slice(0, 10);
    scansByDay[day] = (scansByDay[day] ?? 0) + 1;
  });

  const DEVICE_LABELS: Record<string, string> = { iOS: 'iPhone', Android: 'Android', Other: 'Ordinateur / autre' };
  const devices: Record<string, number> = {};
  const sources: Record<string, number> = {};
  scans.forEach((s) => {
    const d = DEVICE_LABELS[s.device] ?? 'Ordinateur / autre';
    devices[d] = (devices[d] ?? 0) + 1;
    const src = SOURCE_LABELS[s.source];
    sources[src] = (sources[src] ?? 0) + 1;
  });

  const linkCountMap: Record<string, { label: string; type: string; count: number }> = {};
  clicks.forEach((click) => {
    const link = linksById[click.linkId];
    if (!link) return;
    if (!linkCountMap[click.linkId]) {
      linkCountMap[click.linkId] = { label: link.label, type: link.type, count: 0 };
    }
    linkCountMap[click.linkId].count++;
  });
  const topLinks = Object.values(linkCountMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const fortyFiveDaysAgo = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();
  const recentScans  = scans.filter((s) => s.scannedAt >= fortyFiveDaysAgo);
  const previousScans = scans.filter((s) => s.scannedAt < fortyFiveDaysAgo);
  const recentClicks  = clicks.filter((c) => c.clickedAt >= fortyFiveDaysAgo);
  const previousClicks = clicks.filter((c) => c.clickedAt < fortyFiveDaysAgo);

  function trendPct(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  return {
    scansByDay,
    devices,
    sources,
    topLinks,
    totalScans:   scans.length,
    totalClicks:  clicks.length,
    username:     profile?.username,
    scansTrend:   trendPct(recentScans.length,  previousScans.length),
    clicksTrend:  trendPct(recentClicks.length, previousClicks.length),
  };
}

export default async function AnalyticsPage() {
  const user = await requireAuth();
  const data = await getAnalyticsData(user.uid);
  return <AnalyticsClient data={data} />;
}
