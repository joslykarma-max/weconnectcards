import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CustomModuleRequestDoc, UserDoc } from '@/lib/types';

export async function POST(req: NextRequest) {
  const user = await requireAuth();

  const { moduleName, description, useCase, budget, timeline } = await req.json() as {
    moduleName:  string;
    description: string;
    useCase:     string;
    budget?:     string;
    timeline?:   string;
  };

  if (!moduleName?.trim() || !description?.trim() || !useCase?.trim()) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }

  const userSnap = await adminDb.collection('users').doc(user.uid).get();
  const userData = userSnap.exists ? (userSnap.data() as UserDoc) : null;

  const now    = new Date().toISOString();
  const docRef = adminDb.collection('customModuleRequests').doc();

  const doc: CustomModuleRequestDoc = {
    id:          docRef.id,
    uid:         user.uid,
    email:       user.email ?? userData?.email ?? '',
    displayName: userData?.displayName ?? user.name ?? '',
    moduleName:  moduleName.trim(),
    description: description.trim(),
    useCase:     useCase.trim(),
    budget:      budget?.trim() || undefined,
    timeline:    timeline?.trim() || undefined,
    status:      'pending',
    createdAt:   now,
    updatedAt:   now,
  };

  await docRef.set(doc);
  return NextResponse.json({ success: true, id: docRef.id }, { status: 201 });
}

export async function GET() {
  const user = await requireAuth();

  const snap = await adminDb
    .collection('customModuleRequests')
    .where('uid', '==', user.uid)
    .get();

  const requests = snap.docs
    .map((d) => d.data() as CustomModuleRequestDoc)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json(requests);
}
