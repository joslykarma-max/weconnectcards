import { NextRequest, NextResponse } from 'next/server';
import { FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { requireAuth } from '@/lib/session';
import { adminDb } from '@/lib/firebase-admin';
import type { CardDoc } from '@/lib/types';

/**
 * "Changer ma carte" — step 2: links the new card by its NFC code.
 * The new card takes over everything the deactivated one carried (profile,
 * module, access/member badges); the old card keeps its code so it stays
 * blocked and can't be claimed by anyone else.
 */
export async function POST(req: NextRequest) {
  const user = await requireAuth();
  const { cardId, nfcId } = await req.json() as { cardId?: string; nfcId?: string };

  const code = nfcId?.trim().toUpperCase();
  if (!cardId) return NextResponse.json({ error: 'Carte manquante.' }, { status: 400 });
  if (!code)   return NextResponse.json({ error: 'Entre le code NFC de ta nouvelle carte.' }, { status: 400 });

  const oldRef  = adminDb.collection('cards').doc(cardId);
  const oldSnap = await oldRef.get();
  const old     = oldSnap.exists ? (oldSnap.data() as CardDoc) : null;
  if (!old || old.userId !== user.uid) {
    return NextResponse.json({ error: 'Carte introuvable.' }, { status: 404 });
  }
  if (old.status !== 'deactivated') {
    return NextResponse.json({ error: 'Désactive d\'abord l\'ancienne carte.' }, { status: 400 });
  }
  if (old.replacedBy) {
    return NextResponse.json({ error: 'Cette carte a déjà été remplacée.' }, { status: 409 });
  }
  if (old.nfcId === code) {
    return NextResponse.json({ error: 'C\'est le code de l\'ancienne carte. Entre celui de la nouvelle.' }, { status: 400 });
  }

  // ── Resolve the new card ────────────────────────────────────────────────────
  const [codeSnap, orderedSnap] = await Promise.all([
    adminDb.collection('cards').where('nfcId', '==', code).limit(1).get(),
    adminDb.collection('cards')
      .where('userId', '==', user.uid)
      .where('status', 'in', ['pending', 'shipped'])
      .get(),
  ]);
  const codeDoc  = codeSnap.empty ? null : codeSnap.docs[0];
  const codeData = codeDoc ? (codeDoc.data() as CardDoc) : null;

  // Oldest ordered card still waiting for its code — the card the customer bought
  const ordered = orderedSnap.docs
    .filter((d) => !(d.data() as CardDoc).nfcId)
    .sort((a, b) => ((a.data() as CardDoc).orderedAt ?? '').localeCompare((b.data() as CardDoc).orderedAt ?? ''))[0];

  const batch = adminDb.batch();
  let target: QueryDocumentSnapshot;

  if (codeDoc && codeData) {
    if (codeData.userId && codeData.userId !== user.uid) {
      return NextResponse.json({ error: 'Cette carte est déjà liée à un autre compte.' }, { status: 409 });
    }
    if (codeData.userId === user.uid) {
      if (!['pending', 'shipped', 'active'].includes(codeData.status)) {
        return NextResponse.json({ error: 'Cette carte a été désactivée.' }, { status: 400 });
      }
      // An active card already serving its own profile or badge is not a fresh replacement
      if (codeData.status === 'active' && (codeData.profileId || codeData.accessCardId || codeData.memberCardId)) {
        return NextResponse.json({ error: 'Cette carte est déjà utilisée avec son propre profil.' }, { status: 409 });
      }
      target = codeDoc;
    } else if (ordered) {
      // Unclaimed stock card: its code moves onto the ordered card, the stock entry goes
      target = ordered;
      batch.delete(codeDoc.ref);
    } else {
      target = codeDoc;
    }
  } else if (ordered) {
    target = ordered;
  } else {
    return NextResponse.json({
      error: 'Code NFC invalide. Vérifie le code imprimé dans l\'emballage de ta nouvelle carte.',
    }, { status: 404 });
  }

  // ── Hand everything over to the new card ───────────────────────────────────
  const now     = new Date().toISOString();
  const current = target.data() as CardDoc;

  batch.update(target.ref, {
    userId:      user.uid,
    nfcId:       code,
    status:      'active',
    activatedAt: current.status === 'active' && current.activatedAt ? current.activatedAt : now,
    replaces:    oldSnap.id,
    // No profileId means the old card showed the main profile — keep it explicit
    profileId:   old.profileId ?? user.uid,
    ...(old.selectedModule ? { selectedModule: old.selectedModule } : {}),
    ...(old.accessCardId   ? { accessCardId:   old.accessCardId }   : {}),
    ...(old.memberCardId   ? { memberCardId:   old.memberCardId }   : {}),
  });
  batch.update(oldRef, {
    replacedBy:   target.id,
    profileId:    FieldValue.delete(),
    accessCardId: FieldValue.delete(),
    memberCardId: FieldValue.delete(),
  });

  const [profileSnap, accessSnap, memberSnap] = await Promise.all([
    old.profileId && old.profileId !== user.uid ? adminDb.collection('profiles').doc(old.profileId).get() : null,
    old.accessCardId ? adminDb.collection('accessCards').doc(`${user.uid}_${old.accessCardId}`).get() : null,
    old.memberCardId ? adminDb.collection('memberCards').doc(`${user.uid}_${old.memberCardId}`).get() : null,
  ]);
  // A dedicated profile records which card it belongs to (dashboard switcher label)
  if (profileSnap?.exists) batch.update(profileSnap.ref, { cardId: target.id });
  // Badges keep the physical card's code — point them at the new one
  if (accessSnap?.exists) batch.update(accessSnap.ref, { nfcId: code });
  if (memberSnap?.exists) batch.update(memberSnap.ref, { nfcId: code });

  await batch.commit();
  return NextResponse.json({ success: true, cardId: target.id });
}
