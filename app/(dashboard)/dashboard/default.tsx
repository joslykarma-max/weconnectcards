import { notFound } from 'next/navigation';

// Unknown /dashboard/* address: proper 404 instead of an empty page
export default function DashboardDefault() {
  notFound();
}
