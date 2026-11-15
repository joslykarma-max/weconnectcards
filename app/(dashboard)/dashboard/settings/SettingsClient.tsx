'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface User { email: string | null; name: string | null; createdAt: Date | null }

interface Props {
  user: User | null;
  subscription: { plan: string; status: string } | null;
}

function PaymentBanner() {
  const params  = useSearchParams();
  const payment = params.get('payment');
  if (!payment) return null;
  const isSuccess = payment === 'success';
  const isPending = payment === 'pending';
  if (isPending) {
    return (
      <div style={{ padding: '14px 20px', borderRadius: 8, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#B45309', fontFamily: 'DM Sans, sans-serif', fontSize: 14, marginBottom: 8 }}>
        ⏳ Paiement en cours de confirmation. Votre compte sera mis à jour automatiquement dans quelques minutes.
      </div>
    );
  }
  return (
    <div style={{
      padding: '14px 20px',
      borderRadius: 8,
      background: isSuccess ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
      border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
      color: isSuccess ? '#10B981' : '#EF4444',
      fontFamily: 'DM Sans, sans-serif',
      fontSize: 14,
      marginBottom: 8,
    }}>
      {isSuccess
        ? '✅ Paiement réussi ! Votre compte a été mis à jour.'
        : '❌ Paiement annulé ou échoué. Réessayez.'}
    </div>
  );
}

export default function SettingsClient({ user, subscription }: Props) {
  const router = useRouter();
  const [name, setName]           = useState(user?.name ?? '');
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [nameError, setNameError] = useState('');

  const planColors: Record<string, 'electric' | 'cyan' | 'neutral'> = {
    essentiel: 'neutral',
    pro:       'electric',
    equipe:    'cyan',
  };

  async function saveName() {
    if (!name.trim()) { setNameError('Le nom ne peut pas être vide.'); return; }
    setNameError('');
    setSaving(true);
    try {
      await fetch('/api/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ displayName: name.trim() }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  async function deleteAccount() {
    const confirmed = window.confirm(
      'Supprimer votre compte ? Cette action est irréversible et effacera toutes vos données.'
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) throw new Error();
      await fetch('/api/auth/session', { method: 'DELETE' });
      router.push('/');
    } catch {
      alert('Erreur lors de la suppression. Contactez le support.');
      setDeleting(false);
    }
  }

  async function upgradePlan() {
    setUpgrading(true);
    try {
      const res = await fetch('/api/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ plan: 'account_upgrade' }),
      });
      const data = await res.json() as { payment_url?: string; error?: string };
      if (data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        alert(data.error ?? 'Erreur lors du paiement.');
        setUpgrading(false);
      }
    } catch {
      alert('Erreur lors du paiement. Réessayez.');
      setUpgrading(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Suspense>
        <PaymentBanner />
      </Suspense>

      {/* Account */}
      <Card padding="md">
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--t-text)', marginBottom: 12 }}>
          Mon compte
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Input
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            hint={nameError}
          />
          <Input label="Email" value={user?.email ?? ''} disabled hint="L'email ne peut pas être modifié." />
          <Button
            variant="secondary"
            size="sm"
            loading={saving}
            onClick={saveName}
            style={{ alignSelf: 'flex-start' }}
          >
            {saved ? '✓ Sauvegardé' : 'Sauvegarder'}
          </Button>
        </div>
      </Card>

      {/* Plan */}
      <Card padding="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--t-text)' }}>
            Mon abonnement
          </h3>
          <Badge variant={planColors[subscription?.plan ?? 'essentiel'] ?? 'neutral'}>
            {(subscription?.plan ?? 'essentiel').toUpperCase()}
          </Badge>
        </div>

        <p style={{ color: 'var(--t-text-sub)', fontSize: 14, lineHeight: 1.6, marginBottom: 12 }}>
          {subscription?.plan === 'essentiel' && 'Passez au plan Pro pour accéder à tous les modules, analytics illimités et domaine personnalisé.'}
          {subscription?.plan === 'pro'       && 'Vous bénéficiez de toutes les fonctionnalités Pro. Merci de votre confiance !'}
          {subscription?.plan === 'equipe'    && 'Vous êtes sur le plan Équipe. Contactez-nous pour toute modification.'}
        </p>

        {subscription?.plan === 'essentiel' && (
          <Button variant="gradient" size="md" loading={upgrading} onClick={upgradePlan}>
            {upgrading ? 'Redirection...' : 'Passer au plan Pro — 5 500 FCFA'}
          </Button>
        )}
      </Card>

      {/* Danger zone */}
      <Card padding="md">
        <h3 style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 16, color: '#DC2626', marginBottom: 8 }}>
          Zone dangereuse
        </h3>
        <p style={{ color: 'var(--t-text-muted)', fontSize: 13.5, marginBottom: 12 }}>
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <Button variant="danger" size="sm" loading={deleting} onClick={deleteAccount}>
          {deleting ? 'Suppression...' : 'Supprimer mon compte'}
        </Button>
      </Card>
    </div>
  );
}
