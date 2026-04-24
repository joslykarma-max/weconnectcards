'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function PortfolioPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    artistName:   '',
    discipline:   '',
    bio:          '',
    instagramUrl: '',
    spotifyUrl:   '',
    youtubeUrl:   '',
    soundcloudUrl:'',
    websiteUrl:   '',
    bookingEmail: '',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'portfolio', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const links = [
    { key: 'instagramUrl',  icon: '📸', label: 'Instagram', color: '#E1306C' },
    { key: 'spotifyUrl',    icon: '🎵', label: 'Spotify',   color: '#1DB954' },
    { key: 'youtubeUrl',    icon: '▶️', label: 'YouTube',   color: '#FF0000' },
    { key: 'soundcloudUrl', icon: '☁️', label: 'SoundCloud',color: '#FF5500' },
    { key: 'websiteUrl',    icon: '🌐', label: 'Site web',  color: '#818CF8' },
  ].filter(l => form[l.key as keyof typeof form]);

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🎵 Portfolio Artiste</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Galerie média, streaming et booking en un tap</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Profil artiste</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom d'artiste" placeholder="DJ Koffi / Ama Art" value={form.artistName} onChange={set('artistName')} />
              <Input label="Discipline" placeholder="Musique, Peinture, Photo..." value={form.discipline} onChange={set('discipline')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Bio / Présentation</p>
                <textarea value={form.bio} onChange={set('bio')} rows={3}
                  placeholder="Artiste basé à Abidjan, spécialisé en..."
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <Input label="Email booking" placeholder="booking@artiste.com" value={form.bookingEmail} onChange={set('bookingEmail')} />
            </div>
          </Card>

          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Liens & plateformes</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Input label="📸 Instagram" placeholder="https://instagram.com/..." value={form.instagramUrl} onChange={set('instagramUrl')} />
              <Input label="🎵 Spotify" placeholder="https://open.spotify.com/..." value={form.spotifyUrl} onChange={set('spotifyUrl')} />
              <Input label="▶️ YouTube" placeholder="https://youtube.com/..." value={form.youtubeUrl} onChange={set('youtubeUrl')} />
              <Input label="☁️ SoundCloud" placeholder="https://soundcloud.com/..." value={form.soundcloudUrl} onChange={set('soundcloudUrl')} />
              <Input label="🌐 Site web" placeholder="https://..." value={form.websiteUrl} onChange={set('websiteUrl')} />
            </div>
          </Card>

          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu page artiste</p>
          <div style={{ background: 'linear-gradient(180deg, #0D0E14, #181B26)', borderRadius: 12, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #6366F1, #06B6D4)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
              🎵
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', marginBottom: 4 }}>
              {form.artistName || 'Nom d\'artiste'}
            </p>
            {form.discipline && <p style={{ color: '#818CF8', fontSize: 13, marginBottom: 8 }}>{form.discipline}</p>}
            {form.bio && <p style={{ color: '#6B7280', fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>{form.bio.substring(0, 80)}{form.bio.length > 80 ? '...' : ''}</p>}
            {links.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {links.map(l => (
                  <div key={l.key} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span>{l.icon}</span>
                    <span style={{ color: '#F8F9FC', fontSize: 13 }}>{l.label}</span>
                  </div>
                ))}
              </div>
            )}
            {form.bookingEmail && (
              <div style={{ marginTop: 14, padding: '10px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8 }}>
                <p style={{ color: '#818CF8', fontSize: 12 }}>📩 Booking : {form.bookingEmail}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
