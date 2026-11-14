import PanelFrame from '@/components/dashboard/shell/PanelFrame';
import SectionPage from '../../card/page';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
// Pages that read the query string (e.g. ?profileId=) get it unchanged
const Section = SectionPage as unknown as React.ComponentType<{ searchParams: SearchParams }>;

export default function CardPanel({ searchParams }: { searchParams: SearchParams }) {
  return <PanelFrame title="Ma carte"><Section searchParams={searchParams} /></PanelFrame>;
}
