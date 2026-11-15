import type { Metadata, Viewport } from 'next';
import { checkIn, currentDevice, loadEvent, loadPass } from '@/lib/events-server';
import { DENY_LABELS, formatEventDate, formatTime, type Decision, type EventCategory } from '@/lib/events';
import PassView from '@/components/events/PassView';
import GateResult, { type GateTone } from '@/components/events/GateResult';
import DeskAssociate from '@/components/events/DeskAssociate';
import styles from '@/components/events/events.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Pass — We Connect', robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: '#F4F7FB', viewportFit: 'cover' };

type Props = { params: Promise<{ code: string }> };

/**
 * What an NFC pass (card, wristband, badge) opens.
 * - On a staff phone enrolled for this event: the gate result (or the desk screen).
 * - Anywhere else: the guest's pass.
 */
export default async function PassPage({ params }: Props) {
  const { code } = await params;
  const pass  = await loadPass(code.toUpperCase());
  const event = pass ? await loadEvent(pass.eventId) : null;
  const category = event?.categories.find((c) => c.id === pass?.categoryId);

  if (!pass || !event || !category) {
    return (
      <div className={styles.page}>
        <main className={styles.center}>
          <p className={styles.bigEmoji} aria-hidden>🔍</p>
          <h1 className={styles.h1}>Pass introuvable</h1>
          <p className={styles.muted}>Ce support NFC n’est rattaché à aucun événement.</p>
        </main>
      </div>
    );
  }

  const device = await currentDevice();
  const staffHere = device && device.eventId === event.id;

  if (staffHere && device.mode === 'guichet') {
    return (
      <DeskAssociate
        code={pass.code}
        serial={pass.serial}
        category={{ name: category.name, color: category.color }}
        linkedTicket={pass.ticketRef}
        holderName={pass.holderName}
        disabled={pass.status === 'disabled'}
        eventName={event.name}
        deviceName={device.name}
      />
    );
  }

  if (staffHere) {
    const result = await checkIn(event, pass.code, device);
    if (result) {
      const zoneName = event.zones.find((z) => z.id === device.zoneId)?.name ?? '';
      const { tone, title, detail } = describe(result.decision, result.category, {
        lastEntryAt: result.pass.lastEntryAt,
        lastZone:    event.zones.find((z) => z.id === result.pass.lastZoneId)?.name ?? '',
        zones:       event.zones,
        opensAt:     event.opensAt,
        endsAt:      event.endsAt,
      });
      return (
        <GateResult
          tone={tone}
          title={title}
          detail={detail}
          category={{ name: category.name, color: category.color }}
          serial={pass.serial}
          holderName={pass.holderName}
          ticketLinked={!!pass.ticketRef}
          place={`${zoneName} · ${device.name}`}
          time={formatTime(result.at)}
        />
      );
    }
  }

  // Guest view (or a staff phone of another event)
  return (
    <PassView
      event={{
        name: event.name, venue: event.venue, opensAt: event.opensAt, endsAt: event.endsAt,
        description: event.description, posterUrl: event.posterUrl, program: event.program, links: event.links,
        archived: event.status === 'archived',
      }}
      category={{ name: category.name, color: category.color }}
      serial={pass.serial}
      support={pass.support}
      holderName={pass.holderName}
      disabled={pass.status === 'disabled'}
    />
  );
}

function describe(
  decision: Decision,
  category: EventCategory,
  ctx: { lastEntryAt: string | null; lastZone: string; zones: { id: string; name: string }[]; opensAt: string; endsAt: string },
): { tone: GateTone; title: string; detail: string } {
  if (decision.ok) {
    if (decision.direction === 'out') return { tone: 'out', title: 'Sortie enregistrée', detail: 'Au revoir !' };
    return {
      tone: 'ok',
      title: 'Valide',
      detail: decision.repeat ? `Déjà validé sur ce téléphone à ${formatTime(ctx.lastEntryAt)}` : 'Bonne soirée !',
    };
  }
  const title = DENY_LABELS[decision.reason];
  switch (decision.reason) {
    case 'already':        return { tone: 'no', title, detail: `Entré à ${formatTime(ctx.lastEntryAt)}${ctx.lastZone ? ` · ${ctx.lastZone}` : ''}` };
    case 'inside':         return { tone: 'no', title, detail: `Entré à ${formatTime(ctx.lastEntryAt)} — sortie non scannée` };
    case 'zone': {
      const names = category.zoneIds.map((id) => ctx.zones.find((z) => z.id === id)?.name).filter(Boolean).join(', ');
      return { tone: 'no', title, detail: names ? `Ce pass donne accès à : ${names}` : '' };
    }
    case 'not_yet':        return { tone: 'no', title, detail: `Valide à partir du ${formatEventDate(category.validFrom || ctx.opensAt)}` };
    case 'expired':        return { tone: 'no', title, detail: `Validité terminée le ${formatEventDate(category.validTo || ctx.endsAt)}` };
    case 'not_associated': return { tone: 'warn', title, detail: 'Envoyez la personne au guichet pour associer son billet.' };
    case 'disabled':       return { tone: 'no', title, detail: 'Signalé perdu ou bloqué par l’organisateur.' };
    case 'archived':       return { tone: 'no', title, detail: 'Cet événement est clôturé.' };
  }
}
