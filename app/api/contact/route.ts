import { NextRequest, NextResponse } from 'next/server';
import * as postmark from 'postmark';

const client = new postmark.ServerClient(process.env.POSTMARK_SERVER_TOKEN ?? '');

export async function POST(req: NextRequest) {
  const { name, email, company, message } = await req.json() as {
    name: string; email: string; company?: string; message: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }

  try {
    await client.sendEmail({
      From:     'We Connect <service@weconnect.cards>',
      To:       'contact@weconnect.cards',
      ReplyTo:  email,
      Subject:  `[Contact Équipe] ${name}${company ? ` — ${company}` : ''}`,
      TextBody: `De: ${name} (${email})\nEntreprise: ${company ?? 'N/A'}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Email non envoyé.' }, { status: 500 });
  }
}
