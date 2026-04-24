import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { TeamDoc, TeamMemberDoc, UserDoc } from '@/lib/types';

// POST — invite a member
export async function POST(req: NextRequest) {
  const user = await requireAuth();

  const userSnap = await adminDb.collection('users').doc(user.uid).get();
  if (!userSnap.exists || (userSnap.data() as UserDoc).plan !== 'pro') {
    return NextResponse.json({ error: 'Plan Pro requis.' }, { status: 403 });
  }

  const { email, role } = await req.json() as { email: string; role: 'admin' | 'member' };
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || !role) {
    return NextResponse.json({ error: 'Email et rôle requis.' }, { status: 400 });
  }

  if (normalizedEmail === user.email?.toLowerCase()) {
    return NextResponse.json({ error: 'Vous ne pouvez pas vous inviter vous-même.' }, { status: 400 });
  }

  const teamRef = adminDb.collection('teams').doc(user.uid);

  // Create team doc if it doesn't exist
  const teamSnap = await teamRef.get();
  if (!teamSnap.exists) {
    const profileSnap = await adminDb.collection('profiles').doc(user.uid).get();
    const company = (profileSnap.data() as { company?: string })?.company ?? 'Mon équipe';
    await teamRef.set({
      name:      company,
      ownerId:   user.uid,
      createdAt: new Date().toISOString(),
    } as TeamDoc);
  }

  const memberRef = teamRef.collection('members').doc(normalizedEmail);
  const existing  = await memberRef.get();
  if (existing.exists) {
    return NextResponse.json({ error: 'Ce membre est déjà dans l\'équipe.' }, { status: 409 });
  }

  // Check if this email already has a user account to link
  let linkedUid: string | undefined;
  try {
    const existingUser = await adminDb.collection('users').where('email', '==', normalizedEmail).limit(1).get();
    if (!existingUser.empty) linkedUid = existingUser.docs[0].id;
  } catch { /* ignore */ }

  const member: TeamMemberDoc = {
    email:     normalizedEmail,
    role,
    status:    linkedUid ? 'active' : 'pending',
    invitedAt: new Date().toISOString(),
    ...(linkedUid ? { uid: linkedUid, joinedAt: new Date().toISOString() } : {}),
  };

  await memberRef.set(member);

  return NextResponse.json({ success: true, member: { id: normalizedEmail, ...member } });
}

// DELETE — remove a member
export async function DELETE(req: NextRequest) {
  const user  = await requireAuth();
  const email = new URL(req.url).searchParams.get('email');

  if (!email) return NextResponse.json({ error: 'Email requis.' }, { status: 400 });

  await adminDb.collection('teams').doc(user.uid)
    .collection('members').doc(email.toLowerCase()).delete();

  return NextResponse.json({ success: true });
}

// PATCH — update team name
export async function PATCH(req: NextRequest) {
  const user = await requireAuth();
  const { name } = await req.json() as { name: string };

  if (!name?.trim()) return NextResponse.json({ error: 'Nom requis.' }, { status: 400 });

  await adminDb.collection('teams').doc(user.uid).set(
    { name: name.trim() },
    { merge: true },
  );

  return NextResponse.json({ success: true });
}
