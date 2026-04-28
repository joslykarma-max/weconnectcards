import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { name, email, company, message } = await req.json() as {
    name: string; email: string; company?: string; message: string;
  };

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from:    'We Connect <noreply@weconnect.cards>',
      to:      'contact@weconnect.cards',
      replyTo: email,
      subject: `[Contact Équipe] ${name}${company ? ` — ${company}` : ''}`,
      text:    `De: ${name} (${email})\nEntreprise: ${company ?? 'N/A'}\n\n${message}`,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Email non envoyé.' }, { status: 500 });
  }
}
