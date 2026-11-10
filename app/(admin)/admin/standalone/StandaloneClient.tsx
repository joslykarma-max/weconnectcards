'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  DEFAULT_DISPLAY_MODE, DISPLAY_MODES, STANDALONE_EDITIONS, STANDALONE_LINK_TYPES, defaultLinkLabel,
  type StandaloneCardView, type StandaloneEdition, type StandaloneLinkInput,
  type StandalonePayload, type StandaloneProfileInput,
} from '@/lib/standalone';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://weconnect.cards';
const APP_HOST = APP_URL.replace(/^https?:\/\//, '');

const EDITION_META: Record<StandaloneEdition, { label: string; accent: string }> = {
  midnight: { label: 'Midnight', accent: '#6366F1' },
  electric: { label: 'Electric', accent: '#818CF8' },
  glass:    { label: 'Glass',    accent: '#06B6D4' },
  metal:    { label: 'Métal',    accent: '#9CA3AF' },
};

type FormState = {
  nfcId:       string;
  label:       string;
  edition:     StandaloneEdition;
  mode:        'profile' | 'redirect';
  redirectUrl: string;
  active:      boolean;
  profile:     StandaloneProfileInput;
  links:       StandaloneLinkInput[];
};

const emptyForm = (): FormState => ({
  nfcId: '', label: '', edition: 'midnight', mode: 'profile', redirectUrl: '', active: true,
  profile: { displayName: '', title: '', company: '', bio: '', tagline: '', avatar: '', username: '', displayMode: DEFAULT_DISPLAY_MODE },
  links: [
    { type: 'phone', label: '', value: '' },
    { type: 'email', label: '', value: '' },
  ],
});

function formFromCard(c: StandaloneCardView): FormState {
  const base = emptyForm();
  return {
    nfcId:       c.nfcId,
    label:       c.label ?? '',
    edition:     c.edition,
    mode:        c.redirectUrl ? 'redirect' : 'profile',
    redirectUrl: c.redirectUrl ?? '',
    active:      c.active,
    profile:     c.profile
      ? { displayName: c.profile.displayName, title: c.profile.title, company: c.profile.company,
          bio: c.profile.bio, tagline: c.profile.tagline, avatar: c.profile.avatar,
          username: c.profile.username, displayMode: c.profile.displayMode }
      : base.profile,
    links: c.profile ? c.profile.links : base.links,
  };
}

const nfcUrl = (code: string) => `${APP_URL}/nfc/${code}`;

// Preview link that doesn't count as a visit (?mode= skips scan logging)
const previewHref = (p: { username: string; displayMode: string }) => `/${p.username}?mode=${p.displayMode}`;

function cardTitle(c: StandaloneCardView) {
  return c.profile?.displayName || c.label || 'Carte sans nom';
}

// ── Styles ────────────────────────────────────────────────────────────────────

const panel: React.CSSProperties = {
  background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 8, padding: '20px 24px',
};
const kicker: React.CSSProperties = {
  fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase',
};
const fieldLabel: React.CSSProperties = {
  ...kicker, letterSpacing: 2, color: 'var(--t-text-muted)', display: 'block', marginBottom: 8,
};
const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box', background: 'var(--t-row)',
  border: '1px solid var(--t-border)', borderRadius: 6, padding: '9px 12px',
  color: 'var(--t-text)', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none',
};
const ghostBtn: React.CSSProperties = {
  background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6,
  padding: '8px 14px', color: '#818CF8', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
  fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap',
};
const primaryBtn: React.CSSProperties = {
  padding: '11px 20px', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', border: 'none',
  borderRadius: 6, color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600,
  cursor: 'pointer',
};
const grid2: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14,
};

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label style={fieldLabel}>{label}</label>
      {children}
      {hint && <p style={{ color: 'var(--t-text-muted)', fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      ...kicker, fontSize: 8, letterSpacing: 1, color, background: `${color}1A`,
      border: `1px solid ${color}40`, borderRadius: 3, padding: '2px 6px',
    }}>
      {children}
    </span>
  );
}

function Avatar({ src, name, size }: { src?: string; name: string; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(6,182,212,0.25))',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {src
        ? <Image src={src} alt={name} width={size} height={size} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        : <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: size * 0.4, color: '#818CF8' }}>
            {(name.trim().charAt(0) || '?').toUpperCase()}
          </span>}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StandaloneClient({
  initialCards, stockCodes,
}: { initialCards: StandaloneCardView[]; stockCodes: string[] }) {
  const [cards, setCards]         = useState(initialCards);
  const [editing, setEditing]     = useState<'new' | string | null>(null);
  const [form, setForm]           = useState<FormState>(emptyForm);
  const [saving, setSaving]       = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [saved, setSaved]         = useState<StandaloneCardView | null>(null);
  const [copied, setCopied]       = useState<string | null>(null);

  const isNew = editing === 'new';

  function openNew() {
    setForm(emptyForm()); setEditing('new'); setError(null); setSaved(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openEdit(c: StandaloneCardView) {
    setForm(formFromCard(c)); setEditing(c.id); setError(null); setSaved(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function close() { setEditing(null); setError(null); }

  const setProfile = (patch: Partial<StandaloneProfileInput>) =>
    setForm((f) => ({ ...f, profile: { ...f.profile, ...patch } }));

  const setLink = (i: number, patch: Partial<StandaloneLinkInput>) =>
    setForm((f) => ({ ...f, links: f.links.map((l, j) => (j === i ? { ...l, ...patch } : l)) }));

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied((c) => (c === text ? null : c)), 1500);
  }

  async function uploadAvatar(file: File) {
    setUploading(true); setError(null);
    const fd = new FormData();
    fd.append('file', file);
    const res  = await fetch('/api/upload?folder=avatars', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({})) as { url?: string; error?: string };
    if (res.ok && data.url) setProfile({ avatar: data.url });
    else setError(data.error ?? 'Échec du téléversement de la photo.');
    setUploading(false);
  }

  async function save() {
    setSaving(true); setError(null);
    const payload: StandalonePayload = {
      ...(isNew ? { nfcId: form.nfcId } : { cardId: editing!, active: form.active }),
      label:       form.label,
      edition:     form.edition,
      mode:        form.mode,
      redirectUrl: form.redirectUrl,
      profile:     form.profile,
      links:       form.links,
    };
    const res  = await fetch('/api/admin/standalone-cards', {
      method:  isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({})) as { card?: StandaloneCardView; error?: string };
    setSaving(false);

    if (!res.ok || !data.card) {
      setError(data.error ?? 'Erreur lors de l\'enregistrement.');
      return;
    }
    const card = data.card;
    setCards((prev) => (isNew ? [card, ...prev] : prev.map((c) => (c.id === card.id ? card : c))));
    setSaved(card);
    setEditing(null);
  }

  async function returnToStock() {
    if (!editing || isNew) return;
    if (!confirm('Supprimer le profil de cette carte et la remettre en stock ? Un client pourra ensuite l\'activer sur son compte.')) return;
    setSaving(true); setError(null);
    const res = await fetch(`/api/admin/standalone-cards?cardId=${encodeURIComponent(editing)}`, { method: 'DELETE' });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string };
      setError(data.error ?? 'Erreur.');
      return;
    }
    setCards((prev) => prev.filter((c) => c.id !== editing));
    setEditing(null);
  }

  const canSave = form.mode === 'redirect' ? !!form.redirectUrl.trim() : !!form.profile.displayName.trim();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1100 }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <p style={{ ...kicker, color: '#EF4444', marginBottom: 8 }}>Admin · Cartes sans compte</p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: 'var(--t-text)', marginBottom: 4 }}>
            Cartes sans compte
          </h1>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 14, maxWidth: 560, lineHeight: 1.6 }}>
            Cartes NFC gérées par We Connect, sans compte client. Le profil se crée et se modifie uniquement ici.
          </p>
        </div>
        {editing === null && (
          <button onClick={openNew} style={primaryBtn}>+ Nouvelle carte</button>
        )}
      </div>

      {/* Saved confirmation */}
      {saved && editing === null && (
        <div style={{ ...panel, borderColor: 'rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.06)' }}>
          <p style={{ color: '#10B981', fontSize: 14, fontWeight: 600, marginBottom: 10 }}>
            ✓ Carte « {cardTitle(saved)} » enregistrée
          </p>
          <p style={{ color: 'var(--t-text-sub)', fontSize: 13, marginBottom: 8 }}>
            URL à programmer sur la puce NFC :
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, color: 'var(--t-text)', wordBreak: 'break-all' }}>
              {nfcUrl(saved.nfcId)}
            </code>
            <button onClick={() => copy(nfcUrl(saved.nfcId))} style={ghostBtn}>
              {copied === nfcUrl(saved.nfcId) ? 'Copié ✓' : 'Copier'}
            </button>
            {saved.profile && !saved.redirectUrl && (
              <a href={previewHref(saved.profile)} target="_blank" rel="noreferrer" style={{ ...ghostBtn, textDecoration: 'none' }}>
                Voir le profil ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Editor */}
      {editing !== null && (
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <p style={{ ...kicker, color: '#EF4444' }}>{isNew ? 'Nouvelle carte sans compte' : 'Modifier la carte'}</p>

          {/* Card */}
          <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={grid2}>
              <Field label="Nom interne" hint="Visible seulement dans l'admin.">
                <input style={input} value={form.label} maxLength={60}
                  placeholder="Ex : Josiane — My House Business"
                  onChange={(e) => setForm({ ...form, label: e.target.value })} />
              </Field>

              {isNew ? (
                <Field label="Code NFC" hint="Vide = code généré automatiquement. Tu peux aussi choisir un code du stock.">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input style={{ ...input, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}
                      value={form.nfcId} list="stock-codes" placeholder="Auto (WC-XXXXXX)"
                      onChange={(e) => setForm({ ...form, nfcId: e.target.value.toUpperCase() })} />
                    <datalist id="stock-codes">
                      {stockCodes.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>
                </Field>
              ) : (
                <Field label="Code NFC">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <code style={{ fontFamily: 'Space Mono, monospace', fontSize: 14, color: 'var(--t-text)', letterSpacing: 1 }}>
                      {form.nfcId}
                    </code>
                    <button onClick={() => copy(nfcUrl(form.nfcId))} style={ghostBtn}>
                      {copied === nfcUrl(form.nfcId) ? 'Copié ✓' : 'Copier l\'URL NFC'}
                    </button>
                  </div>
                </Field>
              )}
            </div>

            <div style={grid2}>
              <Field label="Édition / thème">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {STANDALONE_EDITIONS.map((key) => {
                    const meta = EDITION_META[key];
                    const on   = form.edition === key;
                    return (
                      <button key={key} onClick={() => setForm({ ...form, edition: key })} style={{
                        padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                        fontFamily: 'DM Sans, sans-serif',
                        background: on ? `${meta.accent}22` : 'var(--t-row)',
                        border: `1px solid ${on ? `${meta.accent}66` : 'var(--t-border)'}`,
                        color: on ? meta.accent : 'var(--t-text-muted)',
                      }}>
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {!isNew && (
                <Field label="Statut" hint={form.active ? undefined : 'Désactivée : un tap affiche la page « carte perdue ».'}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[{ v: true, l: 'Active', c: '#10B981' }, { v: false, l: 'Désactivée', c: '#EF4444' }].map((s) => {
                      const on = form.active === s.v;
                      return (
                        <button key={s.l} onClick={() => setForm({ ...form, active: s.v })} style={{
                          flex: 1, padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                          fontFamily: 'DM Sans, sans-serif',
                          background: on ? `${s.c}1F` : 'var(--t-row)',
                          border: `1px solid ${on ? `${s.c}66` : 'var(--t-border)'}`,
                          color: on ? s.c : 'var(--t-text-muted)',
                        }}>
                          {s.l}
                        </button>
                      );
                    })}
                  </div>
                </Field>
              )}
            </div>
          </section>

          {/* Tap behaviour */}
          <section>
            <label style={fieldLabel}>Quand on tape la carte</label>
            <div style={grid2}>
              {([
                { v: 'profile',  t: 'Afficher un profil', d: 'Page de contact We Connect avec photo, infos et liens.' },
                { v: 'redirect', t: 'Ouvrir un lien',     d: 'Le téléphone ouvre directement une adresse (site, WhatsApp…).' },
              ] as const).map((m) => {
                const on = form.mode === m.v;
                return (
                  <button key={m.v} onClick={() => setForm({ ...form, mode: m.v })} style={{
                    textAlign: 'left', padding: '12px 14px', borderRadius: 8, cursor: 'pointer',
                    background: on ? 'rgba(99,102,241,0.1)' : 'var(--t-row)',
                    border: `1px solid ${on ? 'rgba(99,102,241,0.45)' : 'var(--t-border)'}`,
                  }}>
                    <span style={{ display: 'block', color: on ? '#818CF8' : 'var(--t-text)', fontSize: 14, fontWeight: 600, fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>
                      {m.t}
                    </span>
                    <span style={{ display: 'block', color: 'var(--t-text-muted)', fontSize: 12, lineHeight: 1.5, fontFamily: 'DM Sans, sans-serif' }}>
                      {m.d}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {form.mode === 'redirect' ? (
            <Field label="Lien à ouvrir *">
              <input style={input} value={form.redirectUrl} placeholder="https://..."
                onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })} />
            </Field>
          ) : (
            <section style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Photo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <Avatar src={form.profile.avatar} name={form.profile.displayName} size={72} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <label style={{ ...ghostBtn, opacity: uploading ? 0.6 : 1 }}>
                    {uploading ? 'Envoi…' : form.profile.avatar ? 'Changer la photo' : 'Ajouter une photo'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={uploading}
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ''; }} />
                  </label>
                  {form.profile.avatar && (
                    <button onClick={() => setProfile({ avatar: '' })} style={{ ...ghostBtn, color: 'var(--t-text-muted)', background: 'transparent', borderColor: 'var(--t-border)' }}>
                      Retirer
                    </button>
                  )}
                </div>
              </div>

              <div style={grid2}>
                <Field label="Nom affiché *">
                  <input style={input} value={form.profile.displayName} maxLength={80}
                    onChange={(e) => setProfile({ displayName: e.target.value })} />
                </Field>
                <Field label="Titre / poste">
                  <input style={input} value={form.profile.title} maxLength={100} placeholder="Directrice"
                    onChange={(e) => setProfile({ title: e.target.value })} />
                </Field>
                <Field label="Entreprise">
                  <input style={input} value={form.profile.company} maxLength={100}
                    onChange={(e) => setProfile({ company: e.target.value })} />
                </Field>
                <Field label="Adresse du profil" hint={form.profile.username ? undefined : 'Vide = générée à partir du nom.'}>
                  <div style={{ display: 'flex', alignItems: 'center', ...input, padding: 0, overflow: 'hidden' }}>
                    <span style={{ padding: '9px 0 9px 12px', color: 'var(--t-text-muted)', fontSize: 13, whiteSpace: 'nowrap' }}>{APP_HOST}/</span>
                    <input style={{ ...input, border: 'none', background: 'transparent', paddingLeft: 2 }}
                      value={form.profile.username} placeholder="auto"
                      onChange={(e) => setProfile({ username: e.target.value.toLowerCase() })} />
                  </div>
                </Field>
              </div>

              <Field label="Affichage du profil">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  {DISPLAY_MODES.map((m) => {
                    const on = form.profile.displayMode === m.value;
                    return (
                      <button key={m.value} onClick={() => setProfile({ displayMode: m.value })} style={{
                        padding: '8px 0', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                        fontFamily: 'DM Sans, sans-serif',
                        background: on ? 'rgba(99,102,241,0.12)' : 'var(--t-row)',
                        border: `1px solid ${on ? 'rgba(99,102,241,0.45)' : 'var(--t-border)'}`,
                        color: on ? '#818CF8' : 'var(--t-text-muted)',
                      }}>
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {form.profile.displayMode === 'light' && (
                <Field label="Accroche" hint="Phrase courte affichée dans une bulle sous le nom.">
                  <input style={input} value={form.profile.tagline} maxLength={120}
                    placeholder="Ex : Innover. Inspirer. Réaliser."
                    onChange={(e) => setProfile({ tagline: e.target.value })} />
                </Field>
              )}

              <Field label="Bio">
                <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} value={form.profile.bio} maxLength={500}
                  onChange={(e) => setProfile({ bio: e.target.value })} />
              </Field>

              {/* Links */}
              <div>
                <label style={fieldLabel}>Liens & contacts</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {form.links.map((l, i) => {
                    const meta = STANDALONE_LINK_TYPES.find((t) => t.value === l.type);
                    return (
                      <div key={i} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <select value={l.type} onChange={(e) => setLink(i, { type: e.target.value })}
                          style={{ ...input, width: 140, flex: '0 0 auto' }}>
                          {STANDALONE_LINK_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        <input style={{ ...input, flex: '2 1 200px', width: 'auto' }} value={l.value}
                          placeholder={meta?.placeholder} onChange={(e) => setLink(i, { value: e.target.value })} />
                        <input style={{ ...input, flex: '1 1 120px', width: 'auto' }} value={l.label} maxLength={60}
                          placeholder={`Libellé (${defaultLinkLabel(l.type)})`} onChange={(e) => setLink(i, { label: e.target.value })} />
                        <button aria-label="Supprimer ce lien" title="Supprimer ce lien"
                          onClick={() => setForm((f) => ({ ...f, links: f.links.filter((_, j) => j !== i) }))}
                          style={{ background: 'none', border: 'none', color: 'var(--t-text-muted)', cursor: 'pointer', fontSize: 16, padding: 6 }}>
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
                {form.links.length < 20 && (
                  <button style={{ ...ghostBtn, marginTop: 10 }}
                    onClick={() => setForm((f) => ({ ...f, links: [...f.links, { type: 'website', label: '', value: '' }] }))}>
                    + Ajouter un lien
                  </button>
                )}
              </div>
            </section>
          )}

          {error && (
            <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 6, padding: '10px 12px' }}>
              {error}
            </p>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <div>
              {!isNew && (
                <button onClick={returnToStock} disabled={saving} style={{
                  ...ghostBtn, color: '#EF4444', background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.25)',
                }}>
                  Remettre en stock
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={close} disabled={saving} style={{ ...ghostBtn, color: 'var(--t-text-sub)', background: 'transparent', borderColor: 'var(--t-border)' }}>
                Annuler
              </button>
              <button onClick={save} disabled={!canSave || saving || uploading} style={{
                ...primaryBtn, opacity: !canSave || saving || uploading ? 0.5 : 1,
                cursor: !canSave || saving ? 'not-allowed' : 'pointer',
              }}>
                {saving ? 'Enregistrement…' : isNew ? 'Créer la carte' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div>
        <p style={{ ...kicker, color: 'var(--t-text-muted)', marginBottom: 14 }}>Cartes ({cards.length})</p>
        {cards.length === 0 ? (
          <div style={{ ...panel, textAlign: 'center', padding: '40px 24px' }}>
            <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>Aucune carte sans compte pour l&apos;instant.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
            {cards.map((c) => {
              const ed       = EDITION_META[c.edition];
              const target   = c.redirectUrl ?? (c.profile ? `${APP_HOST}/${c.profile.username}` : '—');
              const openHref = c.redirectUrl ?? (c.profile ? previewHref(c.profile) : null);
              return (
                <div key={c.id} style={{ ...panel, padding: 18, display: 'flex', flexDirection: 'column', gap: 12, opacity: c.active ? 1 : 0.65 }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <Avatar src={c.redirectUrl ? undefined : c.profile?.avatar} name={cardTitle(c)} size={44} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: 'var(--t-text)', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cardTitle(c)}
                      </p>
                      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: 'var(--t-text-muted)', letterSpacing: 1 }}>
                        {c.nfcId}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Badge color={c.active ? '#10B981' : '#EF4444'}>{c.active ? 'Active' : 'Désactivée'}</Badge>
                    <Badge color="#818CF8">{c.redirectUrl ? 'Lien direct' : 'Profil'}</Badge>
                    <Badge color={ed.accent}>{ed.label}</Badge>
                  </div>

                  <div style={{ fontSize: 12, color: 'var(--t-text-sub)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {c.label && c.profile && c.label !== c.profile.displayName && (
                      <span style={{ color: 'var(--t-text-muted)' }}>{c.label}</span>
                    )}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#818CF8' }}>{target}</span>
                    <span>{c.views} {c.views > 1 ? 'vues' : 'vue'}</span>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                    <button onClick={() => openEdit(c)} style={ghostBtn}>Modifier</button>
                    <button onClick={() => copy(nfcUrl(c.nfcId))} style={ghostBtn}>
                      {copied === nfcUrl(c.nfcId) ? 'Copié ✓' : 'URL NFC'}
                    </button>
                    {openHref && (
                      <a href={openHref} target="_blank" rel="noreferrer" style={{ ...ghostBtn, textDecoration: 'none' }}>Ouvrir ↗</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
