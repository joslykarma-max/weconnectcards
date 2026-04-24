'use client';

import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useState } from 'react';

interface User { email: string | null; name: string | null; createdAt: Date | null }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _Subscription = { plan: string; status: string } | null;

interface Props {
  user: User | null;
  subscription: { plan: string; status: string } | null;
}

export default function SettingsClient({ user, subscription }: Props) {
  const [name, setName] = useState(user?.name ?? '');

  const planColors: Record<string, 'electric' | 'cyan' | 'neutral'> = {
    essentiel: 'neutral',
    pro:       'electric',
    equipe:    'cyan',
  };

  return (
    <div style={{ maxWidth: 640, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Account */}
      <Card padding="md">
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 20 }}>
          Mon compte
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email" value={user?.email ?? ''} disabled hint="L'email ne peut pas être modifié." />
          <Button variant="secondary" size="sm" style={{ alignSelf: 'flex-start' }}>
            Sauvegarder
          </Button>
        </div>
      </Card>

      {/* Plan */}
      <Card padding="md">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC' }}>
            Mon abonnement
          </h3>
          <Badge variant={planColors[subscription?.plan ?? 'essentiel'] ?? 'neutral'}>
            {(subscription?.plan ?? 'essentiel').toUpperCase()}
          </Badge>
        </div>

        <p style={{ color: '#9CA3AF', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
          {subscription?.plan === 'essentiel' && 'Passez au plan Pro pour accéder à tous les modules, analytics illimités et domaine personnalisé.'}
          {subscription?.plan === 'pro'       && 'Vous bénéficiez de toutes les fonctionnalités Pro. Merci de votre confiance !'}
          {subscription?.plan === 'equipe'    && 'Vous êtes sur le plan Équipe. Contactez-nous pour toute modification.'}
        </p>

        {subscription?.plan === 'essentiel' && (
          <Button variant="gradient" size="md">
            Passer au plan Pro — 20 000 FCFA + 2 000 FCFA/mois
          </Button>
        )}
      </Card>

      {/* Danger zone */}
      <Card padding="md">
        <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#EF4444', marginBottom: 16 }}>
          Zone dangereuse
        </h3>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 20 }}>
          La suppression de votre compte est irréversible. Toutes vos données seront effacées.
        </p>
        <Button variant="danger" size="sm">
          Supprimer mon compte
        </Button>
      </Card>
    </div>
  );
}
