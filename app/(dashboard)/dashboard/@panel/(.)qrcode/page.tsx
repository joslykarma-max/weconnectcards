import PanelFrame from '@/components/dashboard/shell/PanelFrame';
import SectionPage from '../../qrcode/page';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
// Pages that read the query string (e.g. ?profileId=) get it unchanged
const Section = SectionPage as unknown as React.ComponentType<{ searchParams: SearchParams }>;

export default function QrcodePanel({ searchParams }: { searchParams: SearchParams }) {
  return <PanelFrame title="QR codes"><Section searchParams={searchParams} /></PanelFrame>;
}
