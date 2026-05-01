'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import LogoSymbol from '@/components/logo/LogoSymbol';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// ─── Types ───────────────────────────────────────────────────────────────────

type DeliveryInfo = {
  fullName: string;
  phone:    string;
  address:  string;
  city:     string;
  country:  'BJ' | 'TG' | 'BF';
  notes?:   string;
};

type Card = {
  id:             string;
  edition:        string;
  status:         string;
  nfcId?:         string | null;
  orderedAt:      string;
  activatedAt?:   string | null;
  delivery?:      DeliveryInfo | null;
  selectedModule?: string | null;
};

type Profile = {
  username:    string;
  displayName: string;
  title?:      string | null;
  theme:       string;
} | null;

// ─── Constants ────────────────────────────────────────────────────────────────

const EDITION_STYLES: Record<string, { bg: string; textColor: string; accent: string; name: string }> = {
  midnight: { bg: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)', textColor: '#F8F9FC', accent: '#6366F1', name: 'Midnight' },
  electric: { bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338CA 100%)', textColor: '#F8F9FC', accent: '#818CF8', name: 'Electric' },
  glass:    { bg: 'linear-gradient(135deg, #0c1a2e 0%, #0e2340 100%)', textColor: '#F8F9FC', accent: '#06B6D4', name: 'Glass'    },
  metal:    { bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', textColor: '#F8F9FC', accent: '#9CA3AF', name: 'Métal'    },
};

type BadgeVariant = 'success' | 'warning' | 'neutral' | 'electric' | 'cyan' | 'danger' | 'gradient';

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string; desc: string }> = {
  active:   { variant: 'success',  label: 'Active',          desc: 'Carte liée et fonctionnelle'      },
  pending:  { variant: 'warning',  label: 'En attente',      desc: 'En cours de préparation'          },
  shipped:  { variant: 'electric', label: 'En transit',      desc: 'Expédiée, livraison en cours'     },
  inactive: { variant: 'neutral',  label: 'Expirée',         desc: 'Carte désactivée'                 },
};

const COUNTRIES = {
  BJ: { label: 'Bénin',        flag: '🇧🇯', days: '2–3 jours ouvrés' },
  TG: { label: 'Togo',         flag: '🇹🇬', days: '3–5 jours ouvrés' },
  BF: { label: 'Burkina Faso', flag: '🇧🇫', days: '5–7 jours ouvrés' },
} as const;

type CardType = 'standard' | 'pro' | 'prestige';

const ORDER_PLANS: Record<CardType, {
  basePrice:   number;
  metalSurcharge: number; // pourcentage
  label:       string;
  color:       string;
  features:    string[];
  hasMetalOption: boolean;
  hasColorOption: boolean;
  hasCustomization: boolean;
  freeMonths:  number;
}> = {
  standard: {
    basePrice:        10_000,
    metalSurcharge:   20,
    label:            'Standard',
    color:            '#9CA3AF',
    features:         ['Carte WeConnect (recto)', 'QR dynamique (verso)', '1 module', '6 mois offerts'],
    hasMetalOption:   true,
    hasColorOption:   true,
    hasCustomization: false,
    freeMonths:       6,
  },
  pro: {
    basePrice:        15_000,
    metalSurcharge:   14,
    label:            'Pro',
    color:            '#6366F1',
    features:         ['Carte personnalisée', '3 modules', 'Compte Pro', '6 mois offerts'],
    hasMetalOption:   true,
    hasColorOption:   true,
    hasCustomization: true,
    freeMonths:       6,
  },
  prestige: {
    basePrice:        25_000,
    metalSurcharge:   0,
    label:            'Prestige',
    color:            '#F59E0B',
    features:         ['Personnalisation complète', 'Double face', 'Métal premium', 'Tous modules', '12 mois offerts'],
    hasMetalOption:   false, // toujours métal
    hasColorOption:   false,
    hasCustomization: true,
    freeMonths:       12,
  },
};

function computePrice(cardType: CardType, metallic: boolean): number {
  const p = ORDER_PLANS[cardType];
  if (cardType === 'prestige') return p.basePrice;
  if (metallic) return Math.round(p.basePrice * (1 + p.metalSurcharge / 100));
  return p.basePrice;
}

function fmtFCFA(n: number): string {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

const MODULES = [
  { id: 'profile', label: 'Carte de visite',   desc: 'Liens sociaux, contact, mini bio',   icon: '👤' },
  { id: 'loyalty', label: 'Fidélité',           desc: 'Programme de points et tampons',     icon: '⭐' },
  { id: 'menu',    label: 'Menu digital',        desc: 'Carte restaurant ou café',           icon: '🍽️' },
  { id: 'event',   label: 'Événements',          desc: 'Gestion de billets et inscriptions', icon: '🎟️' },
  { id: 'access',  label: 'Contrôle d\'accès',  desc: 'Badges et zones sécurisées',         icon: '🔐' },
  { id: 'member',  label: 'Cartes membres',      desc: 'Programme d\'adhésion',              icon: '💳' },
] as const;

// ─── Card Visual ──────────────────────────────────────────────────────────────

function CardVisual({ edition, profile }: { edition: string; profile: Profile }) {
  const style = EDITION_STYLES[edition] ?? EDITION_STYLES.midnight;
  return (
    <div style={{
      width: '100%', maxWidth: 300, aspectRatio: '85.6/54',
      background: style.bg, borderRadius: 12, padding: 18,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      border: `1px solid ${style.accent}33`,
      boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 28px ${style.accent}22`,
      position: 'relative', overflow: 'hidden', flexShrink: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 28, height: 20, background: 'linear-gradient(135deg, #F59E0B, #FBBF24)', borderRadius: 3, opacity: 0.9 }} />
        <div style={{ position: 'relative', width: 24, height: 24 }}>
          {[24, 16, 8].map((s, i) => (
            <div key={i} style={{
              position: 'absolute', top: '50%', left: '50%', width: s, height: s,
              transform: 'translate(-50%,-50%)', borderRadius: '50%',
              border: `1.5px solid ${style.accent}${Math.round((0.6 - i * 0.15) * 255).toString(16).padStart(2, '0')}`,
            }} />
          ))}
        </div>
      </div>
      <div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: style.textColor, marginBottom: 2 }}>
          {profile?.displayName ?? 'Votre nom'}
        </p>
        {profile?.title && (
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 6, letterSpacing: 2, color: `${style.textColor}99`, textTransform: 'uppercase' }}>
            {profile.title}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoSymbol width={34} height={23} />
        <div style={{ padding: '2px 6px', background: `${style.accent}22`, border: `1px solid ${style.accent}44`, borderRadius: 3 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 6, color: style.accent, letterSpacing: 2, textTransform: 'uppercase' }}>
            {style.name.toUpperCase()}
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${style.accent}, ${style.accent}55)` }} />
    </div>
  );
}

// ─── Order Modal ──────────────────────────────────────────────────────────────

function OrderModal({
  profile,
  onClose,
}: {
  profile: Profile;
  onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep]               = useState<1 | 2 | 3>(1);
  const [cardType, setCardType]       = useState<CardType>('standard');
  const [edition, setEdition]         = useState('midnight');
  const [metallic, setMetallic]       = useState(false);
  const [pvcColor, setPvcColor]       = useState<'white' | 'black'>('black');
  const [customDisplayName, setCustomDisplayName] = useState(profile?.displayName ?? '');
  const [customTitle, setCustomTitle]             = useState(profile?.title ?? '');
  const [customCompany, setCustomCompany]         = useState('');
  const [customLogoUrl, setCustomLogoUrl]         = useState('');
  const [customBrandColor, setCustomBrandColor]   = useState('#6366F1');
  const [ordering, setOrdering]                   = useState(false);
  const [orderError, setOrderError]               = useState('');

  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: profile?.displayName ?? '',
    phone:    '',
    address:  '',
    city:     '',
    country:  'BJ',
    notes:    '',
  });

  const planMeta   = ORDER_PLANS[cardType];
  const finalPrice = computePrice(cardType, planMeta.hasMetalOption ? metallic : cardType === 'prestige');

  function setField(field: keyof DeliveryInfo, value: string) {
    setDelivery((prev) => ({ ...prev, [field]: value }));
  }

  async function handleOrder() {
    setOrdering(true);
    setOrderError('');
    try {
      const customization = planMeta.hasCustomization ? {
        displayName: customDisplayName.trim(),
        title:       customTitle.trim() || undefined,
        company:     customCompany.trim() || undefined,
        logoUrl:     customLogoUrl.trim() || undefined,
        brandColor:  customBrandColor,
      } : undefined;

      const res  = await fetch('/api/cards/order', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          cardType,
          edition,
          metallic: planMeta.hasMetalOption ? metallic : cardType === 'prestige',
          pvcColor: planMeta.hasColorOption ? pvcColor : undefined,
          customization,
          delivery,
        }),
      });
      const data = await res.json() as { paymentUrl?: string; error?: string };
      if (!res.ok || !data.paymentUrl) throw new Error(data.error ?? 'Erreur');
      window.location.href = data.paymentUrl;
    } catch (e) {
      setOrderError((e as Error).message);
      setOrdering(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8, color: 'var(--t-text)',
    fontFamily: 'DM Sans, sans-serif', fontSize: 14,
    outline: 'none', boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Space Mono, monospace', fontSize: 9,
    letterSpacing: 2, color: 'var(--t-text-muted)',
    textTransform: 'uppercase', marginBottom: 6, display: 'block',
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--t-surface)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, width: '100%', maxWidth: 560,
          maxHeight: '90vh', overflowY: 'auto',
          padding: 32, position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16, background: 'none',
            border: 'none', cursor: 'pointer', color: 'var(--t-text-muted)', fontSize: 20,
          }}
        >
          ✕
        </button>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { n: 1, label: 'Carte' },
            { n: 2, label: 'Personnaliser' },
            { n: 3, label: 'Livraison' },
          ].map((s) => (
            <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: step >= s.n ? '#6366F1' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${step >= s.n ? '#6366F1' : 'rgba(255,255,255,0.12)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Mono, monospace', fontSize: 11,
                color: step >= s.n ? '#fff' : 'var(--t-text-muted)',
              }}>
                {s.n}
              </div>
              <span style={{ fontSize: 11.5, color: step === s.n ? 'var(--t-text)' : 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                {s.label}
              </span>
              {s.n < 3 && <div style={{ width: 16, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--t-text)', marginBottom: 8 }}>
              Choisir une carte
            </h3>
            <p style={{ color: 'var(--t-text-muted)', fontSize: 13, marginBottom: 20 }}>
              3 éditions officielles. Choisis celle qui matche ton ambition.
            </p>

            {/* Card type selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              {(Object.entries(ORDER_PLANS) as [CardType, typeof ORDER_PLANS[CardType]][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => { setCardType(key); if (key === 'prestige') setMetallic(true); }}
                  style={{
                    padding: 14, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                    background: cardType === key ? `${info.color}12` : 'rgba(255,255,255,0.03)',
                    border: `2px solid ${cardType === key ? info.color : 'rgba(255,255,255,0.08)'}`,
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: 'var(--t-text)', textTransform: 'capitalize' }}>
                      Carte {info.label}
                    </p>
                    <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 16, color: info.color }}>
                      {fmtFCFA(info.basePrice)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {info.features.map((f) => (
                      <span key={f} style={{ fontSize: 11, color: 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif' }}>
                        ✓ {f}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Edition selector */}
            <p style={labelStyle}>Édition visuelle</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
              {Object.entries(EDITION_STYLES).map(([key, s]) => (
                <button
                  key={key}
                  onClick={() => setEdition(key)}
                  title={s.name}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: s.bg,
                    border: `2px solid ${edition === key ? s.accent : 'rgba(255,255,255,0.1)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: edition === key ? `0 0 10px ${s.accent}55` : 'none',
                  }}
                />
              ))}
              <span style={{ fontSize: 12, color: 'var(--t-text-muted)', fontFamily: 'DM Sans, sans-serif', marginLeft: 4 }}>
                {EDITION_STYLES[edition]?.name}
              </span>
            </div>

            {/* Card preview */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <CardVisual edition={edition} profile={profile} />
            </div>

            <Button variant="gradient" size="md" style={{ width: '100%' }} onClick={() => setStep(2)}>
              Continuer → Personnaliser
            </Button>
          </>
        )}

        {step === 2 && (
          <>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--t-text)', marginBottom: 8 }}>
              Personnaliser ta carte
            </h3>
            <p style={{ color: 'var(--t-text-muted)', fontSize: 13, marginBottom: 20 }}>
              {cardType === 'prestige'
                ? 'Carte métallique premium, double face, entièrement personnalisée.'
                : `Carte ${planMeta.label} — choisis matière et couleur.`}
            </p>

            {/* Metallic toggle */}
            {planMeta.hasMetalOption && (
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Matière</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    onClick={() => setMetallic(false)}
                    style={{
                      padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                      background: !metallic ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${!metallic ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                    }}
                  >
                    <p style={{ fontSize: 13, color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>PVC</p>
                    <p style={{ fontSize: 10, color: 'var(--t-text-muted)', fontFamily: 'Space Mono, monospace' }}>Standard · inclus</p>
                  </button>
                  <button
                    onClick={() => setMetallic(true)}
                    style={{
                      padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                      background: metallic ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `2px solid ${metallic ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 8,
                    }}
                  >
                    <p style={{ fontSize: 13, color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>Métal ✨</p>
                    <p style={{ fontSize: 10, color: '#F59E0B', fontFamily: 'Space Mono, monospace' }}>+{planMeta.metalSurcharge}%</p>
                  </button>
                </div>
              </div>
            )}

            {/* PVC color (only if PVC) */}
            {planMeta.hasColorOption && !metallic && (
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Couleur PVC</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {(['black', 'white'] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setPvcColor(c)}
                      style={{
                        padding: '12px 14px', cursor: 'pointer',
                        background: pvcColor === c ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `2px solid ${pvcColor === c ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: 8,
                        display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <div style={{
                        width: 24, height: 16, borderRadius: 3,
                        background: c === 'white' ? '#F8F9FC' : '#08090C',
                        border: '1px solid rgba(255,255,255,0.2)',
                      }} />
                      <span style={{ fontSize: 13, color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif' }}>
                        {c === 'white' ? 'Blanc' : 'Noir'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Customization (Pro/Prestige) */}
            {planMeta.hasCustomization && (
              <div style={{
                marginBottom: 18, padding: 16,
                background: 'rgba(99,102,241,0.05)',
                border: '1px solid rgba(99,102,241,0.15)',
                borderRadius: 8,
              }}>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#818CF8', textTransform: 'uppercase', marginBottom: 14 }}>
                  Identité visuelle
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nom à afficher *</label>
                    <input style={inputStyle} value={customDisplayName}
                      onChange={(e) => setCustomDisplayName(e.target.value)} placeholder="Sophie Martin" />
                  </div>
                  <div>
                    <label style={labelStyle}>Poste / Titre</label>
                    <input style={inputStyle} value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)} placeholder="CEO & Founder" />
                  </div>
                  <div>
                    <label style={labelStyle}>Entreprise</label>
                    <input style={inputStyle} value={customCompany}
                      onChange={(e) => setCustomCompany(e.target.value)} placeholder="Acme Corp" />
                  </div>
                  <div>
                    <label style={labelStyle}>URL du logo (PNG/SVG)</label>
                    <input style={inputStyle} value={customLogoUrl}
                      onChange={(e) => setCustomLogoUrl(e.target.value)} placeholder="https://exemple.com/logo.png" />
                    <p style={{ fontSize: 11, color: 'var(--t-text-muted)', marginTop: 4 }}>
                      Tu peux nous envoyer le fichier après commande si tu n&apos;as pas encore d&apos;URL.
                    </p>
                  </div>
                  <div>
                    <label style={labelStyle}>Couleur d&apos;accent</label>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input type="color" value={customBrandColor}
                        onChange={(e) => setCustomBrandColor(e.target.value)}
                        style={{ width: 48, height: 36, border: 'none', borderRadius: 6, cursor: 'pointer', background: 'transparent' }}
                      />
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--t-text-muted)' }}>
                        {customBrandColor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price summary */}
            <div style={{
              background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '12px 14px', marginBottom: 16,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', textTransform: 'uppercase' }}>
                Total
              </p>
              <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: planMeta.color }}>
                {fmtFCFA(finalPrice)}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" size="md" onClick={() => setStep(1)} style={{ flex: 1 }}>← Retour</Button>
              <Button variant="gradient" size="md" onClick={() => setStep(3)} style={{ flex: 2 }}>
                Continuer → Livraison
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--t-text)', marginBottom: 8 }}>
              Informations de livraison
            </h3>
            <p style={{ color: 'var(--t-text-muted)', fontSize: 13, marginBottom: 20 }}>
              Ta carte sera livrée directement à cette adresse.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Nom complet</label>
                <input style={inputStyle} value={delivery.fullName}
                  onChange={(e) => setField('fullName', e.target.value)} placeholder="Jean Dupont" />
              </div>

              <div>
                <label style={labelStyle}>Numéro de téléphone</label>
                <input style={inputStyle} value={delivery.phone}
                  onChange={(e) => setField('phone', e.target.value)} placeholder="+229 97 00 00 00" />
              </div>

              <div>
                <label style={labelStyle}>Adresse</label>
                <input style={inputStyle} value={delivery.address}
                  onChange={(e) => setField('address', e.target.value)} placeholder="Rue, quartier..." />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Ville</label>
                  <input style={inputStyle} value={delivery.city}
                    onChange={(e) => setField('city', e.target.value)} placeholder="Cotonou" />
                </div>
                <div>
                  <label style={labelStyle}>Pays</label>
                  <select
                    value={delivery.country}
                    onChange={(e) => setField('country', e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                  >
                    {(Object.entries(COUNTRIES) as [keyof typeof COUNTRIES, typeof COUNTRIES[keyof typeof COUNTRIES]][]).map(([code, c]) => (
                      <option key={code} value={code} style={{ background: '#1a1d24' }}>
                        {c.flag} {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Delivery estimate */}
              <div style={{
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: 18 }}>📦</span>
                <div>
                  <p style={{ color: '#818CF8', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600 }}>
                    Livraison estimée — {COUNTRIES[delivery.country].days}
                  </p>
                  <p style={{ color: 'var(--t-text-muted)', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>
                    Livraison express disponible — nous vous contacterons après la commande
                  </p>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Instructions / Notes (optionnel)</label>
                <textarea
                  value={delivery.notes ?? ''}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={2}
                  placeholder="Ex: appeler avant livraison..."
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 60 }}
                />
              </div>
            </div>

            {orderError && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                color: '#F87171', fontSize: 13, fontFamily: 'DM Sans, sans-serif',
              }}>
                {orderError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" size="md" onClick={() => setStep(2)} style={{ flex: 1 }}>
                ← Retour
              </Button>
              <Button
                variant="gradient" size="md"
                loading={ordering}
                onClick={handleOrder}
                style={{ flex: 2 }}
              >
                {ordering ? 'Redirection...' : `Commander — ${fmtFCFA(finalPrice)}`}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Module Picker Modal ──────────────────────────────────────────────────────

function ModulePickerModal({
  card,
  onClose,
  onSaved,
}: {
  card: Card;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState(card.selectedModule ?? '');
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');

  async function handleSave() {
    if (!selected) return;
    setSaving(true);
    setError('');
    const res  = await fetch('/api/cards/module', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cardId: card.id, module: selected }),
    });
    if (!res.ok) {
      const d = await res.json() as { error?: string };
      setError(d.error ?? 'Erreur');
      setSaving(false);
      return;
    }
    onSaved();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--t-surface)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, width: '100%', maxWidth: 480, padding: 32, position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-text-muted)', fontSize: 20 }}
        >
          ✕
        </button>

        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: 'var(--t-text)', marginBottom: 6 }}>
          Choisir mon module
        </h3>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 13, marginBottom: 20 }}>
          Plan Essentiel — 1 module inclus. Sélectionne celui qui correspond à ton activité.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {MODULES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                background: selected === m.id ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${selected === m.id ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: 22, flexShrink: 0 }}>{m.icon}</span>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: 'var(--t-text)', marginBottom: 2 }}>
                  {m.label}
                </p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--t-text-muted)' }}>
                  {m.desc}
                </p>
              </div>
              {selected === m.id && (
                <span style={{ marginLeft: 'auto', color: '#6366F1', fontSize: 16 }}>✓</span>
              )}
            </button>
          ))}
        </div>

        {error && (
          <p style={{ color: '#F87171', fontSize: 12, marginBottom: 12, fontFamily: 'DM Sans, sans-serif' }}>{error}</p>
        )}

        <Button
          variant="gradient" size="md"
          loading={saving}
          onClick={handleSave}
          style={{ width: '100%' }}
        >
          {saving ? 'Enregistrement...' : 'Confirmer le module'}
        </Button>
      </div>
    </div>
  );
}

// ─── Payment success banner ───────────────────────────────────────────────────

function PaymentSuccessBanner() {
  const params = useSearchParams();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (params.get('payment') === 'success') setVisible(true);
  }, [params]);

  if (!visible) return null;

  return (
    <div style={{
      background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
      borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <span style={{ fontSize: 20 }}>✅</span>
      <div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 14, color: '#10B981', marginBottom: 2 }}>
          Commande confirmée !
        </p>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
          Ta carte est en cours de préparation. Tu recevras une notification à chaque étape.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t-text-muted)', fontSize: 18, flexShrink: 0 }}
      >
        ✕
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function CardsClientInner({ cards, profile, userPlan }: {
  cards: Card[];
  profile: Profile;
  userPlan: string;
}) {
  const router = useRouter();
  const [orderOpen, setOrderOpen]     = useState(false);
  const [modulePicker, setModulePicker] = useState<Card | null>(null);
  const [nfcCode, setNfcCode]         = useState('');
  const [activating, setActivating]   = useState(false);
  const [activateError, setActivateError] = useState('');
  const [activateSuccess, setActivateSuccess] = useState(false);

  async function handleActivate() {
    if (!nfcCode.trim()) { setActivateError('Entre ton code NFC.'); return; }
    setActivating(true);
    setActivateError('');
    const res  = await fetch('/api/activate', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfcId: nfcCode }),
    });
    const data = await res.json() as { error?: string };
    if (!res.ok) { setActivateError(data.error ?? 'Erreur.'); setActivating(false); return; }
    setActivateSuccess(true);
    setNfcCode('');
    setTimeout(() => router.refresh(), 800);
  }

  const isEssentiel = userPlan === 'essentiel';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 860 }}>

      {/* Payment success */}
      <PaymentSuccessBanner />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t-text)', marginBottom: 4 }}>
            Mes cartes NFC
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>
            {cards.length === 0
              ? 'Aucune carte commandée pour l\'instant.'
              : `${cards.length} carte${cards.length > 1 ? 's' : ''} sur ce compte.`}
          </p>
        </div>
        <Button variant="gradient" size="md" onClick={() => setOrderOpen(true)}>
          + Commander une carte
        </Button>
      </div>

      {/* Cards list */}
      {cards.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            Mes cartes
          </p>
          {cards.map((card) => {
            const status   = STATUS_BADGE[card.status] ?? STATUS_BADGE.pending;
            const edStyle  = EDITION_STYLES[card.edition] ?? EDITION_STYLES.midnight;
            const canPickModule = isEssentiel && card.status === 'active';

            return (
              <div key={card.id} style={{
                background: 'var(--t-surface)',
                border: `1px solid ${card.status === 'active' ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 10, padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{
                    width: 40, height: 28, borderRadius: 6, flexShrink: 0,
                    background: edStyle.bg,
                    border: `1px solid ${edStyle.accent}33`,
                  }} />
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                      <Badge variant={status.variant} dot>{status.label}</Badge>
                      {card.nfcId && (
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: 'var(--t-text-muted)', letterSpacing: 2 }}>
                          {card.nfcId}
                        </span>
                      )}
                    </div>
                    <p style={{ color: 'var(--t-text-muted)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
                      {edStyle.name} · Commandée le{' '}
                      {new Date(card.orderedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    {card.delivery && (
                      <p style={{ color: 'var(--t-text-muted)', fontSize: 11, fontFamily: 'DM Sans, sans-serif', marginTop: 2 }}>
                        📦 {card.delivery.city}, {COUNTRIES[card.delivery.country]?.label ?? card.delivery.country}
                      </p>
                    )}
                    {card.status === 'pending' && (
                      <p style={{ color: '#F59E0B', fontSize: 11, fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
                        {status.desc} — délai de 2–7 jours selon ta localisation
                      </p>
                    )}
                    {card.status === 'shipped' && (
                      <p style={{ color: '#818CF8', fontSize: 11, fontFamily: 'DM Sans, sans-serif', marginTop: 4 }}>
                        {status.desc}
                      </p>
                    )}
                  </div>
                  {canPickModule && (
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setModulePicker(card)}
                    >
                      {card.selectedModule
                        ? `Module: ${MODULES.find((m) => m.id === card.selectedModule)?.label ?? card.selectedModule}`
                        : '🔧 Choisir mon module'}
                    </Button>
                  )}
                  {card.selectedModule && card.status === 'active' && (
                    <span style={{ fontSize: 12, color: '#10B981', fontFamily: 'DM Sans, sans-serif', flexShrink: 0 }}>
                      ✓ Activée
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 && (
        <div style={{
          background: 'var(--t-surface)', border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 12, padding: 40, textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💳</div>
          <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--t-text)', marginBottom: 8 }}>
            Aucune carte encore
          </p>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 13, fontFamily: 'DM Sans, sans-serif', marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>
            Commande ta première carte NFC We Connect et partage ton profil digital d&apos;un simple tap.
          </p>
          <Button variant="gradient" size="md" onClick={() => setOrderOpen(true)}>
            Commander ma première carte
          </Button>
        </div>
      )}

      {/* Card format info */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[
          { label: 'Format',        value: '85.6 × 54 mm — standard CB' },
          { label: 'Puce',          value: 'NFC NTAG213/215' },
          { label: 'Compatibilité', value: 'iOS & Android · Portée 10 cm' },
          { label: 'Livraison',     value: 'Bénin · Togo · Burkina Faso' },
        ].map((item) => (
          <div key={item.label} style={{
            background: 'var(--t-surface)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 8, padding: '10px 14px', flex: '1 1 160px',
          }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: 'var(--t-text-muted)', marginBottom: 4, textTransform: 'uppercase' }}>
              {item.label}
            </p>
            <p style={{ color: 'var(--t-text)', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Activate section */}
      <div style={{ background: 'var(--t-surface)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 24 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: 'var(--t-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
          Activer une carte
        </p>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
          Tu as reçu ta carte ? Entre le code NFC imprimé dans l&apos;emballage pour l&apos;activer.
        </p>
        {activateSuccess ? (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '12px 16px', color: '#10B981', fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>
            ✅ Carte activée avec succès !
          </div>
        ) : (
          <>
            <input
              value={nfcCode}
              onChange={(e) => setNfcCode(e.target.value.toUpperCase())}
              placeholder="WC-XXXXXX"
              style={{
                width: '100%', marginBottom: 10,
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${activateError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, padding: '10px 14px',
                color: 'var(--t-text)', fontFamily: 'Space Mono, monospace',
                fontSize: 13, letterSpacing: 3, outline: 'none', boxSizing: 'border-box',
              }}
            />
            {activateError && <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 10 }}>{activateError}</p>}
            <Button variant="gradient" size="md" loading={activating} onClick={handleActivate} style={{ width: '100%' }}>
              {activating ? 'Activation...' : 'Activer ma carte ⚡'}
            </Button>
          </>
        )}
      </div>

      {/* Modals */}
      {orderOpen && <OrderModal profile={profile} onClose={() => setOrderOpen(false)} />}
      {modulePicker && (
        <ModulePickerModal
          card={modulePicker}
          onClose={() => setModulePicker(null)}
          onSaved={() => { setModulePicker(null); router.refresh(); }}
        />
      )}
    </div>
  );
}

export default function CardsClient(props: { cards: Card[]; profile: Profile; userPlan: string }) {
  return (
    <Suspense>
      <CardsClientInner {...props} />
    </Suspense>
  );
}
