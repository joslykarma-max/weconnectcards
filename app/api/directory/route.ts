import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { ProfileDoc } from '@/lib/types';

export interface DirectoryProfile {
  id:       string;
  username: string;
  displayName: string;
  title?:   string | null;
  company?: string | null;
  avatar?:  string | null;
  sector?:  string | null;
  bio?:     string | null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sector = searchParams.get('sector') ?? '';
  const q      = (searchParams.get('q') ?? '').toLowerCase().trim();

  const snap = await adminDb.collection('profiles')
    .where('isPublic',     '==', true)
    .where('inDirectory',  '==', true)
    .get();

  let profiles: DirectoryProfile[] = snap.docs.map((d) => {
    const data = d.data() as ProfileDoc;
    return {
      id:          d.id,
      username:    data.username,
      displayName: data.displayName,
      title:       data.title    ?? null,
      company:     data.company  ?? null,
      avatar:      data.avatar   ?? null,
      sector:      data.sector   ?? null,
      bio:         data.bio      ?? null,
    };
  });

  if (sector) {
    profiles = profiles.filter((p) => p.sector === sector);
  }

  if (q) {
    profiles = profiles.filter((p) =>
      p.displayName.toLowerCase().includes(q) ||
      (p.title    ?? '').toLowerCase().includes(q) ||
      (p.company  ?? '').toLowerCase().includes(q) ||
      (p.sector   ?? '').toLowerCase().includes(q)
    );
  }

  return NextResponse.json(profiles);
}
