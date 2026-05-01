'use client';

import { useState } from 'react';

type DeliveryInfo = {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  country:  'BJ' | 'TG' | 'BF';
  notes?:   string;
};

const COUNTRY_LABELS: Record<string, string> = {
  BJ: '🇧🇯 Bénin',
  TG: '🇹🇬 Togo',
  BF: '🇧🇫 Burkina Faso',
};

type CardCustomization = {
  displayName?: string;
  title?:       string;
  company?:     string;
  logoUrl?:     string;
  brandColor?:  string;
};

export type AdminCard = {
  id: string;
  userId: string;
  edition: string;
  cardType?:      'standard' | 'pro' | 'prestige' | null;
  metallic?:      boolean | null;
  pvcColor?:      'white' | 'black' | null;
  customization?: CardCustomization | null;
  nfcId?: string | null;
  status: string;
  orderedAt: string;
  activatedAt?: string | null;
  delivery?: DeliveryInfo | null;
  user: { displayName: string; email: string; plan: string; username?: string } | null;
};

const EDITIONS = ['midnight', 'electric', 'glass', 'metal'];
const EDITION_COLORS: Record<string, { bg: string; accent: string }> = {
  midnight: { bg: 'linear-gradient(135deg, #0D0E14, #181B26)', accent: '#6366F1' },
  electric: { bg: 'linear-gradient(135deg, #1e1b4b, #4338CA)',  accent: '#818CF8' },
  glass:    { bg: 'linear-gradient(135deg, #0c1a2e, #0e2340)',  accent: '#06B6D4' },
  metal:    { bg: 'linear-gradient(135deg, #1a1a1a, #2d2d2d)',  accent: '#9CA3AF' },
};

const STATUS_COLORS: Record<string, string> = {
  pending:  '#EF4444',
  shipped:  '#F59E0B',
  active:   '#10B981',
  inactive: '#6B7280',
};

const STATUS_LABELS: Record<string, string> = {
  pending:  'À traiter',
  shipped:  'Expédiée',
  active:   'Activée',
  inactive: 'Inactive',
};

const TABS = ['pending', 'shipped', 'active', 'all'] as const;
const TAB_LABELS: Record<string, string> = {
  pending: 'À traiter',
  shipped: 'Expédiées',
  active:  'Activées',
  all:     'Toutes',
};

function generateNfcId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = 'WC-';
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

export default function CardsAdminClient({ initialCards }: { initialCards: AdminCard[] }) {
  const [cards, setCards]       = useState<AdminCard[]>(initialCards);
  const [tab, setTab]           = useState<typeof TABS[number]>('pending');
  const [search, setSearch]     = useState('');
  const [configCard, setConfigCard] = useState<AdminCard | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [nfcInput, setNfcInput] = useState('');
  const [editionInput, setEditionInput] = useState('midnight');
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState('');

  // Create card modal
  const [showCreate, setShowCreate] = useState(false);
  const [createUserId, setCreateUserId] = useState('');
  const [createNfcId, setCreateNfcId]   = useState('');
  const [createEdition, setCreateEdition] = useState('midnight');
  const [creating, setCreating] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const filtered = cards.filter(c => {
    const matchTab = tab === 'all' ? true : c.status === tab;
    const q = search.toLowerCase();
    const matchSearch = !q || (
      c.user?.displayName?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      (c.nfcId?.toLowerCase().includes(q) ?? false)
    );
    return matchTab && matchSearch;
  });

  const counts = {
    pending: cards.filter(c => c.status === 'pending').length,
    shipped: cards.filter(c => c.status === 'shipped').length,
    active:  cards.filter(c => c.status === 'active').length,
    all:     cards.length,
  };

  function openConfigure(card: AdminCard) {
    setIsEditMode(false);
    setConfigCard(card);
    setNfcInput(card.nfcId ?? generateNfcId());
    setEditionInput(card.edition ?? 'midnight');
    setSaveErr('');
  }

  function openEdit(card: AdminCard) {
    setIsEditMode(true);
    setConfigCard(card);
    setNfcInput(card.nfcId ?? '');
    setEditionInput(card.edition ?? 'midnight');
    setSaveErr('');
  }

  async function handleConfigure() {
    if (!configCard) return;
    if (!nfcInput.trim()) { setSaveErr('Entre un code NFC.'); return; }
    setSaving(true);
    setSaveErr('');
    const body = isEditMode
      ? { cardId: configCard.id, nfcId: nfcInput.trim().toUpperCase(), edition: editionInput }
      : { cardId: configCard.id, nfcId: nfcInput.trim().toUpperCase(), edition: editionInput, status: 'shipped' };
    const res = await fetch('/api/admin/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setSaveErr(data.error ?? 'Erreur.'); setSaving(false); return; }
    setCards(prev => prev.map(c => c.id === configCard.id
      ? { ...c, nfcId: nfcInput.trim().toUpperCase(), edition: editionInput, ...(isEditMode ? {} : { status: 'shipped' }) }
      : c
    ));
    setSaving(false);
    setConfigCard(null);
  }

  async function handleStatusChange(cardId: string, status: string) {
    await fetch('/api/admin/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cardId, status }),
    });
    setCards(prev => prev.map(c => c.id === cardId ? { ...c, status } : c));
  }

  async function handleCreate() {
    if (!createUserId.trim()) { setCreateErr('Entre l\'ID utilisateur.'); return; }
    if (!createNfcId.trim()) { setCreateErr('Entre un code NFC.'); return; }
    setCreating(true);
    setCreateErr('');
    const res = await fetch('/api/admin/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: createUserId.trim(), nfcId: createNfcId.trim().toUpperCase(), edition: createEdition, status: 'shipped' }),
    });
    const data = await res.json() as { error?: string; card?: AdminCard };
    if (!res.ok) { setCreateErr(data.error ?? 'Erreur.'); setCreating(false); return; }
    if (data.card) setCards(prev => [data.card!, ...prev]);
    setCreating(false);
    setShowCreate(false);
    setCreateUserId('');
    setCreateNfcId('');
  }

  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 6,
    padding: '10px 14px',
    color: 'var(--t-text)',
    fontFamily: 'Space Mono, monospace',
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 8 }}>
            Admin
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 24, color: 'var(--t-text)' }}>
            Commandes &amp; Cartes
          </h1>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateNfcId(generateNfcId()); setCreateErr(''); }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 6, padding: '10px 16px', color: '#818CF8',
            fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Créer une carte
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Rechercher par client, email ou code NFC…"
        style={{ ...inputStyle, fontFamily: 'DM Sans, sans-serif', fontSize: 13, maxWidth: 400 }}
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: 'var(--t-border-full)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 14px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase',
              color: tab === t ? STATUS_COLORS[t] ?? '#F8F9FC' : '#4B5563',
              borderBottom: tab === t ? `2px solid ${STATUS_COLORS[t] ?? '#F8F9FC'}` : '2px solid transparent',
              transition: 'all 0.2s', marginBottom: -1,
            }}
          >
            {TAB_LABELS[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#4B5563', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
          {tab === 'pending' ? '✅ Aucune commande en attente.' : 'Aucune carte trouvée.'}
        </div>
      ) : (
        <div style={{ background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 8, overflow: 'hidden' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 1fr 90px 120px 140px 120px', gap: 12, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {['', 'Client', 'Email', 'Plan', 'Code NFC', 'Commandée le', 'Action'].map((h, i) => (
              <span key={i} style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: 2, color: '#374151', textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>

          {filtered.map((card) => {
            const es = EDITION_COLORS[card.edition] ?? EDITION_COLORS.midnight;
            return (
              <div
                key={card.id}
                style={{
                  display: 'grid', gridTemplateColumns: '36px 1fr 1fr 90px 120px 140px 120px',
                  gap: 12, padding: '12px 16px', alignItems: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  transition: 'background 0.15s',
                }}
              >
                {/* Edition swatch */}
                <div style={{ width: 28, height: 18, borderRadius: 3, background: es.bg, border: `1px solid ${es.accent}44`, flexShrink: 0 }} />

                {/* Client name */}
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.user?.displayName ?? <span style={{ color: '#4B5563' }}>ID: {card.userId.slice(0, 10)}…</span>}
                </span>

                {/* Email */}
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--t-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {card.user?.email ?? '—'}
                </span>

                {/* Plan */}
                <span style={{
                  fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1, textTransform: 'uppercase',
                  color: card.user?.plan === 'pro' ? '#818CF8' : card.user?.plan === 'equipe' ? '#06B6D4' : '#9CA3AF',
                }}>
                  {card.user?.plan ?? '—'}
                </span>

                {/* NFC ID */}
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: card.nfcId ? '#10B981' : '#EF4444', letterSpacing: 1 }}>
                  {card.nfcId ?? 'Non assigné'}
                </span>

                {/* Date */}
                <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563' }}>
                  {new Date(card.orderedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                </span>

                {/* Action */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {card.status === 'pending' && (
                    <button
                      onClick={() => openConfigure(card)}
                      style={{
                        background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                        borderRadius: 4, padding: '4px 10px', color: '#EF4444',
                        fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 1,
                        cursor: 'pointer', textTransform: 'uppercase', whiteSpace: 'nowrap',
                      }}
                    >
                      Configurer
                    </button>
                  )}
                  {card.status === 'shipped' && (
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#F59E0B', letterSpacing: 1, textTransform: 'uppercase' }}>
                      Expédiée
                    </span>
                  )}
                  {card.status === 'active' && (
                    <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#10B981', letterSpacing: 1, textTransform: 'uppercase' }}>
                      ✓ Active
                    </span>
                  )}
                  {/* Edit button for all non-pending cards */}
                  {card.status !== 'pending' && (
                    <button
                      onClick={() => openEdit(card)}
                      title="Modifier le code NFC"
                      style={{
                        width: 26, height: 26, background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4,
                        cursor: 'pointer', color: '#6B7280', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F8F9FC'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#6B7280'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'; }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Configure modal */}
      {configCard && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setConfigCard(null); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div style={{ background: 'var(--t-surface)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 440 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 16 }}>
              {isEditMode ? 'Modifier la carte' : 'Configurer la carte'}
            </p>

            {/* Client info */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: 'var(--t-border-full)', borderRadius: 6, padding: '12px 16px', marginBottom: 24 }}>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: 'var(--t-text)', marginBottom: 2 }}>
                {configCard.user?.displayName ?? 'Client inconnu'}
              </p>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--t-text-muted)' }}>
                {configCard.user?.email ?? configCard.userId}
              </p>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: configCard.user?.plan === 'pro' ? '#818CF8' : '#9CA3AF', marginTop: 6, textTransform: 'uppercase', letterSpacing: 1 }}>
                Plan {configCard.user?.plan ?? '—'}
              </p>
            </div>

            {/* Card spec (type, metallic, color, customization) */}
            {(configCard.cardType || configCard.metallic !== null || configCard.customization) && (
              <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16 }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 10 }}>
                  💳 Spécifications carte
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {configCard.cardType && (
                    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)' }}>
                      <span style={{ color: 'var(--t-text-muted)' }}>Type :</span> <strong style={{ textTransform: 'capitalize' }}>{configCard.cardType}</strong>
                    </p>
                  )}
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)' }}>
                    <span style={{ color: 'var(--t-text-muted)' }}>Matière :</span>{' '}
                    <strong>{configCard.metallic ? '✨ Métal' : 'PVC'}</strong>
                    {configCard.pvcColor && !configCard.metallic && ` (${configCard.pvcColor === 'white' ? 'Blanc' : 'Noir'})`}
                  </p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)' }}>
                    <span style={{ color: 'var(--t-text-muted)' }}>Édition :</span> <strong>{configCard.edition}</strong>
                  </p>
                </div>

                {configCard.customization && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 8 }}>
                      Identité visuelle (à imprimer)
                    </p>
                    {configCard.customization.displayName && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)', marginBottom: 2 }}>
                        <span style={{ color: 'var(--t-text-muted)' }}>Nom :</span> <strong>{configCard.customization.displayName}</strong>
                      </p>
                    )}
                    {configCard.customization.title && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)', marginBottom: 2 }}>
                        <span style={{ color: 'var(--t-text-muted)' }}>Poste :</span> <strong>{configCard.customization.title}</strong>
                      </p>
                    )}
                    {configCard.customization.company && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)', marginBottom: 2 }}>
                        <span style={{ color: 'var(--t-text-muted)' }}>Entreprise :</span> <strong>{configCard.customization.company}</strong>
                      </p>
                    )}
                    {configCard.customization.brandColor && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text)', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: 'var(--t-text-muted)' }}>Couleur :</span>
                        <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: 3, background: configCard.customization.brandColor, border: '1px solid rgba(255,255,255,0.2)' }} />
                        <strong style={{ fontFamily: 'Space Mono, monospace', fontSize: 11 }}>{configCard.customization.brandColor}</strong>
                      </p>
                    )}
                    {configCard.customization.logoUrl && (
                      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: 'var(--t-text-muted)', marginTop: 6, wordBreak: 'break-all' }}>
                        <span>Logo :</span> <a href={configCard.customization.logoUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#818CF8', textDecoration: 'underline' }}>{configCard.customization.logoUrl}</a>
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* QR Code of customer's profile */}
            {configCard.user?.username && (
              <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flexShrink: 0, padding: 4, background: '#fff', borderRadius: 6 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(`https://weconnect.cards/${configCard.user.username}`)}`}
                    alt="QR profil"
                    width={88}
                    height={88}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#10B981', textTransform: 'uppercase', marginBottom: 6 }}>
                    🔗 QR du profil client
                  </p>
                  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#818CF8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                    weconnect.cards/{configCard.user.username}
                  </p>
                  <button
                    onClick={() => navigator.clipboard.writeText(`https://weconnect.cards/${configCard.user!.username}`)}
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 4, padding: '4px 10px', color: '#818CF8', fontSize: 10, fontFamily: 'DM Sans, sans-serif', cursor: 'pointer' }}
                  >
                    Copier l&apos;URL
                  </button>
                </div>
              </div>
            )}

            {/* Delivery info */}
            {configCard.delivery && (
              <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 20 }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: '#F59E0B', textTransform: 'uppercase', marginBottom: 10 }}>
                  📦 Adresse de livraison
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: 'var(--t-text)', marginBottom: 2 }}>
                  {configCard.delivery.fullName}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)', marginBottom: 2 }}>
                  {configCard.delivery.phone}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)', marginBottom: 2 }}>
                  {configCard.delivery.address}, {configCard.delivery.city}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)', marginBottom: configCard.delivery.notes ? 6 : 0 }}>
                  {COUNTRY_LABELS[configCard.delivery.country] ?? configCard.delivery.country}
                </p>
                {configCard.delivery.notes && (
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#F59E0B', fontStyle: 'italic' }}>
                    Note: {configCard.delivery.notes}
                  </p>
                )}
              </div>
            )}

            {/* NFC ID */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Code NFC (programmé sur la puce)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={nfcInput}
                  onChange={e => setNfcInput(e.target.value.toUpperCase())}
                  placeholder="WC-XXXXXX"
                  style={{ ...inputStyle, flex: 1, letterSpacing: 3 }}
                />
                <button
                  onClick={() => setNfcInput(generateNfcId())}
                  title="Générer un code"
                  style={{
                    flexShrink: 0, width: 38, height: 38, background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, cursor: 'pointer',
                    color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                  </svg>
                </button>
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#4B5563', marginTop: 6 }}>
                Programme la puce NFC avec l&apos;URL : <code style={{ color: '#6366F1' }}>weconnect.cards/nfc/{nfcInput || 'WC-XXXXXX'}</code>
              </p>
            </div>

            {/* Edition */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
                Édition de la carte
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {EDITIONS.map(ed => {
                  const es = EDITION_COLORS[ed];
                  return (
                    <button
                      key={ed}
                      onClick={() => setEditionInput(ed)}
                      title={ed}
                      style={{
                        width: 36, height: 24, borderRadius: 4, background: es.bg,
                        border: `2px solid ${editionInput === ed ? es.accent : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: editionInput === ed ? `0 0 8px ${es.accent}66` : 'none',
                      }}
                    />
                  );
                })}
              </div>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, color: '#4B5563', marginTop: 6, textTransform: 'capitalize', letterSpacing: 1 }}>
                Édition sélectionnée : {editionInput}
              </p>
            </div>

            {saveErr && (
              <p style={{ color: '#EF4444', fontSize: 12, fontFamily: 'DM Sans, sans-serif', marginBottom: 16 }}>{saveErr}</p>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfigCard(null)}
                style={{
                  flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                  color: 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfigure}
                disabled={saving}
                style={{
                  flex: 2, padding: '10px', background: 'linear-gradient(135deg, #EF4444, #F97316)',
                  border: 'none', borderRadius: 6,
                  color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Enregistrement…' : isEditMode ? '💾 Enregistrer les modifications' : '✅ Marquer comme expédiée'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create card modal */}
      {showCreate && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
          }}
        >
          <div style={{ background: 'var(--t-surface)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: 32, width: '100%', maxWidth: 400 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6366F1', textTransform: 'uppercase', marginBottom: 20 }}>
              Créer une carte
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  UID Firebase du client
                </label>
                <input
                  value={createUserId}
                  onChange={e => setCreateUserId(e.target.value.trim())}
                  placeholder="abc123xyz…"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Code NFC
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={createNfcId}
                    onChange={e => setCreateNfcId(e.target.value.toUpperCase())}
                    placeholder="WC-XXXXXX"
                    style={{ ...inputStyle, flex: 1, letterSpacing: 3 }}
                  />
                  <button
                    onClick={() => setCreateNfcId(generateNfcId())}
                    style={{
                      flexShrink: 0, width: 38, height: 38, background: 'rgba(99,102,241,0.1)',
                      border: '1px solid rgba(99,102,241,0.2)', borderRadius: 6, cursor: 'pointer',
                      color: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M23 4v6h-6M1 20v-6h6"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div>
                <label style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                  Édition
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {EDITIONS.map(ed => {
                    const es = EDITION_COLORS[ed];
                    return (
                      <button
                        key={ed}
                        onClick={() => setCreateEdition(ed)}
                        title={ed}
                        style={{
                          width: 36, height: 24, borderRadius: 4, background: es.bg,
                          border: `2px solid ${createEdition === ed ? es.accent : 'rgba(255,255,255,0.1)'}`,
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {createErr && (
              <p style={{ color: '#EF4444', fontSize: 12, fontFamily: 'DM Sans, sans-serif', marginTop: 12 }}>{createErr}</p>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button
                onClick={() => setShowCreate(false)}
                style={{
                  flex: 1, padding: '10px', background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                  color: 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: 'pointer',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                style={{
                  flex: 2, padding: '10px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)',
                  border: 'none', borderRadius: 6,
                  color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600,
                  cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1,
                }}
              >
                {creating ? 'Création…' : 'Créer la carte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
