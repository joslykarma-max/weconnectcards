import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import AnalyticsClient from './AnalyticsClient';
import type { ScanDoc, LinkClickDoc, ProfileDoc, LinkDoc } from '@/lib/types';

async function getAnalyticsData(uid: string) {
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const [scansSnap, clicksSnap, profileSnap, linksSnap] = await Promise.all([
    adminDb.collection('scans').where('userId', '==', uid).get(),
    adminDb.collection('linkClicks').where('profileId', '==', uid).get(),
    adminDb.collection('profiles').doc(uid).get(),
    adminDb.collection('profiles').doc(uid).collection('links').get(),
  ]);

  const scans   = scansSnap.docs.map((d) => d.data() as ScanDoc).filter((s) => s.scannedAt >= ninetyDaysAgo).sort((a, b) => a.scannedAt.localeCompare(b.scannedAt));
  const clicks  = clicksSnap.docs.map((d) => d.data() as LinkClickDoc).filter((c) => c.clickedAt >= ninetyDaysAgo);
  const profile = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const linksById = Object.fromEntries(
    linksSnap.docs.map((d) => [d.id, d.data() as LinkDoc])
  );

  const scansByDay: Record<string, number> = {};
  scans.forEach((s) => {
    const day = s.scannedAt.slice(0, 10);
    scansByDay[day] = (scansByDay[day] ?? 0) + 1;
  });

  const devices: Record<string, number> = {};
  scans.forEach((s) => {
    const d = s.device ?? 'Other';
    devices[d] = (devices[d] ?? 0) + 1;
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

  return {
    scansByDay,
    devices,
    topLinks,
    totalScans:  scans.length,
    totalClicks: clicks.length,
    username:    profile?.username,
  };
}

export default async function AnalyticsPage() {
  const user = await requireAuth();
  const data = await getAnalyticsData(user.uid);
  return <AnalyticsClient data={data} />;
}
