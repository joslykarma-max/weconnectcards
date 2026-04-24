import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function TeamPage() {
  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{
        background: '#12141C',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: 8,
        padding: 48,
        textAlign: 'center',
      }}>
        <Badge variant="electric" className="mb-6">PRO requis</Badge>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 28, color: '#F8F9FC', marginBottom: 16, marginTop: 16 }}>
          Mode Équipe
        </h2>
        <p style={{ color: '#9CA3AF', fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
          Gérez plusieurs membres de votre équipe depuis un dashboard centralisé.
          Branding unifié, facturation groupée, analytics par membre.
        </p>
        <Link href="/dashboard/settings?upgrade=equipe">
          <Button variant="gradient" size="lg">
            Passer au plan Équipe
          </Button>
        </Link>
      </div>
    </div>
  );
}
