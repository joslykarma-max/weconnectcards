import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .trim();
}

export function getDeviceFromUA(ua: string): 'iOS' | 'Android' | 'Other' {
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
  if (/Android/i.test(ua))          return 'Android';
  return 'Other';
}

export function generateVCard(profile: {
  displayName: string;
  title?: string | null;
  company?: string | null;
  avatar?: string | null;
  username: string;
  links?: Array<{ type: string; url: string }>;
}): string {
  const phone = profile.links?.find((l) => l.type === 'phone')?.url?.replace('tel:', '');
  const email = profile.links?.find((l) => l.type === 'email')?.url?.replace('mailto:', '');
  const url   = `${process.env.NEXT_PUBLIC_URL}/${profile.username}`;

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.displayName}`,
    profile.title   ? `TITLE:${profile.title}`   : null,
    profile.company ? `ORG:${profile.company}`   : null,
    phone           ? `TEL:${phone}`             : null,
    email           ? `EMAIL:${email}`           : null,
    `URL:${url}`,
    'END:VCARD',
  ].filter(Boolean);

  return lines.join('\r\n');
}

export function formatDate(date: Date | string, locale = 'fr-FR'): string {
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return 'à l\'instant';
  if (mins  < 60) return `il y a ${mins} min`;
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${days}j`;
}
