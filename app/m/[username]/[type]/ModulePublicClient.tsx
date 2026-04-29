'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import LogoStacked from '@/components/logo/LogoStacked';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';

function Shell({ children, backHref }: { children: React.ReactNode; backHref: string }) {
  return (
    <div style={{ minHeight: '100vh', background: '#08090C', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 16px 100px' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <Link href={backHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13, textDecoration: 'none', marginBottom: 32, fontFamily: 'DM Sans, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Voir le profil
        </Link>
        {children}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <LogoStacked symbolSize="sm" className="mx-auto" />
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#6B7280', marginTop: 8, textTransform: 'uppercase' }}>
            Powered by We Connect
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── LOYALTY ────────────────────────────────────────────────────────────────
type LoyaltyTier = { stamps: number; reward: string };
type LoyaltyCard = { stamps: number; tiers: LoyaltyTier[]; emoji: string };

function LoyaltyModule({ config, username, profileId }: { config: Record<string, unknown>; username: string; profileId: string }) {
  const [phase, setPhase]           = useState<'phone' | 'card' | 'rewarded'>('phone');
  const [phone, setPhone]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [card, setCard]             = useState<LoyaltyCard | null>(null);
  const [stampCode, setStampCode]   = useState('');
  const [stamping,  setStamping]    = useState(false);
  const [stampError, setStampError] = useState('');
  const [justStamped, setJustStamped]       = useState(false);
  const [triggeredTier, setTriggeredTier]   = useState<LoyaltyTier | null>(null);
  const [rewardedTier, setRewardedTier]     = useState<LoyaltyTier | null>(null);

  async function loadCard() {
    if (!phone.trim()) return;
    setLoading(true);
    const res  = await fetch(`/api/loyalty?profileId=${encodeURIComponent(profileId)}&phone=${encodeURIComponent(phone.trim())}`);
    const data = await res.json() as { stamps: number; tiers: LoyaltyTier[]; emoji: string; error?: string };
    setLoading(false);
    if (!res.ok) return;
    setCard(data);
    setPhase('card');
  }

  async function addStamp() {
    if (!stampCode.trim() || !card) return;
    setStamping(true);
    setStampError('');
    const res  = await fetch('/api/loyalty/stamp', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, phone: phone.trim(), code: stampCode.trim() }),
    });
    const data = await res.json() as { stamps: number; completed: boolean; triggeredTier: LoyaltyTier | null; error?: string };
    setStamping(false);
    if (!res.ok) { setStampError(data.error ?? 'Code incorrect.'); return; }
    setStampCode('');
    if (data.completed) {
      setRewardedTier(data.triggeredTier);
      setCard({ ...card, stamps: 0 });
      setPhase('rewarded');
    } else {
      setCard({ ...card, stamps: data.stamps });
      if (data.triggeredTier) {
        setTriggeredTier(data.triggeredTier);
        setTimeout(() => setTriggeredTier(null), 4000);
      } else {
        setJustStamped(true);
        setTimeout(() => setJustStamped(false), 2000);
      }
    }
  }

  const emoji = card?.emoji ?? (String(config.stampEmoji) || '⭐');

  // Compute next unclaimed tier based on current stamps
  const nextTier = card?.tiers.find(t => t.stamps > card.stamps) ?? null;
  const maxStamps = card?.tiers.length ? Math.max(...card.tiers.map(t => t.stamps)) : 10;

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Carte de fidélité</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 6 }}>
          {String(config.businessName || 'Mon Commerce')}
        </h1>
        {card?.tiers && card.tiers.length === 1 && (
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>
            {card.tiers[0].stamps} tampons = <strong style={{ color: '#F8F9FC' }}>{card.tiers[0].reward || 'une récompense'}</strong>
          </p>
        )}
        {card?.tiers && card.tiers.length > 1 && (
          <p style={{ color: '#9CA3AF', fontSize: 14 }}>{card.tiers.length} niveaux de récompense</p>
        )}
      </div>

      {/* Phase 1 — Saisie téléphone */}
      {phase === 'phone' && (
        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 28 }}>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 6 }}>Accéder à ma carte</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 20 }}>Entrez votre numéro pour voir ou créer votre carte de fidélité.</p>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+229 97 00 00 00"
            style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '14px 16px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 16, outline: 'none', boxSizing: 'border-box', marginBottom: 14 }}
            onKeyDown={e => { if (e.key === 'Enter') loadCard(); }}
          />
          <button
            onClick={loadCard}
            disabled={loading || !phone.trim()}
            style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: (!phone.trim() || loading) ? 0.6 : 1 }}
          >
            {loading ? 'Chargement...' : 'Voir ma carte →'}
          </button>
        </div>
      )}

      {/* Phase 2 — Carte personnelle */}
      {phase === 'card' && card && (
        <>
          {/* Compteur + barre de progression */}
          <div style={{ background: '#181B26', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 24, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>Ma carte</p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#818CF8' }}>
                {emoji} {card.stamps}
              </p>
            </div>

            {/* Barre de progression globale avec marqueurs */}
            <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'visible', marginBottom: 6 }}>
              <div style={{ height: '100%', width: `${(card.stamps / maxStamps) * 100}%`, background: 'linear-gradient(90deg, #6366F1, #818CF8)', transition: 'width 0.5s', borderRadius: 3 }} />
              {card.tiers.map((tier, i) => (
                <div key={i} style={{ position: 'absolute', top: -2, left: `${(tier.stamps / maxStamps) * 100}%`, transform: 'translateX(-50%)', width: 10, height: 10, borderRadius: '50%', background: card.stamps >= tier.stamps ? '#10B981' : 'rgba(255,255,255,0.15)', border: `2px solid ${card.stamps >= tier.stamps ? '#10B981' : 'rgba(255,255,255,0.1)'}`, zIndex: 1 }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>0</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>{maxStamps}</span>
            </div>

            {/* Paliers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
              {card.tiers.map((tier, i) => {
                const achieved = card.stamps >= tier.stamps;
                const isNext   = !achieved && (i === 0 || card.stamps >= card.tiers[i - 1].stamps);
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: achieved ? 'rgba(16,185,129,0.08)' : isNext ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${achieved ? 'rgba(16,185,129,0.25)' : isNext ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{achieved ? '✅' : isNext ? '🎯' : '🔒'}</span>
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: achieved ? '#10B981' : '#6B7280', flexShrink: 0, minWidth: 28 }}>{tier.stamps}✗</span>
                    <span style={{ flex: 1, color: achieved ? '#10B981' : isNext ? '#F8F9FC' : '#6B7280', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                      {tier.reward || '—'}
                    </span>
                    {isNext && !achieved && (
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#818CF8', flexShrink: 0 }}>
                        {tier.stamps - card.stamps} de plus
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notification palier intermédiaire atteint */}
          {triggeredTier && (
            <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '14px 18px', marginBottom: 12, textAlign: 'center' }}>
              <span style={{ fontSize: 28, display: 'block', marginBottom: 6 }}>🎁</span>
              <p style={{ color: '#10B981', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>Palier atteint !</p>
              <p style={{ color: '#F8F9FC', fontSize: 13, marginTop: 4 }}>{triggeredTier.reward}</p>
              <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 6 }}>Montrez cet écran au gérant pour obtenir votre récompense.</p>
            </div>
          )}

          {/* Notification tampon simple */}
          {justStamped && !triggeredTier && (
            <div style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, color: '#818CF8', fontSize: 14, textAlign: 'center' }}>
              {emoji} Tampon ajouté !
            </div>
          )}

          {/* Saisie code tampon */}
          <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 20 }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', marginBottom: 4 }}>Ajouter un tampon</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 14 }}>Demandez le code du jour au gérant après votre achat.</p>
            <input
              type="text"
              value={stampCode}
              onChange={e => { setStampCode(e.target.value); setStampError(''); }}
              placeholder="Code donné par le gérant"
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${stampError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '12px 14px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 15, outline: 'none', letterSpacing: 3, boxSizing: 'border-box', marginBottom: 10, textAlign: 'center' }}
              onKeyDown={e => { if (e.key === 'Enter') addStamp(); }}
            />
            {stampError && <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 10, textAlign: 'center' }}>{stampError}</p>}
            <button
              onClick={addStamp}
              disabled={stamping || !stampCode.trim()}
              style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: (!stampCode.trim() || stamping) ? 0.6 : 1 }}
            >
              {stamping ? 'Validation...' : nextTier ? `Valider (encore ${nextTier.stamps - card.stamps} pour ${nextTier.reward || 'prochain palier'})` : 'Valider le tampon'}
            </button>
          </div>

          <button onClick={() => { setPhase('phone'); setPhone(''); setCard(null); }}
            style={{ marginTop: 12, background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', width: '100%', fontFamily: 'Space Mono, monospace' }}>
            ← Changer de numéro
          </button>
        </>
      )}

      {/* Phase 3 — Récompense débloquée (palier final) */}
      {phase === 'rewarded' && (
        <div style={{ textAlign: 'center', padding: '40px 24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12 }}>
          <span style={{ fontSize: 56, display: 'block', marginBottom: 16 }}>🎁</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', marginBottom: 8 }}>
            Félicitations !
          </h2>
          <p style={{ color: '#818CF8', fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            {rewardedTier?.reward ?? String(config.reward || 'votre récompense')}
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 24 }}>
            Montrez cet écran au gérant pour obtenir votre récompense. Votre carte repart à zéro.
          </p>
          <button
            onClick={() => { setPhase('card'); setRewardedTier(null); }}
            style={{ padding: '12px 24px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#818CF8', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
          >
            Continuer à collecter →
          </button>
        </div>
      )}
    </Shell>
  );
}

// ─── MENU ────────────────────────────────────────────────────────────────────
type PubMenuItem = { id: string; name: string; description: string; price: number; emoji: string; available: boolean; imageUrl?: string };
type PubMenuCat  = { id: string; name: string; emoji: string; items: PubMenuItem[] };

function MenuModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const categories  = (config.categories as PubMenuCat[] | undefined) ?? [];
  const currency    = String(config.currency || 'FCFA');
  const whatsapp    = String(config.whatsapp || '').replace(/\D/g, '');

  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [cart, setCart]               = useState<Record<string, number>>({});

  const allItems  = categories.flatMap(c => c.items.filter(i => i.available !== false));
  const displayedCats = selectedCat === 'all' ? categories : categories.filter(c => c.id === selectedCat);

  const cartItems = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .flatMap(([id, qty]) => {
      const item = allItems.find(i => i.id === id);
      return item ? [{ item, qty }] : [];
    });
  const cartTotal = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const cartCount = cartItems.reduce((s, { qty }) => s + qty, 0);

  function add(id: string) { setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 })); }
  function sub(id: string) {
    setCart(p => {
      const n = (p[id] || 0) - 1;
      if (n <= 0) { const { [id]: _removed, ...rest } = p; return rest; }
      return { ...p, [id]: n };
    });
  }

  function orderOnWhatsApp() {
    const lines   = cartItems.map(({ item, qty }) => `• ${qty}x ${item.name} — ${(qty * item.price).toLocaleString('fr-FR')} ${currency}`).join('\n');
    const message = `Bonjour ! Je souhaite commander :\n\n${lines}\n\nTOTAL : ${cartTotal.toLocaleString('fr-FR')} ${currency}\n\nMerci 🙏`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
  }

  return (
    <Shell backHref={`/${username}`}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Menu</p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 6 }}>
          {String(config.restaurantName || 'Notre Restaurant')}
        </h1>
        {!!config.address   && <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 4 }}>📍 {String(config.address)}</p>}
        {!!config.openHours && <p style={{ color: '#6B7280', fontSize: 13, fontFamily: 'Space Mono, monospace' }}>🕐 {String(config.openHours)}</p>}
      </div>

      {categories.length === 0 ? (
        /* Legacy view — no categories configured yet */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {!!config.menuUrl && (
            <a href={String(config.menuUrl)} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 24px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 10, textDecoration: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17 }}>
              📋 Voir le menu
            </a>
          )}
          {!!config.whatsapp && (
            <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent('Bonjour, je souhaite passer une commande')}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '16px 24px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 10, textDecoration: 'none', color: '#10B981', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
              💬 Commander sur WhatsApp
            </a>
          )}
          {!config.menuUrl && !config.whatsapp && (
            <p style={{ color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 20 }}>Menu en cours de configuration.</p>
          )}
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20, msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}>
            <button onClick={() => setSelectedCat('all')}
              style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 20, background: selectedCat === 'all' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedCat === 'all' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, color: selectedCat === 'all' ? '#818CF8' : '#9CA3AF', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
              Tout
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 20, background: selectedCat === cat.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedCat === cat.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, color: selectedCat === cat.id ? '#818CF8' : '#9CA3AF', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                {cat.emoji} {cat.name}
              </button>
            ))}
          </div>

          {/* Items by category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28, paddingBottom: cartCount > 0 ? 104 : 0 }}>
            {displayedCats
              .filter(cat => cat.items.some(i => i.available !== false))
              .map(cat => (
                <div key={cat.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC' }}>{cat.name}</h2>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {cat.items.filter(i => i.available !== false).map(item => {
                      const qty = cart[item.id] || 0;
                      return (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: item.imageUrl ? '12px 16px' : '14px 16px', background: '#181B26', border: `1px solid ${qty > 0 ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, transition: 'border-color 0.2s' }}>
                          {item.imageUrl ? (
                            <div style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image src={item.imageUrl} alt={item.name} fill style={{ objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <span style={{ fontSize: 32, flexShrink: 0 }}>{item.emoji}</span>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>{item.name}</p>
                            {item.description && <p style={{ color: '#6B7280', fontSize: 12, marginTop: 2 }}>{item.description}</p>}
                            <p style={{ color: '#818CF8', fontSize: 13, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>
                              {item.price.toLocaleString('fr-FR')} {currency}
                            </p>
                          </div>
                          {qty === 0 ? (
                            <button onClick={() => add(item.id)}
                              style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', fontSize: 24, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
                              +
                            </button>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              <button onClick={() => sub(item.id)}
                                style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                              <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: '#F8F9FC', minWidth: 18, textAlign: 'center' }}>{qty}</span>
                              <button onClick={() => add(item.id)}
                                style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818CF8', fontSize: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
          </div>

          {/* Fixed cart bar */}
          {cartCount > 0 && (
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '14px 16px 28px', background: 'rgba(8,9,12,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(99,102,241,0.2)', zIndex: 100 }}>
              <div style={{ maxWidth: 440, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                    {cartCount} article{cartCount > 1 ? 's' : ''}
                  </span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: '#818CF8', fontWeight: 600 }}>
                    {cartTotal.toLocaleString('fr-FR')} {currency}
                  </span>
                </div>
                {whatsapp ? (
                  <button onClick={orderOnWhatsApp}
                    style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #059669, #10B981)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    💬 Envoyer la commande
                  </button>
                ) : (
                  <p style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', fontFamily: 'Space Mono, monospace' }}>
                    Configurez un WhatsApp dans le dashboard.
                  </p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </Shell>
  );
}

// ─── REVIEW ──────────────────────────────────────────────────────────────────
function ReviewModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const stars = Number(config.targetStars) || 5;

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>
          {'⭐'.repeat(stars)}
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 12 }}>
          {String(config.businessName || 'Notre commerce')}
        </h1>
        <p style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 1.6, marginBottom: 36, maxWidth: 320, margin: '0 auto 36px' }}>
          {String(config.message || 'Votre avis compte beaucoup pour nous !')}
        </p>
        {config.googleUrl ? (
          <a href={String(config.googleUrl)} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', borderRadius: 10, textDecoration: 'none', color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 17 }}>
            ⭐ Laisser un avis Google
          </a>
        ) : (
          <p style={{ color: '#6B7280', fontSize: 14 }}>Lien Google Reviews non configuré.</p>
        )}
      </div>
    </Shell>
  );
}

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────
function PortfolioModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const links = [
    { key: 'instagramUrl',   icon: '📸', label: 'Instagram',  color: '#E1306C', bg: 'rgba(225,48,108,0.1)',  border: 'rgba(225,48,108,0.25)' },
    { key: 'spotifyUrl',     icon: '🎵', label: 'Spotify',    color: '#1DB954', bg: 'rgba(29,185,84,0.1)',   border: 'rgba(29,185,84,0.25)'  },
    { key: 'youtubeUrl',     icon: '▶️', label: 'YouTube',    color: '#FF0000', bg: 'rgba(255,0,0,0.1)',     border: 'rgba(255,0,0,0.25)'    },
    { key: 'soundcloudUrl',  icon: '☁️', label: 'SoundCloud', color: '#FF5500', bg: 'rgba(255,85,0,0.1)',    border: 'rgba(255,85,0,0.25)'   },
    { key: 'websiteUrl',     icon: '🌐', label: 'Site web',   color: '#818CF8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
  ].filter(l => config[l.key]);

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>
          {String(config.discipline || 'Portfolio')}
        </p>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 12 }}>
          {String(config.artistName || 'Mon Portfolio')}
        </h1>
        {!!config.bio && (
          <p style={{ color: '#9CA3AF', fontSize: 15, lineHeight: 1.7, maxWidth: 340, margin: '0 auto' }}>
            {String(config.bio)}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {links.map(l => (
          <a key={l.key} href={String(config[l.key])} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: l.bg, border: `1px solid ${l.border}`, borderRadius: 10, textDecoration: 'none', color: l.color, fontFamily: 'DM Sans, sans-serif', fontSize: 15, fontWeight: 500 }}>
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            {l.label}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 'auto' }}><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </a>
        ))}
      </div>

      {!!config.bookingEmail && (
        <a href={`mailto:${String(config.bookingEmail)}?subject=Booking`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '14px 24px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, textDecoration: 'none', color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
          📩 Contact booking
        </a>
      )}
    </Shell>
  );
}

// ─── EVENT ───────────────────────────────────────────────────────────────────
type EventTicket = { id: string; name: string; description?: string; price: number; capacity: number };
type EventAgendaItem = { id: string; time: string; title: string; speaker?: string };

function EventModule({ config, username, profileId }: { config: Record<string, unknown>; username: string; profileId: string }) {
  type Phase = 'info' | 'register' | 'confirmed';

  // Lire les params URL côté client (retour FedaPay)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initPhase: Phase = urlParams?.get('confirmed') === '1' ? 'confirmed' : 'info';
  const initConfirmed = urlParams?.get('confirmed') === '1'
    ? { name: urlParams.get('name') || '', ticketName: urlParams.get('ticket') || '' }
    : null;

  const [phase,          setPhase]         = useState<Phase>(initPhase);
  const [selectedTicket, setSelectedTicket] = useState<EventTicket | null>(null);
  const [regCounts,      setRegCounts]     = useState<Record<string, number>>({});
  const [countdown,      setCountdown]     = useState({ d: 0, h: 0, m: 0, s: 0, past: false, ready: false });
  const [form,           setForm]          = useState({ name: '', phone: '', email: '' });
  const [submitting,     setSubmitting]    = useState(false);
  const [submitError,    setSubmitError]   = useState('');
  const [confirmed,      setConfirmed]     = useState<{ name: string; ticketName: string } | null>(initConfirmed);
  const [paymentCancelled, setPaymentCancelled] = useState(urlParams?.get('payment') === 'cancelled');

  const tickets:  EventTicket[]    = (config.tickets  as EventTicket[]    | undefined) ?? [];
  const agenda:   EventAgendaItem[] = (config.agenda   as EventAgendaItem[] | undefined) ?? [];
  const posters:  string[]          = (config.posters  as string[]          | undefined) ?? [];
  const currency: string            = String(config.currency || 'FCFA');
  const registrationEnabled         = config.registrationEnabled !== false;

  useEffect(() => {
    fetch(`/api/event?profileId=${encodeURIComponent(profileId)}`)
      .then(r => r.json())
      .then(d => setRegCounts(d.counts || {}))
      .catch(() => {});
  }, [profileId]);

  useEffect(() => {
    if (!config.date) return;
    const eventDate = new Date(`${String(config.date)}T${String(config.time || '00:00')}`);
    function tick() {
      const diff = eventDate.getTime() - Date.now();
      if (diff <= 0) { setCountdown({ d: 0, h: 0, m: 0, s: 0, past: true, ready: true }); return; }
      setCountdown({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        past: false, ready: true,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [config.date, config.time]);

  async function register() {
    if (!form.name || !form.phone || !selectedTicket) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      if (selectedTicket.price > 0) {
        // Billet payant → FedaPay
        const res = await fetch('/api/event/pay', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ profileId, username, name: form.name, phone: form.phone, email: form.email, ticketTypeId: selectedTicket.id, ticketTypeName: selectedTicket.name, ticketPrice: selectedTicket.price, currency }),
        });
        const data = await res.json();
        if (!res.ok) { setSubmitError(data.error || 'Erreur lors du paiement'); return; }
        window.location.href = data.payment_url; // redirige vers FedaPay
      } else {
        // Billet gratuit → inscription directe
        const res = await fetch('/api/event/register', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ profileId, name: form.name, phone: form.phone, email: form.email, ticketTypeId: selectedTicket.id, ticketTypeName: selectedTicket.name, ticketPrice: 0 }),
        });
        const data = await res.json();
        if (!res.ok) { setSubmitError(data.error || "Erreur lors de l'inscription"); return; }
        setConfirmed({ name: form.name, ticketName: selectedTicket.name });
        setPhase('confirmed');
      }
    } catch {
      setSubmitError('Erreur réseau, veuillez réessayer');
    } finally {
      setSubmitting(false);
    }
  }

  const infoCardStyle: React.CSSProperties = { display: 'flex', gap: 14, padding: '14px 18px', background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 };
  const dateStr = config.date
    ? new Date(String(config.date)).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  // ── Phase: info ──
  if (phase === 'info') {
    return (
      <Shell backHref={`/${username}`}>
        {/* Affiches */}
        {posters.length > 0 && (
          <div style={{ marginBottom: 28, marginLeft: -16, marginRight: -16 }}>
            {posters.length === 1 ? (
              // Une seule affiche : pleine largeur
              // eslint-disable-next-line @next/next/no-img-element
              <Image src={posters[0]} alt="Affiche" width={600} height={320} style={{ width: '100%', height: 'auto', maxHeight: 320, objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              // Plusieurs : scroll horizontal
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingLeft: 16, paddingRight: 16, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                {posters.map((url, i) => (
                  <Image key={i} src={url} alt={`Affiche ${i + 1}`} width={220} height={300}
                    style={{ objectFit: 'cover', borderRadius: 10, flexShrink: 0, scrollSnapAlign: 'start' }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          {posters.length === 0 && <div style={{ fontSize: 56, marginBottom: 12 }}>{String(config.emoji || '🎟️')}</div>}
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', marginBottom: 8, margin: '0 0 8px' }}>
            {String(config.eventName || 'Événement')}
          </h1>
          {!!config.organizer && (
            <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>
              par <strong style={{ color: '#F8F9FC' }}>{String(config.organizer)}</strong>
            </p>
          )}
        </div>

        {/* Countdown */}
        {!!config.date && countdown.ready && !countdown.past && (
          <div style={{ background: '#181B26', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 12 }}>Compte à rebours</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              {[{ v: countdown.d, l: 'jours' }, { v: countdown.h, l: 'heures' }, { v: countdown.m, l: 'min' }, { v: countdown.s, l: 'sec' }].map(({ v, l }) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 26, color: '#F8F9FC', minWidth: 44, background: 'rgba(99,102,241,0.1)', borderRadius: 8, padding: '6px 10px' }}>
                    {String(v).padStart(2, '0')}
                  </div>
                  <div style={{ color: '#6B7280', fontSize: 9, fontFamily: 'Space Mono, monospace', marginTop: 4, textTransform: 'uppercase' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {countdown.past && (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: 12, textAlign: 'center', marginBottom: 24 }}>
            <p style={{ color: '#EF4444', fontSize: 13, fontFamily: 'Space Mono, monospace', margin: 0 }}>Événement terminé</p>
          </div>
        )}

        {/* Date + Venue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {dateStr && (
            <div style={infoCardStyle}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                <p style={{ color: '#F8F9FC', fontSize: 13, fontWeight: 600, fontFamily: 'Syne, sans-serif', textTransform: 'capitalize', margin: 0 }}>{dateStr}</p>
                {!!config.time && <p style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: '2px 0 0' }}>{String(config.time)}</p>}
              </div>
            </div>
          )}
          {!!config.venue && (
            <div style={infoCardStyle}>
              <span style={{ fontSize: 18 }}>📍</span>
              <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{String(config.venue)}</p>
            </div>
          )}
        </div>

        {/* Description */}
        {!!config.description && (
          <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>{String(config.description)}</p>
        )}

        {/* Tickets */}
        {tickets.length > 0 && registrationEnabled && !countdown.past && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>Billets disponibles</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tickets.map(ticket => {
                const sold      = regCounts[ticket.id] || 0;
                const remaining = ticket.capacity - sold;
                const isFull    = remaining <= 0;
                return (
                  <div key={ticket.id} style={{ background: '#181B26', border: `1px solid ${isFull ? 'rgba(239,68,68,0.25)' : 'rgba(99,102,241,0.25)'}`, borderRadius: 10, padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <p style={{ color: '#F8F9FC', fontWeight: 600, fontSize: 15, fontFamily: 'Syne, sans-serif', margin: '0 0 2px' }}>{ticket.name}</p>
                        {ticket.description && <p style={{ color: '#9CA3AF', fontSize: 12, margin: 0 }}>{ticket.description}</p>}
                      </div>
                      <p style={{ color: ticket.price === 0 ? '#10B981' : '#F8F9FC', fontWeight: 700, fontSize: 15, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap', marginLeft: 12, margin: '0 0 0 12px' }}>
                        {ticket.price === 0 ? 'Gratuit' : `${ticket.price.toLocaleString('fr-FR')} ${currency}`}
                      </p>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: isFull ? '#EF4444' : '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', margin: 0 }}>
                        {isFull ? '● Complet' : `${remaining} place${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''}`}
                      </p>
                      <button onClick={() => { setSelectedTicket(ticket); setPhase('register'); }} disabled={isFull}
                        style={{ background: isFull ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #6366F1, #818CF8)', border: 'none', borderRadius: 6, padding: '8px 18px', color: isFull ? '#6B7280' : '#fff', fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: isFull ? 'not-allowed' : 'pointer' }}>
                        {isFull ? 'Complet' : "S'inscrire →"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Paiement annulé */}
        {paymentCancelled && (
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#F59E0B', fontSize: 13, margin: 0 }}>Paiement annulé — vous pouvez réessayer</p>
            <button onClick={() => setPaymentCancelled(false)} style={{ background: 'none', border: 'none', color: '#F59E0B', fontSize: 18, cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
          </div>
        )}

        {/* Registration closed */}
        {tickets.length > 0 && (!registrationEnabled || countdown.past) && (
          <div style={{ background: 'rgba(107,114,128,0.08)', border: '1px solid rgba(107,114,128,0.2)', borderRadius: 8, padding: 16, marginBottom: 24, textAlign: 'center' }}>
            <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
              {countdown.past ? 'Événement terminé' : 'Inscriptions fermées'}
            </p>
          </div>
        )}

        {/* Agenda */}
        {agenda.length > 0 && (
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>Programme</p>
            {[...agenda].sort((a, b) => a.time.localeCompare(b.time)).map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 16, padding: '13px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#6366F1', minWidth: 44, paddingTop: 2 }}>{item.time}</span>
                <div>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontWeight: 500, margin: 0 }}>{item.title}</p>
                  {item.speaker && <p style={{ color: '#9CA3AF', fontSize: 12, margin: '3px 0 0' }}>🎤 {item.speaker}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Shell>
    );
  }

  // ── Phase: register ──
  if (phase === 'register' && selectedTicket) {
    return (
      <Shell backHref={`/${username}`}>
        <button onClick={() => setPhase('info')}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          ← Retour
        </button>

        <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(129,140,248,0.04))', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 10, padding: 16, marginBottom: 28 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 6 }}>Billet sélectionné</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#F8F9FC', fontWeight: 600, fontFamily: 'Syne, sans-serif', margin: 0 }}>{selectedTicket.name}</p>
            <p style={{ color: '#F8F9FC', fontWeight: 700, fontFamily: 'Space Mono, monospace', margin: 0 }}>
              {selectedTicket.price === 0 ? 'Gratuit' : `${selectedTicket.price.toLocaleString('fr-FR')} ${currency}`}
            </p>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC', marginBottom: 20 }}>Vos informations</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Nom complet *</p>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Koffi Mensah"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '11px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Téléphone *</p>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+229 97 00 00 00" type="tel"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '11px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Email (optionnel)</p>
            <input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="koffi@email.com" type="email"
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '11px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        {submitError && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '12px 16px', marginTop: 16 }}>
            <p style={{ color: '#EF4444', fontSize: 13, margin: 0 }}>{submitError}</p>
          </div>
        )}

        <button onClick={register} disabled={submitting || !form.name || !form.phone}
          style={{ width: '100%', marginTop: 24, padding: '14px 0', background: submitting || !form.name || !form.phone ? 'rgba(255,255,255,0.06)' : selectedTicket.price > 0 ? 'linear-gradient(135deg, #059669, #10B981)' : 'linear-gradient(135deg, #6366F1, #818CF8)', border: 'none', borderRadius: 8, color: submitting || !form.name || !form.phone ? '#6B7280' : '#fff', fontSize: 15, fontFamily: 'Space Mono, monospace', cursor: submitting || !form.name || !form.phone ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
          {submitting
            ? (selectedTicket.price > 0 ? 'Redirection vers le paiement...' : 'Inscription en cours...')
            : selectedTicket.price > 0
              ? `💳 Payer ${selectedTicket.price.toLocaleString('fr-FR')} ${currency} →`
              : "Confirmer l'inscription →"
          }
        </button>
      </Shell>
    );
  }

  // ── Phase: confirmed ──
  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>
          ✅
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', marginBottom: 8 }}>Inscription confirmée !</h2>
        <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 28 }}>Votre place est réservée</p>

        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20, textAlign: 'left', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Nom',        value: confirmed?.name },
              { label: 'Événement',  value: String(config.eventName || '') },
              { label: 'Billet',     value: confirmed?.ticketName },
              { label: 'Lieu',       value: String(config.venue || '') },
              { label: 'Date',       value: dateStr ?? '' },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', whiteSpace: 'nowrap' }}>{row.label}</span>
                <span style={{ color: '#F8F9FC', fontSize: 13, fontWeight: 500, textAlign: 'right', textTransform: row.label === 'Date' ? 'capitalize' : 'none' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace', marginBottom: 24, letterSpacing: 1 }}>
          Présentez cet écran à l&apos;entrée
        </p>

        <button onClick={() => setPhase('info')}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 24px', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          ← Retour à l&apos;événement
        </button>
      </div>
    </Shell>
  );
}

// ─── CERTIFICATE ─────────────────────────────────────────────────────────────
function CertificateModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  return (
    <Shell backHref={`/${username}`}>
      <div style={{ background: 'linear-gradient(135deg, #0D0E14, #181B26)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 12, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✅</div>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#10B981', textTransform: 'uppercase' }}>Produit authentique</p>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>Certificat We Connect</p>
          </div>
        </div>

        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#F8F9FC', marginBottom: 4 }}>
          {String(config.productName || 'Produit')}
        </h1>
        {!!config.brand && <p style={{ color: '#818CF8', fontSize: 14, marginBottom: 20 }}>par {String(config.brand)}</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Numéro de série', value: config.serialNumber },
            { label: 'Origine',         value: config.origin        },
            { label: 'Fabrication',     value: config.purchaseDate  },
            { label: 'Garantie',        value: config.warranty      },
          ].filter(r => r.value).map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ color: '#6B7280', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{row.label}</span>
              <span style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{String(row.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {!!config.description && (
        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7 }}>{String(config.description)}</p>
      )}
    </Shell>
  );
}

// ─── MEMBER ──────────────────────────────────────────────────────────────────
const LEVEL_STYLES: Record<string, { color: string; bg: string; border: string; label: string }> = {
  silver:   { color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.3)', label: '🥈 Silver'   },
  gold:     { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)',  label: '🥇 Gold'     },
  platinum: { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.3)',   label: '💎 Platinum' },
  vip:      { color: '#6366F1', bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.3)',  label: '👑 VIP'      },
};

interface MemberCardData {
  id:          string;
  memberName:  string;
  memberId:    string;
  level:       string;
  expiryDate?: string;
  photoUrl?:   string;
}

function MemberModule({ config, username, memberCard }: { config: Record<string, unknown>; username: string; memberCard?: MemberCardData | null }) {
  const levelKey  = memberCard?.level ?? String(config.level ?? 'silver');
  const level     = LEVEL_STYLES[levelKey] ?? LEVEL_STYLES.silver;
  const benefits  = String(config.benefits || '').split('\n').filter(Boolean);
  const clubName  = String(config.clubName || 'Club');
  const website   = String(config.website  || '');

  // Member info: from memberCard if available, else fall back to legacy config
  const memberName = memberCard?.memberName || String(config.memberName || '');
  const memberId   = memberCard?.memberId   || String(config.memberId   || '');
  const expiryDate = memberCard?.expiryDate || String(config.expiryDate || '');
  const photoUrl   = memberCard?.photoUrl   || '';

  // No card scanned and no legacy data
  if (!memberCard && !config.memberName) {
    return (
      <Shell backHref={`/${username}`}>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>🎫</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: '#F8F9FC', marginBottom: 8 }}>{clubName}</h2>
          <p style={{ color: '#6B7280', fontSize: 14 }}>Scannez votre carte membre NFC pour afficher vos informations.</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell backHref={`/${username}`}>
      <div style={{ background: `linear-gradient(135deg, ${level.bg.replace('0.12', '0.2')}, #12141C)`, border: `1px solid ${level.border}`, borderRadius: 16, padding: 28, marginBottom: 24 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: level.color, textTransform: 'uppercase', marginBottom: 6 }}>Carte Membre</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>{clubName}</h1>
          </div>
          <div style={{ background: level.bg, border: `1px solid ${level.border}`, borderRadius: 8, padding: '6px 14px', flexShrink: 0 }}>
            <p style={{ color: level.color, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, margin: 0 }}>{level.label}</p>
          </div>
        </div>

        {/* Member info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
          {photoUrl ? (
            <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', border: `2px solid ${level.border}`, flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={photoUrl} alt="" fill style={{ objectFit: 'cover' }} />
            </div>
          ) : null}
          <div>
            {memberName && (
              <>
                <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: 2, marginBottom: 3 }}>MEMBRE</p>
                <p style={{ color: '#F8F9FC', fontSize: 18, fontFamily: 'Syne, sans-serif', fontWeight: 700, margin: 0 }}>{memberName}</p>
              </>
            )}
            {memberId && (
              <p style={{ color: level.color, fontSize: 11, fontFamily: 'Space Mono, monospace', marginTop: 4 }}>#{memberId}</p>
            )}
          </div>
        </div>

        {expiryDate && (
          <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
            Valable jusqu&apos;au {new Date(expiryDate).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>

      {benefits.length > 0 && (
        <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Vos avantages</p>
          {benefits.map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
              <span style={{ color: level.color, flexShrink: 0 }}>✦</span>
              <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', margin: 0 }}>{b}</p>
            </div>
          ))}
        </div>
      )}

      {website && (
        <a href={website} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', textAlign: 'center', marginTop: 20, color: level.color, fontSize: 13, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}>
          🌐 {website.replace(/^https?:\/\//, '')}
        </a>
      )}
    </Shell>
  );
}

// ─── ACCESS ──────────────────────────────────────────────────────────────────
// ─── ACCESS HELPERS ──────────────────────────────────────────────────────────
type AZone = { id: string; name: string; emoji: string; accessType: 'libre' | 'pin' | 'whatsapp'; pinHash?: string; whatsapp?: string; schedule: { days: string[]; startTime: string; endTime: string; allDay: boolean }; afterAccessMessage?: string; emergencyContact?: string };
const DAY_MAP: Record<number, string> = { 1: 'lun', 2: 'mar', 3: 'mer', 4: 'jeu', 5: 'ven', 6: 'sam', 0: 'dim' };

function zoneIsOpen(z: AZone): boolean {
  if (z.schedule.allDay) return true;
  const now   = new Date();
  const today = DAY_MAP[now.getDay()];
  if (!z.schedule.days.includes(today)) return false;
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = z.schedule.startTime.split(':').map(Number);
  const [eh, em] = z.schedule.endTime.split(':').map(Number);
  return cur >= sh * 60 + sm && cur <= eh * 60 + em;
}

interface HolderCardProp {
  id:          string;
  holderTitle: string;
  holderName:  string;
  holderRole:  string;
  holderPhoto: string;
}

function AccessModule({ config, username, profileId, holderCard }: { config: Record<string, unknown>; username: string; profileId: string; holderCard?: HolderCardProp | null }) {
  type Phase = 'badge' | 'pin' | 'whatsapp' | 'granted';

  const [phase,       setPhase]       = useState<Phase>('badge');
  const [activeZone,  setActiveZone]  = useState<AZone | null>(null);
  const [pinInput,    setPinInput]    = useState('');
  const [pinError,    setPinError]    = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [blocked,     setBlocked]     = useState(false);
  const [blockedUntil, setBlockedUntil] = useState('');
  const [checking,    setChecking]    = useState(false);
  const [grantMsg,    setGrantMsg]    = useState('');

  const zones: AZone[] = (config.zones as AZone[] | undefined) ?? [];
  const holderPhoto = holderCard?.holderPhoto || '';
  const holderName  = holderCard?.holderName  || '';
  const holderRole  = holderCard?.holderRole  || '';
  const badgeTitle  = holderCard?.holderTitle  || "Badge d'accès";
  const device         = typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 80) : 'unknown';

  async function requestAccess(zone: AZone) {
    setActiveZone(zone);
    setPinError('');
    setPinInput('');
    setBlocked(false);

    if (!zoneIsOpen(zone)) return; // stay on badge page, shown as closed

    if (zone.accessType === 'libre') {
      setChecking(true);
      const res = await fetch('/api/access/check', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, zoneId: zone.id, device, cardId: holderCard?.id, holderName }),
      });
      const data = await res.json();
      setChecking(false);
      setGrantMsg(data.message || '');
      setPhase('granted');
    } else if (zone.accessType === 'pin') {
      setPhase('pin');
    } else {
      setPhase('whatsapp');
    }
  }

  async function submitPin() {
    if (!pinInput || !activeZone) return;
    setChecking(true);
    setPinError('');
    const res  = await fetch('/api/access/check', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, zoneId: activeZone.id, pin: pinInput, device, cardId: holderCard?.id, holderName }),
    });
    const data = await res.json();
    setChecking(false);
    setPinInput('');

    if (data.granted) {
      setGrantMsg(data.message || '');
      setPhase('granted');
    } else if (data.blocked) {
      setBlocked(true);
      setBlockedUntil(data.blockedUntil || '');
      setPinError(data.error || 'Accès bloqué');
    } else {
      const left = data.attemptsLeft ?? null;
      setAttemptsLeft(left);
      setPinError(left !== null && left <= 2
        ? `PIN incorrect — ${left} tentative${left > 1 ? 's' : ''} restante${left > 1 ? 's' : ''}`
        : 'PIN incorrect');
    }
  }

  function addKey(k: string) {
    if (pinInput.length >= 8) return;
    setPinInput(p => p + k);
    setPinError('');
  }

  // ── Badge phase ──
  if (phase === 'badge') {
    return (
      <Shell backHref={`/${username}`}>
        {/* Badge card */}
        <div style={{ background: 'linear-gradient(135deg, #0D0E14, #1a1d2e)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 14, padding: 24, marginBottom: 28 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>{badgeTitle}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {holderPhoto
                // eslint-disable-next-line @next/next/no-img-element
                ? <Image src={holderPhoto} alt="" fill style={{ objectFit: 'cover' }} />
                : <span style={{ fontSize: 26 }}>👤</span>
              }
            </div>
            <div>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', margin: '0 0 3px' }}>{holderName || 'Porteur'}</p>
              {holderRole && <p style={{ color: '#818CF8', fontSize: 13, margin: 0 }}>{holderRole}</p>}
            </div>
          </div>
        </div>

        {/* Zones */}
        {zones.length === 0 ? (
          <p style={{ color: '#6B7280', textAlign: 'center', fontSize: 14 }}>Aucune zone configurée</p>
        ) : (
          <>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 14 }}>Zones d&apos;accès</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {zones.map(zone => {
                const open = zoneIsOpen(zone);
                return (
                  <div key={zone.id} style={{ background: '#181B26', border: `1px solid ${open ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{zone.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#F8F9FC', fontWeight: 600, fontSize: 14, fontFamily: 'Syne, sans-serif', margin: '0 0 3px' }}>{zone.name}</p>
                      <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', margin: 0 }}>
                        {zone.schedule.allDay ? 'Toute la journée' : `${zone.schedule.startTime} – ${zone.schedule.endTime}`}
                      </p>
                    </div>
                    {open ? (
                      <button onClick={() => requestAccess(zone)} disabled={checking}
                        style={{ background: 'linear-gradient(135deg, #6366F1, #818CF8)', border: 'none', borderRadius: 7, padding: '9px 16px', color: '#fff', fontSize: 13, fontFamily: 'Space Mono, monospace', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                        {zone.accessType === 'pin' ? '🔑 PIN' : zone.accessType === 'whatsapp' ? '💬' : '→ Entrer'}
                      </button>
                    ) : (
                      <span style={{ fontSize: 12, color: '#EF4444', fontFamily: 'Space Mono, monospace', background: 'rgba(239,68,68,0.1)', borderRadius: 5, padding: '5px 10px', whiteSpace: 'nowrap' }}>🔒 Fermé</span>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Shell>
    );
  }

  // ── PIN phase ──
  if (phase === 'pin' && activeZone) {
    const blockedTime = blockedUntil ? new Date(blockedUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
    return (
      <Shell backHref={`/${username}`}>
        <button onClick={() => { setPhase('badge'); setPinInput(''); setPinError(''); setBlocked(false); }}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          ← Retour
        </button>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 40 }}>{activeZone.emoji}</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F8F9FC', margin: '10px 0 4px' }}>{activeZone.name}</h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0, fontFamily: 'Space Mono, monospace' }}>Entrez votre code PIN</p>
        </div>

        {/* PIN display */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
          {Array.from({ length: Math.max(4, pinInput.length) }).map((_, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < pinInput.length ? '#6366F1' : 'rgba(255,255,255,0.12)', transition: 'background 0.1s' }} />
          ))}
        </div>

        {/* Keypad */}
        {blocked ? (
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🔒</span>
            <p style={{ color: '#EF4444', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, margin: '0 0 8px' }}>Accès temporairement bloqué</p>
            <p style={{ color: '#9CA3AF', fontSize: 13, margin: 0 }}>Réessayez à {blockedTime}</p>
            {activeZone.emergencyContact && (
              <p style={{ color: '#6B7280', fontSize: 12, marginTop: 16, fontFamily: 'Space Mono, monospace' }}>📞 {activeZone.emergencyContact}</p>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 280, margin: '0 auto 20px' }}>
              {['1','2','3','4','5','6','7','8','9','⌫','0','✓'].map(k => (
                <button key={k} onClick={() => k === '⌫' ? setPinInput(p => p.slice(0, -1)) : k === '✓' ? submitPin() : addKey(k)}
                  disabled={checking || (k === '✓' && !pinInput)}
                  style={{ height: 62, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: k === '✓' ? (pinInput ? 'linear-gradient(135deg, #6366F1, #818CF8)' : 'rgba(255,255,255,0.04)') : k === '⌫' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)', color: k === '✓' && pinInput ? '#fff' : '#F8F9FC', fontSize: k === '⌫' || k === '✓' ? 20 : 22, fontFamily: 'Syne, sans-serif', fontWeight: 600, cursor: (k === '✓' && !pinInput) ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                  onMouseOver={ev => { if (k !== '✓') ev.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                  onMouseOut={ev => { ev.currentTarget.style.background = k === '✓' ? (pinInput ? 'linear-gradient(135deg, #6366F1, #818CF8)' : 'rgba(255,255,255,0.04)') : 'rgba(255,255,255,0.04)'; }}>
                  {checking && k === '✓' ? '⏳' : k}
                </button>
              ))}
            </div>
            {pinError && (
              <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', fontFamily: 'DM Sans, sans-serif', marginTop: 8 }}>{pinError}</p>
            )}
            {activeZone.emergencyContact && (
              <p style={{ color: '#6B7280', fontSize: 11, textAlign: 'center', fontFamily: 'Space Mono, monospace', marginTop: 16 }}>📞 {activeZone.emergencyContact}</p>
            )}
          </>
        )}
      </Shell>
    );
  }

  // ── WhatsApp phase ──
  if (phase === 'whatsapp' && activeZone) {
    const wa = activeZone.whatsapp?.replace(/\D/g, '') || '';
    const msg = encodeURIComponent(`Bonjour, je souhaite accéder à la zone "${activeZone.name}". Merci de m'ouvrir.`);
    return (
      <Shell backHref={`/${username}`}>
        <button onClick={() => setPhase('badge')}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, padding: 0, fontFamily: 'DM Sans, sans-serif' }}>
          ← Retour
        </button>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: 40 }}>{activeZone.emoji}</span>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F8F9FC', margin: '10px 0 6px' }}>{activeZone.name}</h2>
          <p style={{ color: '#9CA3AF', fontSize: 14, margin: 0 }}>Contactez le responsable pour ouvrir</p>
        </div>
        <a href={`https://wa.me/${wa}?text=${msg}`} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', padding: '16px 0', background: 'linear-gradient(135deg, #059669, #10B981)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, textDecoration: 'none', marginBottom: 16 }}>
          💬 Contacter le responsable
        </a>
        {activeZone.emergencyContact && (
          <p style={{ color: '#6B7280', fontSize: 12, textAlign: 'center', fontFamily: 'Space Mono, monospace' }}>📞 {activeZone.emergencyContact}</p>
        )}
      </Shell>
    );
  }

  // ── Granted phase ──
  return (
    <Shell backHref={`/${username}`}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 20px' }}>
          🔓
        </div>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: '#10B981', marginBottom: 6 }}>Accès accordé</h2>
        <p style={{ color: '#9CA3AF', fontSize: 15, marginBottom: 28 }}>{activeZone?.name}</p>

        {grantMsg && (
          <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 18, marginBottom: 24, textAlign: 'left' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Instructions</p>
            <p style={{ color: '#F8F9FC', fontSize: 14, margin: 0 }}>{grantMsg}</p>
          </div>
        )}

        <p style={{ color: '#6B7280', fontSize: 11, fontFamily: 'Space Mono, monospace', marginBottom: 28 }}>
          {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · {activeZone?.name}
        </p>

        <button onClick={() => { setPhase('badge'); setActiveZone(null); setGrantMsg(''); }}
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '12px 24px', color: '#9CA3AF', fontSize: 13, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
          ← Retour au badge
        </button>
      </div>
    </Shell>
  );
}

// ─── MEDICAL ─────────────────────────────────────────────────────────────────
function MedicalModule({ config, username }: { config: Record<string, unknown>; username: string }) {
  const [pin, setPin]           = useState('');
  const [showPin, setShowPin]   = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [denied, setDenied]     = useState(false);
  const storedPin = String(config.pin || '');
  const hasPin    = storedPin.length > 0;

  function checkPin() {
    if (pin === storedPin) { setUnlocked(true); setDenied(false); }
    else                   { setDenied(true); setPin(''); }
  }

  const birthDate = config.birthDate
    ? new Date(String(config.birthDate)).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  const showExtra = !hasPin || unlocked;

  return (
    <Shell backHref={`/${username}`}>
      {/* Header urgence */}
      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 18px', marginBottom: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 18 }}>🚨</span>
        <p style={{ color: '#EF4444', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Informations médicales d&apos;urgence</p>
      </div>

      {/* ─── SECTION CRITIQUE : toujours visible ─── */}
      <div style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 20, marginBottom: 16 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 14 }}>Infos critiques · Toujours visibles</p>

        {!!config.fullName && (
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', marginBottom: 4 }}>{String(config.fullName)}</h1>
        )}
        {!!birthDate && <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 12 }}>Né(e) le {birthDate}</p>}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {!!config.bloodType && (
            <span style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '6px 12px', color: '#EF4444', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16 }}>
              🩸 {String(config.bloodType)}
            </span>
          )}
          {!!config.weight && (
            <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', color: '#9CA3AF', fontSize: 13 }}>
              ⚖️ {String(config.weight)} kg
            </span>
          )}
          {!!config.height && (
            <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '6px 12px', color: '#9CA3AF', fontSize: 13 }}>
              📏 {String(config.height)} cm
            </span>
          )}
          {config.organDonor === 'Oui' && (
            <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '6px 12px', color: '#10B981', fontSize: 12 }}>
              Don d&apos;organes ✓
            </span>
          )}
          {String(config.dnr || '').includes('Oui') && (
            <span style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '6px 12px', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
              ⛔ DNR
            </span>
          )}
        </div>

        {!!config.allergies && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '12px 14px', marginBottom: 12 }}>
            <p style={{ color: '#F59E0B', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: 2, marginBottom: 4 }}>⚠️ ALLERGIES</p>
            <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{String(config.allergies)}</p>
          </div>
        )}

        {!!(config.emergencyName || config.emergencyPhone) && (
          <div style={{ borderTop: '1px solid rgba(239,68,68,0.15)', paddingTop: 14 }}>
            <p style={{ color: '#EF4444', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: 2, marginBottom: 8 }}>📞 CONTACT D&apos;URGENCE</p>
            {!!config.emergencyName && (
              <p style={{ color: '#F8F9FC', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                {String(config.emergencyName)}{!!config.emergencyRel && <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 13 }}> — {String(config.emergencyRel)}</span>}
              </p>
            )}
            {!!config.emergencyPhone && (
              <a href={`tel:${String(config.emergencyPhone)}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '10px 18px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, textDecoration: 'none', color: '#FCA5A5', fontSize: 15, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                📞 {String(config.emergencyPhone)}
              </a>
            )}
          </div>
        )}
      </div>

      {/* ─── SECTION COMPLÉMENTAIRE ─── */}
      <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 20 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#818CF8', textTransform: 'uppercase', marginBottom: 14 }}>
          🔒 Infos complémentaires {hasPin && !unlocked ? '· Code requis' : ''}
        </p>

        {!showExtra ? (
          /* PIN form */
          <div>
            <p style={{ color: '#9CA3AF', fontSize: 13, marginBottom: 16 }}>Ces informations sont protégées. Entrez le code pour y accéder.</p>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={8}
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••"
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: `1px solid ${denied ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'}`, borderRadius: 8, padding: '14px 48px 14px 20px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 22, textAlign: 'center', outline: 'none', letterSpacing: 8, boxSizing: 'border-box' }}
                onKeyDown={e => { if (e.key === 'Enter') checkPin(); }}
              />
              <button
                type="button"
                onClick={() => setShowPin(v => !v)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4 }}
              >
                {showPin ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
            {denied && <p style={{ color: '#EF4444', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>Code incorrect. Réessayez.</p>}
            <button onClick={checkPin} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4338CA, #6366F1)', border: 'none', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Déverrouiller
            </button>
          </div>
        ) : (
          /* Infos déverrouillées */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Conditions chroniques', value: config.conditions,     icon: '🏥' },
              { label: 'Médicaments',           value: config.medications,    icon: '💊' },
              { label: 'Vaccinations',           value: config.vaccinations,   icon: '💉' },
              { label: 'Médecin traitant',       value: config.doctorName,     icon: '👨‍⚕️' },
              { label: 'Tél. médecin',           value: config.doctorPhone,    icon: '📞' },
              { label: 'Hôpital de référence',  value: config.hospital,       icon: '🏨' },
              { label: 'N° assuré',              value: config.insuranceNumber,icon: '📋' },
              { label: 'Notes',                  value: config.notes,          icon: '📝' },
            ].filter(r => r.value).map(row => (
              <div key={row.label} style={{ display: 'flex', gap: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{row.icon}</span>
                <div>
                  <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', marginBottom: 2 }}>{row.label}</p>
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{String(row.value)}</p>
                </div>
              </div>
            ))}

            {!!(config.emergency2Name || config.emergency2Phone) && (
              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ color: '#818CF8', fontSize: 10, fontFamily: 'Space Mono, monospace', letterSpacing: 2, marginBottom: 8 }}>2ÈME CONTACT</p>
                {!!config.emergency2Name && (
                  <p style={{ color: '#F8F9FC', fontSize: 14, fontWeight: 600 }}>
                    {String(config.emergency2Name)}{!!config.emergency2Rel && <span style={{ color: '#9CA3AF', fontWeight: 400 }}> — {String(config.emergency2Rel)}</span>}
                  </p>
                )}
                {!!config.emergency2Phone && (
                  <a href={`tel:${String(config.emergency2Phone)}`}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '8px 14px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, textDecoration: 'none', color: '#818CF8', fontSize: 14, fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
                    📞 {String(config.emergency2Phone)}
                  </a>
                )}
              </div>
            )}

            {hasPin && (
              <button onClick={() => { setUnlocked(false); setPin(''); }}
                style={{ marginTop: 4, background: 'none', border: 'none', color: '#6B7280', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                🔒 Reverrouiller
              </button>
            )}
          </div>
        )}
      </div>
    </Shell>
  );
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────
interface HolderCard {
  id:          string;
  holderTitle: string;
  holderName:  string;
  holderRole:  string;
  holderPhoto: string;
}

interface MemberCardProp {
  id:          string;
  memberName:  string;
  memberId:    string;
  level:       string;
  expiryDate?: string;
  photoUrl?:   string;
}

export default function ModulePublicClient({
  type, username, profileId = '', config, holderCard = null, memberCard = null,
}: {
  type:        string;
  username:    string;
  profileId?:  string;
  config:      Record<string, unknown>;
  holderCard?: HolderCard | null;
  memberCard?: MemberCardProp | null;
}) {
  switch (type) {
    case 'loyalty':     return <LoyaltyModule     config={config} username={username} profileId={profileId} />;
    case 'menu':        return <MenuModule         config={config} username={username} />;
    case 'review':      return <ReviewModule       config={config} username={username} />;
    case 'portfolio':   return <PortfolioModule    config={config} username={username} />;
    case 'event':       return <EventModule        config={config} username={username} profileId={profileId} />;
    case 'certificate': return <CertificateModule  config={config} username={username} />;
    case 'member':      return <MemberModule       config={config} username={username} memberCard={memberCard} />;
    case 'access':      return <AccessModule       config={config} username={username} profileId={profileId} holderCard={holderCard} />;
    case 'medical':     return <MedicalModule      config={config} username={username} />;
    default:            return null;
  }
}
