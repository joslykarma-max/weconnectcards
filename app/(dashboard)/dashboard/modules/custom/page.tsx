'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:     { label: 'En attente',   color: '#F59E0B' },
  in_review:   { label: 'En analyse',   color: '#6366F1' },
  quoted:      { label: 'Devis envoyé', color: '#06B6D4' },
  in_progress: { label: 'En cours',     color: '#8B5CF6' },
  delivered:   { label: 'Livré',        color: '#10B981' },
  rejected:    { label: 'Refusé',       color: '#EF4444' },
};

const BUDGET_OPTIONS = [
  'Moins de 50 000 FCFA',
  '50 000 – 100 000 FCFA',
  '100 000 – 250 000 FCFA',
  'Plus de 250 000 FCFA',
  'À discuter',
];

const TIMELINE_OPTIONS = [
  'Urgent (< 1 semaine)',
  '2 – 4 semaines',
  '1 – 2 mois',
  'Pas de contrainte',
];

type Request = {
  id: string;
  moduleName: string;
  status: string;
  createdAt: string;
  adminNote?: string;
};

const input: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 6, padding: '10px 14px',
  color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14,
  outline: 'none',
};
const lbl: React.CSSProperties = {
  fontFamily: 'Space Mono, monospace', fontSize: 9,
  letterSpacing: 2, color: '#6B7280',
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
};

export default function CustomModulePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    moduleName:  '',
    description: '',
    useCase:     '',
    budget:      '',
    timeline:    '',
  });
  const [saving,    setSaving]    = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [requests,  setRequests]  = useState<Request[] | null>(null);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((p) => ({ ...p, [k]: e.target.value }));

  async function submit() {
    if (!form.moduleName.trim() || !form.description.trim() || !form.useCase.trim()) {
      setError('Merci de remplir les champs obligatoires (*).');
      return;
    }
    setError('');
    setSaving(true);
    const res = await fetch('/api/modules/custom', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      setSubmitted(true);
      setForm({ moduleName: '', description: '', useCase: '', budget: '', timeline: '' });
    } else {
      const data = await res.json() as { error?: string };
      setError(data.error ?? 'Erreur lors de l\'envoi.');
    }
  }

  async function loadRequests() {
    setLoadingReqs(true);
    const res  = await fetch('/api/modules/custom');
    const data = await res.json() as Request[];
    setRequests(data);
    setLoadingReqs(false);
  }

  return (
    <div style={{ maxWidth: 700, display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC', margin: 0 }}>
            ✦ Module sur mesure
          </h2>
          <p style={{ color: '#6B7280', fontSize: 13, margin: 0 }}>
            Décrivez votre besoin — notre équipe vous revient avec un devis sous 48h.
          </p>
        </div>
      </div>

      {submitted ? (
        <Card padding="md">
          <div style={{ textAlign: 'center', padding: '32px 0' }}>
            <p style={{ fontSize: 48, marginBottom: 12 }}>✅</p>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F8F9FC', marginBottom: 8 }}>
              Demande envoyée !
            </h3>
            <p style={{ color: '#9CA3AF', fontSize: 14, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              Notre équipe analyse votre besoin et vous contacte sous 48h avec un devis personnalisé.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="ghost" size="sm" onClick={() => setSubmitted(false)}>
                Nouvelle demande
              </Button>
              <Button variant="gradient" size="sm" onClick={loadRequests}>
                Voir mes demandes
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
            Décrivez votre module
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            <div>
              <label style={lbl}>Nom du module *</label>
              <input style={input} placeholder="Ex: Catalogue produits, Prise de rendez-vous..."
                value={form.moduleName} onChange={set('moduleName')} />
            </div>

            <div>
              <label style={lbl}>Description du besoin *</label>
              <textarea rows={4} style={{ ...input, resize: 'vertical' }}
                placeholder="Expliquez ce que le module doit faire, quelles informations afficher, quelles actions permettre..."
                value={form.description} onChange={set('description')} />
            </div>

            <div>
              <label style={lbl}>Cas d'usage concret *</label>
              <textarea rows={3} style={{ ...input, resize: 'vertical' }}
                placeholder="Ex: Je suis coiffeuse, je veux que mes clients puissent réserver un créneau directement depuis ma carte NFC..."
                value={form.useCase} onChange={set('useCase')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={lbl}>Budget estimé</label>
                <select style={{ ...input, cursor: 'pointer' }} value={form.budget} onChange={set('budget')}>
                  <option value="">Sélectionner…</option>
                  {BUDGET_OPTIONS.map((o) => (
                    <option key={o} value={o} style={{ background: '#181B26' }}>{o}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Délai souhaité</label>
                <select style={{ ...input, cursor: 'pointer' }} value={form.timeline} onChange={set('timeline')}>
                  <option value="">Sélectionner…</option>
                  {TIMELINE_OPTIONS.map((o) => (
                    <option key={o} value={o} style={{ background: '#181B26' }}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.07)', borderRadius: 6, padding: '10px 12px' }}>
                {error}
              </p>
            )}

            <Button variant="gradient" size="lg" loading={saving} onClick={submit} style={{ width: '100%' }}>
              Envoyer ma demande →
            </Button>
          </div>
        </Card>
      )}

      {/* Info card */}
      <Card padding="md">
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14, color: '#F8F9FC', marginBottom: 14 }}>
          Comment ça marche ?
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { step: '1', title: 'Tu décris ton besoin', desc: 'Remplis le formulaire ci-dessus avec le maximum de détails.' },
            { step: '2', title: 'Notre équipe analyse', desc: 'Sous 48h, nous étudions la faisabilité et estimons le coût.' },
            { step: '3', title: 'Devis & validation', desc: 'Tu reçois un devis par email. Si tu acceptes, on commence.' },
            { step: '4', title: 'Livraison & intégration', desc: 'Le module est développé et intégré directement à ton profil.' },
          ].map((s) => (
            <div key={s.step} style={{ display: 'flex', gap: 12 }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'linear-gradient(135deg, #4338CA, #6366F1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#fff',
                flexShrink: 0, marginTop: 1,
              }}>{s.step}</div>
              <div>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#F8F9FC', fontWeight: 600, marginBottom: 2 }}>{s.title}</p>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#6B7280' }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* My requests */}
      {requests === null ? (
        <button onClick={loadRequests} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6366F1', fontFamily: 'Space Mono, monospace',
          fontSize: 10, letterSpacing: 2, textTransform: 'uppercase',
          textAlign: 'left',
        }}>
          {loadingReqs ? 'Chargement…' : '↓ Voir mes demandes précédentes'}
        </button>
      ) : (
        <Card padding="md">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 16 }}>
            Mes demandes
          </h3>
          {requests.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: 13 }}>Aucune demande pour l'instant.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {requests.map((r) => {
                const st = STATUS_LABELS[r.status] ?? STATUS_LABELS['pending'];
                return (
                  <div key={r.id} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 8, padding: '14px 16px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: r.adminNote ? 8 : 0 }}>
                      <div>
                        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#F8F9FC', fontWeight: 600 }}>
                          {r.moduleName}
                        </p>
                        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563', marginTop: 2 }}>
                          {new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <span style={{
                        fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1,
                        textTransform: 'uppercase', color: st.color,
                        background: `${st.color}15`, border: `1px solid ${st.color}30`,
                        borderRadius: 4, padding: '3px 8px',
                      }}>
                        {st.label}
                      </span>
                    </div>
                    {r.adminNote && (
                      <p style={{
                        fontSize: 12, color: '#9CA3AF', fontFamily: 'DM Sans, sans-serif',
                        background: 'rgba(255,255,255,0.03)', borderRadius: 4, padding: '8px 10px', marginTop: 8,
                      }}>
                        💬 {r.adminNote}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
