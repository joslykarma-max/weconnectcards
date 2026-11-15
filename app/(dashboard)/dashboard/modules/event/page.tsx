import { redirect } from 'next/navigation';

// The self-service event page (ticket sales) was replaced by NFC passes supplied by We Connect.
export default function OldEventModulePage() {
  redirect('/dashboard/events');
}
