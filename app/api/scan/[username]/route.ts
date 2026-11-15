import { NextRequest, NextResponse } from 'next/server';
import { resolveUsername } from '@/lib/profiles';

// Old tag format (/api/scan/<username>): the visit is counted once, by the profile page.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const base = new URL(req.url).origin;
  const resolved = await resolveUsername(username);
  if (!resolved) return NextResponse.redirect(`${base}/`);
  return NextResponse.redirect(`${base}/${encodeURIComponent(username)}?src=nfc`);
}
