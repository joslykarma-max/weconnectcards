'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function MedicalPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName:       '',
    bloodType:      '',
    allergies:      '',
    conditions:     '',
    medications:    '',
    emergencyName:  '',
    emergencyPhone: '',
    emergencyRel:   '',
    pin:            '',
    doctorName:     '',
    doctorPhone:    '',
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ type: 'medical', config: form }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🩺 Carte Médicale</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Informations d&apos;urgence sécurisées par PIN</p>
        </div>
      </div>

      <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '12px 16px' }}>
        <p style={{ color: '#EF4444', fontSize: 13 }}>⚠️ Ces informations seront accessibles en cas d&apos;urgence médicale. Vérifiez leur exactitude.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Informations médicales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom complet" placeholder="Kofi Mensah" value={form.fullName} onChange={set('fullName')} />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Groupe sanguin</p>
                <select value={form.bloodType} onChange={set('bloodType')}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}>
                  <option value="" style={{ background: '#181B26' }}>Sélectionner...</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => (
                    <option key={t} value={t} style={{ background: '#181B26' }}>{t}</option>
                  ))}
                </select>
              </div>
              <Input label="Allergies" placeholder="Pénicilline, arachides..." value={form.allergies} onChange={set('allergies')} hint="Séparez par des virgules" />
              <Input label="Conditions médicales" placeholder="Diabète type 2, asthme..." value={form.conditions} onChange={set('conditions')} />
              <Input label="Médicaments en cours" placeholder="Metformine 500mg..." value={form.medications} onChange={set('medications')} />
            </div>
          </Card>

          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Contact d&apos;urgence</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom" placeholder="Marie Mensah" value={form.emergencyName} onChange={set('emergencyName')} />
              <Input label="Téléphone" placeholder="+225 07 00 00 00 00" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
              <Input label="Relation" placeholder="Épouse, parent..." value={form.emergencyRel} onChange={set('emergencyRel')} />
              <Input label="Médecin traitant" placeholder="Dr. Kouassi" value={form.doctorName} onChange={set('doctorName')} />
              <Input label="Téléphone médecin" placeholder="+225 07 00 00 00 00" value={form.doctorPhone} onChange={set('doctorPhone')} />
              <Input label="Code PIN de protection" type="password" placeholder="••••" value={form.pin} onChange={set('pin')} hint="Protège l'accès aux données sensibles" />
            </div>
          </Card>

          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        <Card padding="md">
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu carte médicale</p>
          <div style={{ background: 'linear-gradient(135deg, #1a0000, #2d0000)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#EF4444', textTransform: 'uppercase' }}>⚕️ Urgence Médicale</span>
              <span style={{ fontSize: 20 }}>🩺</span>
            </div>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', marginBottom: 14 }}>
              {form.fullName || 'Nom complet'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {form.bloodType && (
                <div style={{ background: 'rgba(239,68,68,0.15)', borderRadius: 6, padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#9CA3AF', fontSize: 12 }}>Groupe sanguin</span>
                  <span style={{ color: '#EF4444', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{form.bloodType}</span>
                </div>
              )}
              {form.allergies && (
                <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 6, padding: '8px 12px' }}>
                  <p style={{ color: '#F59E0B', fontSize: 11, marginBottom: 2 }}>ALLERGIES</p>
                  <p style={{ color: '#9CA3AF', fontSize: 12 }}>{form.allergies}</p>
                </div>
              )}
              {form.emergencyName && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 10, marginTop: 4 }}>
                  <p style={{ color: '#6B7280', fontSize: 11, marginBottom: 4 }}>URGENCE</p>
                  <p style={{ color: '#F8F9FC', fontSize: 13 }}>{form.emergencyName} {form.emergencyRel && `(${form.emergencyRel})`}</p>
                  {form.emergencyPhone && <p style={{ color: '#818CF8', fontSize: 13 }}>{form.emergencyPhone}</p>}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
