'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import { MODULES } from './modules-data';

type Audience = 'perso' | 'pro';

// Delivery step: the same statuses a customer sees on their card in the dashboard
const DELIVERY = [
  { label: 'En attente', sub: 'Commande enregistrée',          done: true },
  { label: 'Expédiée',   sub: 'En route vers votre adresse',   done: true },
  { label: 'Active',     sub: 'Activée depuis votre espace',   done: false },
];

const STEPS = [
  {
    number: '01', title: 'Commandez votre carte', accent: '#6366F1',
    desc: 'Achetez votre carte NFC en ligne et choisissez votre édition : Midnight, Electric, Glass ou Métal. Votre compte est créé en même temps.',
    visual: (
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg, #0D0E14, #181B26)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 20, padding: 32, boxShadow: '0 40px 80px rgba(0,0,0,0.2), 0 0 40px rgba(99,102,241,0.08)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
            <div style={{ width: 50, height: 34, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', borderRadius: 6 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {['Midnight', 'Electric', 'Glass'].map((e, i) => (
                <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: i === 0 ? 1 : 0.4 }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1, color: i === 0 ? '#818CF8' : '#6B7280' }}>{e}</span>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: `2px solid ${i === 0 ? '#6366F1' : 'rgba(255,255,255,0.1)'}`, background: i === 0 ? 'rgba(99,102,241,0.3)' : 'transparent' }} />
                </div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', marginBottom: 6 }}>Votre Nom</p>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#9CA3AF', textTransform: 'uppercase' }}>Votre Fonction</p>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #6366F1, #06B6D4)', borderRadius: '0 0 20px 20px' }} />
        </div>
        <div style={{ position: 'absolute', top: -16, right: -16, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', borderRadius: 12, padding: '8px 16px', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#fff', letterSpacing: 1 }}>4 ÉDITIONS</span>
        </div>
      </div>
    ),
  },
  {
    number: '02', title: 'Recevez-la chez vous', accent: '#22C55E',
    desc: 'Votre carte est livrée à votre adresse, partout en Afrique et dans le monde. Vous suivez son statut depuis votre espace, puis vous l’activez en quelques secondes.',
    visual: (
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <div className="lp-card" style={{ padding: 'clamp(20px, 5vw, 28px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }} aria-hidden>📦</div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F172A', margin: 0 }}>Votre commande</p>
              <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>Carte NFC · Édition Midnight</p>
            </div>
          </div>
          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {DELIVERY.map((s, i) => (
              <li key={s.label} style={{ display: 'flex', gap: 14, position: 'relative', paddingBottom: i < DELIVERY.length - 1 ? 18 : 0 }}>
                {i < DELIVERY.length - 1 && <span aria-hidden style={{ position: 'absolute', left: 11, top: 26, bottom: 2, width: 2, background: s.done ? '#86EFAC' : '#E2E8F0' }} />}
                <span aria-hidden style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.done ? '#22C55E' : '#FFFFFF', border: s.done ? 'none' : '2px solid #22C55E', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                  {s.done ? '✓' : <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E', animation: 'lpBlink 2s ease-in-out infinite' }} />}
                </span>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14, color: '#0F172A', margin: 0, lineHeight: 1.5 }}>{s.label}</p>
                  <p style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{s.sub}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div style={{ position: 'absolute', top: -14, right: -10, background: '#FFFFFF', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10, padding: '7px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#0F172A', fontWeight: 600 }}>🌍 Livraison Afrique + Monde</span>
        </div>
      </div>
    ),
  },
  {
    number: '03', title: 'Configurez profil et modules', accent: '#06B6D4',
    desc: 'Depuis votre dashboard : photo, liens, thème et modules métier. Chaque modification est en ligne immédiatement. Ensuite, il suffit d’approcher votre carte d’un smartphone pour partager votre profil, sans application.',
    visual: (
      <div style={{ position: 'relative', width: '100%', maxWidth: 420, margin: '0 auto' }}>
        <div style={{ background: '#0D0E14', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px', background: '#181B26', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['#FF5F57','#FFBD2E','#28CA41'].map((c) => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
          </div>
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne, sans-serif', fontWeight: 800, color: '#fff', fontSize: 16, flexShrink: 0 }}>VN</div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 10, background: 'rgba(255,255,255,0.15)', borderRadius: 4, width: '60%', marginBottom: 6 }} />
                <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 4, width: '40%' }} />
              </div>
              <div style={{ padding: '4px 10px', background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 4 }}><span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#06B6D4', letterSpacing: 1 }}>ÉDITER</span></div>
            </div>
            {[{ icon: '📞', label: '+229 XX XX XX XX', color: '#22C55E' }, { icon: '💼', label: 'linkedin.com/in/vous', color: '#818CF8' }, { icon: '🌐', label: 'votresite.com', color: '#06B6D4' }].map((link) => (
              <div key={link.label} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 8, padding: '10px 12px' }}>
                <span style={{ fontSize: 14 }}>{link.icon}</span>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#9CA3AF', flex: 1 }}>{link.label}</span>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: link.color }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {[{ name: 'Fidélité', on: true }, { name: 'Menu', on: true }, { name: 'Avis', on: false }, { name: 'Événement', on: false }].map((m) => (
                <div key={m.name} style={{ padding: '4px 10px', borderRadius: 6, background: m.on ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.03)', border: `1px solid ${m.on ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.06)'}` }}>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: m.on ? '#06B6D4' : '#6B7280', letterSpacing: 0.5 }}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: -12, right: -12, background: '#FFFFFF', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 10, padding: '7px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#06B6D4', letterSpacing: 1 }}>⚡ TEMPS RÉEL</span>
        </div>
      </div>
    ),
  },
];

// Module pages shown at the end of each journey
const usages = (slugs: string[]) => slugs.map((slug) => MODULES.find((m) => m.slug === slug)!).filter(Boolean);
const PERSO_USAGES = [
  { slug: 'profile', emoji: '💼', name: 'Carte de visite pro', desc: 'Votre profil professionnel, toujours à jour', accent: '#6366F1' },
  ...usages(['portfolio', 'medical', 'review']),
];
const PRO_USAGES = usages(['loyalty', 'menu', 'review', 'access', 'certificate', 'member', 'event']);   // Tap to Review works for both

const PRO_STEPS = [
  { number: '01', title: 'Choisissez le module', desc: 'Fidélité, menu restaurant, accès, certificat, adhésion ou pass événement : chaque carte est dédiée à un usage précis.' },
  { number: '02', title: 'Indiquez le nombre de cartes', desc: 'Commandez pour vos clients, membres, salariés, invités ou produits, avec une personnalisation à vos couleurs.' },
  { number: '03', title: 'Recevez votre devis', desc: 'La facturation dépend du module choisi et du nombre de cartes commandées.' },
  { number: '04', title: 'Recevez et pilotez', desc: 'Les cartes arrivent prêtes à l’emploi. Vous mettez à jour le contenu et suivez les scans depuis un seul espace.' },
];

// Illustration: the same physical card, one per service
const PRO_CARDS = [
  { bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338CA 100%)', accent: '#818CF8', label: '🎟️ Pass Événement' },
  { bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', accent: '#9CA3AF', label: '🔑 Clé d’accès' },
  { bg: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)', accent: '#6366F1', label: '🎯 Carte de fidélité' },
];

function UsageButtons({ title, items }: { title: string; items: { slug: string; emoji: string; name: string; desc: string; accent: string }[] }) {
  return (
    <div style={{ marginTop: 8 }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#64748B', textTransform: 'uppercase', textAlign: 'center', marginBottom: 16 }}>{title}</p>
      <div className="hiw-usages">
        {items.map((m) => (
          <Link key={m.slug} href={`/modules/${m.slug}`} className="lp-card hiw-usage" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', minHeight: 72, textDecoration: 'none' }}>
            <span aria-hidden style={{ width: 44, height: 44, borderRadius: 14, background: `${m.accent}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{m.emoji}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#0F172A', lineHeight: 1.25 }}>{m.name}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: '#64748B', lineHeight: 1.45, marginTop: 2 }}>{m.desc}</span>
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={m.accent} strokeWidth="2.2" strokeLinecap="round" aria-hidden style={{ flexShrink: 0 }}><path d="M9 18l6-6-6-6" /></svg>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StepRow({ step, index }: { step: typeof STEPS[0]; index: number }) {
  const isEven = index % 2 === 0;
  const { ref, visible } = useScrollReveal();
  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginBottom: 88, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(40px)', transition: 'opacity 0.8s cubic-bezier(0.23,1,0.32,1), transform 0.8s cubic-bezier(0.23,1,0.32,1)' }} className="steps-alt-row">
      <div style={{ order: isEven ? 0 : 1 }} className="steps-alt-text">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, fontSize: 11, letterSpacing: 3, color: step.accent, textTransform: 'uppercase' }}>Étape {step.number}</span>
          <div style={{ height: 1, width: 40, background: step.accent, opacity: 0.4 }} />
        </div>
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(24px, 2.6vw, 34px)', letterSpacing: '-0.5px', color: '#0F172A', marginBottom: 16, lineHeight: 1.15 }}>{step.title}</h3>
        <p style={{ color: '#64748B', fontSize: 17, lineHeight: 1.8, maxWidth: 460 }}>{step.desc}</p>
      </div>
      <div style={{ order: isEven ? 1 : 0, display: 'flex', justifyContent: 'center' }} className="steps-alt-visual">{step.visual}</div>
    </div>
  );
}

function ProPanel() {
  const { ref, visible } = useScrollReveal(0.05);
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)', transition: 'opacity 0.7s cubic-bezier(0.23,1,0.32,1), transform 0.7s cubic-bezier(0.23,1,0.32,1)' }}>
      <div className="hiw-pro-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 0.9fr)', gap: 56, alignItems: 'center', marginBottom: 56 }}>
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(24px, 2.6vw, 34px)', color: '#0F172A', marginBottom: 12, lineHeight: 1.15 }}>
            Des cartes en volume, dédiées à votre service
          </h3>
          <p style={{ color: '#64748B', fontSize: 16.5, lineHeight: 1.75, marginBottom: 28 }}>
            Commerces, événements, associations, entreprises, marques : vous commandez vos cartes en grand nombre, chacune reliée au module dont vous avez besoin.
          </p>
          <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {PRO_STEPS.map((s) => (
              <li key={s.number} style={{ display: 'flex', gap: 16, background: '#FFFFFF', border: '1px solid #EDF1F6', borderRadius: 20, padding: '16px 18px', boxShadow: '0 6px 28px rgba(15,42,68,0.05)' }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: '#6366F1', background: '#EEF2FF', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.number}</span>
                <span>
                  <span style={{ display: 'block', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#0F172A', lineHeight: 1.3 }}>{s.title}</span>
                  <span style={{ display: 'block', fontSize: 14.5, color: '#64748B', lineHeight: 1.6, marginTop: 4 }}>{s.desc}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* One card per service */}
        <div aria-hidden style={{ position: 'relative', height: 380, maxWidth: 400, width: '100%', margin: '0 auto' }}>
          {PRO_CARDS.map((c, i) => (
            <div key={c.label} style={{ position: 'absolute', left: `${i * 9}%`, top: i * 62, width: '72%', aspectRatio: '85.6 / 54', background: c.bg, border: `1px solid ${c.accent}44`, borderRadius: 16, boxShadow: '0 24px 48px -16px rgba(15,23,42,0.45)', transform: `rotate(${-5 + i * 4}deg)`, padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* label on the top strip, which stays visible when the cards overlap */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#FFFFFF', color: '#0F172A', borderRadius: 999, padding: '5px 12px', fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap' }}>{c.label}</span>
                <span style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${c.accent}`, flexShrink: 0 }} />
              </div>
              <div style={{ width: 34, height: 24, borderRadius: 4, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', opacity: 0.9 }} />
            </div>
          ))}
          <div style={{ position: 'absolute', right: 0, bottom: 0, background: '#FFFFFF', border: '1px solid #EDF1F6', borderRadius: 14, padding: '10px 14px', boxShadow: '0 8px 24px rgba(15,42,68,0.12)', maxWidth: 220 }}>
            <span style={{ display: 'block', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: '#0F172A' }}>Facturation sur mesure</span>
            <span style={{ display: 'block', fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>Selon le module et le nombre de cartes</span>
          </div>
        </div>
      </div>

      <UsageButtons title="Les modules pour votre entreprise" items={PRO_USAGES} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
        <Link href="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 28px', borderRadius: 999, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 10px 28px -10px rgba(99,102,241,0.7)' }}>
          Demander un devis
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </Link>
      </div>
    </div>
  );
}

const AUDIENCES: { key: Audience; icon: string; label: string; hint: string }[] = [
  { key: 'perso', icon: '👤', label: 'Particulier', hint: 'Votre carte, votre profil' },
  { key: 'pro',   icon: '🏢', label: 'Entreprise',  hint: 'Des cartes en volume' },
];

export default function HowItWorks() {
  const [audience, setAudience] = useState<Audience>('perso');

  return (
    <section id="how-it-works" className="lp-section lp-deferred" style={{ background: 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 30%, #FFFFFF 70%, #F0F9FF 100%)', overflow: 'hidden' }}>
      <div className="grid-bg" style={{ position: 'absolute', inset: 0, opacity: 0.4 }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 4, color: '#06B6D4', textTransform: 'uppercase', marginBottom: 16 }}>Comment ça marche</p>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 'clamp(28px, 3.6vw, 46px)', letterSpacing: '-1px', lineHeight: 1.1, color: '#0F172A', marginBottom: 16 }}>Une carte, deux façons de l&apos;utiliser.</h2>
          <p style={{ color: '#64748B', fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>Vous êtes un particulier ou une entreprise ? Choisissez votre parcours.</p>
        </div>

        {/* Particulier / Entreprise toggle */}
        <div role="group" aria-label="Type de client" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', maxWidth: 520, margin: '0 auto 56px', padding: 6, background: '#FFFFFF', border: '1px solid #EDF1F6', borderRadius: 999, boxShadow: '0 6px 28px rgba(15,42,68,0.08)' }}>
          <span aria-hidden style={{ position: 'absolute', top: 6, bottom: 6, left: 6, width: 'calc(50% - 6px)', borderRadius: 999, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', boxShadow: '0 8px 20px -8px rgba(99,102,241,0.7)', transform: audience === 'pro' ? 'translateX(100%)' : 'none', transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1)' }} />
          {AUDIENCES.map((a) => {
            const on = audience === a.key;
            return (
              <button key={a.key} type="button" aria-pressed={on} aria-controls={`hiw-${a.key}`} onClick={() => setAudience(a.key)}
                style={{ position: 'relative', minHeight: 60, padding: '8px 12px', borderRadius: 999, border: 'none', cursor: 'pointer', textAlign: 'center', background: 'transparent', color: on ? '#FFFFFF' : '#334155', transition: 'color 0.3s ease' }}>
                <span style={{ display: 'block', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}><span aria-hidden>{a.icon} </span>{a.label}</span>
                <span style={{ display: 'block', fontSize: 12, opacity: on ? 0.9 : 0.7, marginTop: 1, lineHeight: 1.3 }}>{a.hint}</span>
              </button>
            );
          })}
        </div>

        <div id="hiw-perso" hidden={audience !== 'perso'}>
          {STEPS.map((step, i) => (<StepRow key={step.number} step={step} index={i} />))}
          <UsageButtons title="Les modules pour vous" items={PERSO_USAGES} />
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 36 }}>
            <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minHeight: 52, padding: '0 28px', borderRadius: 999, background: 'linear-gradient(135deg, #6366F1, #06B6D4)', color: '#fff', fontWeight: 700, fontSize: 16, textDecoration: 'none', boxShadow: '0 10px 28px -10px rgba(99,102,241,0.7)' }}>
              Commander ma carte
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </Link>
          </div>
        </div>
        <div id="hiw-pro" hidden={audience !== 'pro'}>
          <ProPanel />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .steps-alt-row    { grid-template-columns: 1fr !important; gap: 40px !important; margin-bottom: 64px !important; }
          .steps-alt-text   { order: 0 !important; }
          .steps-alt-visual { order: 1 !important; }
          .hiw-pro-grid     { grid-template-columns: 1fr !important; gap: 40px !important; }
        }
        /* Module buttons: equal widths, last row centred */
        .hiw-usages { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
        .hiw-usages > a { flex: 0 1 280px; }
        @media (max-width: 640px) { .hiw-usages > a { flex-basis: 100%; } }
        @media (hover: hover) {
          .hiw-usage { transition: transform 0.25s ease, box-shadow 0.25s ease; }
          .hiw-usage:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(15,42,68,0.12); }
        }
      `}</style>
    </section>
  );
}
