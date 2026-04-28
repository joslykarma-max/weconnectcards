'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', company: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError('Une erreur est survenue. Écrivez-nous directement à contact@weconnect.cards');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#08090C', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 16px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6B7280', fontSize: 13, textDecoration: 'none', marginBottom: 40, fontFamily: 'DM Sans, sans-serif' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Retour à l'accueil
        </Link>

        <div style={{ marginBottom: 40 }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 16 }}>
            Contact
          </p>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#F8F9FC', letterSpacing: '-1px', marginBottom: 12 }}>
            Parlons de votre équipe.
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 1.6 }}>
            Vous cherchez une solution pour toute votre équipe ? Remplissez le formulaire, on vous répond sous 24h.
          </p>
        </div>

        {sent ? (
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: 40, textAlign: 'center' }}>
            <span style={{ fontSize: 48, display: 'block', marginBottom: 16 }}>✅</span>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 22, color: '#10B981', marginBottom: 8 }}>
              Message envoyé !
            </h2>
            <p style={{ color: '#9CA3AF', fontSize: 15 }}>
              Nous vous répondrons dans les 24 heures.
            </p>
          </div>
        ) : (
          <div style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 40 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Nom *</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Sophie Martin"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Entreprise</label>
                  <input
                    value={form.company}
                    onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                    placeholder="Acme Corp"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Email professionnel *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="sophie@acme.com"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: '#9CA3AF', marginBottom: 8 }}>Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  placeholder="Combien de personnes dans votre équipe ? Quels sont vos besoins ?"
                  rows={5}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              {error && (
                <p style={{ color: '#EF4444', fontSize: 13, background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 6, border: '1px solid rgba(239,68,68,0.2)' }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                style={{
                  padding: '14px 24px',
                  background: sending ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #4338CA, #6366F1)',
                  border: 'none',
                  borderRadius: 8,
                  color: '#fff',
                  fontFamily: 'Syne, sans-serif',
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: sending ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {sending ? 'Envoi...' : 'Envoyer le message →'}
              </button>
            </form>

            <div style={{ marginTop: 28, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 24, justifyContent: 'center' }}>
              <a href="mailto:contact@weconnect.cards" style={{ color: '#818CF8', fontSize: 13, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}>
                📧 contact@weconnect.cards
              </a>
              <a href="https://wa.me/22900000000" target="_blank" rel="noopener noreferrer" style={{ color: '#10B981', fontSize: 13, fontFamily: 'DM Sans, sans-serif', textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
