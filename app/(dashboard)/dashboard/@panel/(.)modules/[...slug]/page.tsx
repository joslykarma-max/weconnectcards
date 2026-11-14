import { notFound } from 'next/navigation';
import PanelFrame from '@/components/dashboard/shell/PanelFrame';

// Module settings pages open in the panel too (loaded on demand)
const PAGES: Record<string, { title: string; load: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }> }> = {
  access:            { title: 'Clé d’accès',          load: () => import('../../../modules/access/page') },
  agency:            { title: 'Agence',               load: () => import('../../../modules/agency/page') },
  certificate:       { title: 'Certificat',           load: () => import('../../../modules/certificate/page') },
  custom:            { title: 'Module sur mesure',    load: () => import('../../../modules/custom/page') },
  event:             { title: 'Pass événement',       load: () => import('../../../modules/event/page') },
  loyalty:           { title: 'Carte de fidélité',    load: () => import('../../../modules/loyalty/page') },
  medical:           { title: 'Carte médicale',       load: () => import('../../../modules/medical/page') },
  member:            { title: 'Carte membre',         load: () => import('../../../modules/member/page') },
  menu:              { title: 'Menu restaurant',      load: () => import('../../../modules/menu/page') },
  'menu/restaurant': { title: 'Restaurant',           load: () => import('../../../modules/menu/restaurant/page') },
  'menu/tables':     { title: 'Tables',               load: () => import('../../../modules/menu/tables/page') },
  portfolio:         { title: 'Portfolio',            load: () => import('../../../modules/portfolio/page') },
  review:            { title: 'Tap to Review',        load: () => import('../../../modules/review/page') },
};

export default async function ModulePanel({ params, searchParams }: {
  params: Promise<{ slug: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const entry = PAGES[slug.join('/')];
  if (!entry) notFound();
  const Page = (await entry.load()).default;
  return <PanelFrame title={entry.title}><Page searchParams={searchParams} /></PanelFrame>;
}
