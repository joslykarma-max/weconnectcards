import { requireAuth }  from '@/lib/session';
import { adminDb }      from '@/lib/firebase-admin';
import OverviewClient   from './OverviewClient';
import type { OverviewProps }   from './OverviewClient';
import type {
  ScanDoc, ProfileDoc,
  ModuleDoc, MenuCategory,
  LoyaltyCardDoc, EventRegistration,
  AccessLog, MemberCardDoc,
} from '@/lib/types';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
async function getDashboardData(uid: string): Promise<OverviewProps> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  /* ── base data + modules list in parallel ────────────────────────────── */
  const [scansSnap, profileSnap, contactsSnap, clicksSnap, modulesSnap] =
    await Promise.all([
      adminDb.collection('scans')
        .where('userId',    '==', uid)
        .where('scannedAt', '>=', thirtyDaysAgo)
        .get(),
      adminDb.collection('profiles').doc(uid).get(),
      adminDb.collection('savedContacts').where('profileId', '==', uid).get(),
      adminDb.collection('linkClicks')
        .where('profileId', '==', uid)
        .where('clickedAt', '>=', thirtyDaysAgo)
        .get(),
      adminDb.collection('modules').where('profileId', '==', uid).get(),
    ]);

  const allScans   = scansSnap.docs.map(d => d.data() as ScanDoc);
  const profile    = profileSnap.exists ? (profileSnap.data() as ProfileDoc) : null;
  const sortedScans = [...allScans].sort((a, b) => b.scannedAt.localeCompare(a.scannedAt));

  const modules      = modulesSnap.docs.map(d => d.data() as ModuleDoc);
  const activeModules = modules.filter(m => m.isActive).map(m => m.type);

  /* ── per-module data fetches ─────────────────────────────────────────── */
  const hasModule = (t: string) => activeModules.includes(t);

  const [
    loyaltySnap, eventSnap, accessSnap, memberSnap,
  ] = await Promise.all([
    hasModule('loyalty')
      ? adminDb.collection('loyaltyCards').where('profileId', '==', uid).get()
      : Promise.resolve(null),
    hasModule('event')
      ? adminDb.collection('eventRegistrations').where('profileId', '==', uid).get()
      : Promise.resolve(null),
    hasModule('access')
      ? adminDb.collection('accessLogs').where('profileId', '==', uid).get()
      : Promise.resolve(null),
    hasModule('member')
      ? adminDb.collection('memberCards').where('profileId', '==', uid).get()
      : Promise.resolve(null),
  ]);

  /* ── menu stats ──────────────────────────────────────────────────────── */
  let menuStats: OverviewProps['menuStats'] = null;
  if (hasModule('menu')) {
    const menuDoc = modules.find(m => m.type === 'menu');
    if (menuDoc?.config) {
      const cfg = menuDoc.config as {
        restaurantName?: string;
        whatsapp?:       string;
        currency?:       string;
        categories?:     MenuCategory[];
      };
      const cats  = Array.isArray(cfg.categories) ? cfg.categories : [];
      const items = cats.reduce((s, c) => s + (Array.isArray(c.items) ? c.items.length : 0), 0);
      menuStats = {
        restaurantName:  cfg.restaurantName ?? '',
        totalCategories: cats.length,
        totalItems:      items,
        currency:        cfg.currency ?? 'FCFA',
        whatsapp:        cfg.whatsapp,
      };
    } else {
      menuStats = { restaurantName: '', totalCategories: 0, totalItems: 0, currency: 'FCFA' };
    }
  }

  /* ── loyalty stats ───────────────────────────────────────────────────── */
  let loyaltyStats: OverviewProps['loyaltyStats'] = null;
  if (loyaltySnap) {
    const cards = loyaltySnap.docs.map(d => d.data() as LoyaltyCardDoc);
    const sorted = [...cards].sort((a, b) =>
      (b.lastStampAt ?? b.createdAt ?? '').localeCompare(a.lastStampAt ?? a.createdAt ?? ''),
    );
    loyaltyStats = {
      totalCards:  cards.length,
      totalStamps: cards.reduce((s, c) => s + (c.stamps ?? 0), 0),
      recent:      sorted.slice(0, 8).map(c => ({
        phone:       c.phone,
        stamps:      c.stamps,
        lastStampAt: c.lastStampAt,
      })),
    };
  }

  /* ── event stats ─────────────────────────────────────────────────────── */
  let eventStats: OverviewProps['eventStats'] = null;
  if (eventSnap) {
    const regs = eventSnap.docs.map(d => d.data() as EventRegistration);
    const sorted = [...regs].sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));
    const eventDoc = modules.find(m => m.type === 'event');
    const currency = (eventDoc?.config as { currency?: string } | undefined)?.currency ?? 'FCFA';
    eventStats = {
      totalRegistrations: regs.length,
      totalRevenue:       regs.reduce((s, r) => s + (r.ticketPrice ?? 0), 0),
      currency,
      recent: sorted.slice(0, 8).map(r => ({
        name:           r.name,
        ticketTypeName: r.ticketTypeName,
        registeredAt:   r.registeredAt,
        ticketPrice:    r.ticketPrice,
      })),
    };
  }

  /* ── access stats ────────────────────────────────────────────────────── */
  let accessStats: OverviewProps['accessStats'] = null;
  if (accessSnap) {
    const logs = accessSnap.docs.map(d => d.data() as AccessLog);
    const sorted = [...logs].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    accessStats = {
      total:   logs.length,
      granted: logs.filter(l => l.status === 'granted').length,
      denied:  logs.filter(l => l.status === 'denied').length,
      recent:  sorted.slice(0, 10).map(l => ({
        zoneName:   l.zoneName,
        holderName: l.holderName,
        status:     l.status,
        timestamp:  l.timestamp,
      })),
    };
  }

  /* ── member stats ────────────────────────────────────────────────────── */
  let memberStats: OverviewProps['memberStats'] = null;
  if (memberSnap) {
    const members = memberSnap.docs.map(d => d.data() as MemberCardDoc);
    const sorted  = [...members].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const byLevel: Record<string, number> = {};
    for (const m of members) {
      byLevel[m.level] = (byLevel[m.level] ?? 0) + 1;
    }
    memberStats = {
      total:   members.length,
      active:  members.filter(m => m.isActive).length,
      byLevel,
      recent:  sorted.slice(0, 8).map(m => ({
        memberName: m.memberName,
        level:      m.level,
        isActive:   m.isActive,
      })),
    };
  }

  const totalClicks = clicksSnap.size;
  const totalScans  = allScans.length;

  return {
    profile:       profile ? { displayName: profile.displayName ?? '', username: profile.username ?? '' } : null,
    totalScans,
    totalClicks,
    totalContacts: contactsSnap.size,
    recentScans:   sortedScans.slice(0, 6).map(s => ({ device: s.device ?? '', scannedAt: s.scannedAt })),
    activeModules,
    menuStats,
    loyaltyStats,
    eventStats,
    accessStats,
    memberStats,
  };
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default async function DashboardPage() {
  const user = await requireAuth();

  let data: OverviewProps;
  try {
    data = await getDashboardData(user.uid);
  } catch (err) {
    console.error('[dashboard] data fetch error:', err);
    data = {
      profile: null, totalScans: 0, totalClicks: 0, totalContacts: 0,
      recentScans: [], activeModules: [],
      menuStats: null, loyaltyStats: null, eventStats: null,
      accessStats: null, memberStats: null,
    };
  }

  return <OverviewClient {...data} />;
}
