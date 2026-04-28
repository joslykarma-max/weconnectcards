'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const label = (text: string) => (
  <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>{text}</p>
);

const textarea = (value: string, onChange: React.ChangeEventHandler<HTMLTextAreaElement>, placeholder: string) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={2}
    style={{
      width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6, padding: '10px 14px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif',
      fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box',
    }}
  />
);

const select = (value: string, onChange: React.ChangeEventHandler<HTMLSelectElement>, options: string[], placeholder = 'Sélectionner...') => (
  <select value={value} onChange={onChange}
    style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 14px', color: value ? '#F8F9FC' : '#6B7280', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}>
    <option value="" style={{ background: '#181B26' }}>{placeholder}</option>
    {options.map(o => <option key={o} value={o} style={{ background: '#181B26' }}>{o}</option>)}
  </select>
);

export default function MedicalPage() {
  const router = useRouter();
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving]   = useState(false);
  const [saved,  setSaved]    = useState(false);

  const [form, setForm] = useState({
    // Critiques — toujours visibles
    fullName:        '',
    birthDate:       '',
    bloodType:       '',
    allergies:       '',
    emergencyName:   '',
    emergencyRel:    '',
    emergencyPhone:  '',
    // Complémentaires — protégées par PIN
    conditions:      '',
    medications:     '',
    vaccinations:    '',
    doctorName:      '',
    doctorPhone:     '',
    hospital:        '',
    insuranceNumber: '',
    emergency2Name:  '',
    emergency2Rel:   '',
    emergency2Phone: '',
    notes:           '',
    // Paramètres
    organDonor:      '',
    dnr:             '',
    weight:          '',
    height:          '',
    pin:             '',
  });

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
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div style={{ maxWidth: 860, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 4 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🩺 Carte Médicale</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>Informations d&apos;urgence accessibles en un scan</p>
        </div>
      </div>

      {/* Explication sécurité */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 8, padding: '14px 18px', display: 'flex', gap: 14 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>🔐</span>
        <div>
          <p style={{ color: '#818CF8', fontSize: 13, fontWeight: 600, marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Comment fonctionne la protection ?</p>
          <p style={{ color: '#9CA3AF', fontSize: 13, lineHeight: 1.7 }}>
            Les <strong style={{ color: '#F8F9FC' }}>infos critiques</strong> (groupe sanguin, allergies, contact d&apos;urgence) sont <strong style={{ color: '#10B981' }}>toujours visibles</strong> — les secours y accèdent immédiatement. Les <strong style={{ color: '#F8F9FC' }}>infos complémentaires</strong> (médecin, dossier détaillé) peuvent être protégées par un PIN que vous partagez avec vos proches.
          </p>
        </div>
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Section 1 : Critiques */}
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 16 }}>🚨</span>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>Infos critiques</h3>
                <p style={{ color: '#10B981', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>TOUJOURS VISIBLES · Sans code</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom complet" placeholder="Gilles Amoussou" value={form.fullName} onChange={set('fullName')} />
              <Input label="Date de naissance" type="date" value={form.birthDate} onChange={set('birthDate')} />
              <div>
                {label('Groupe sanguin')}
                {select(form.bloodType, set('bloodType') as React.ChangeEventHandler<HTMLSelectElement>, ['A+','A-','B+','B-','AB+','AB-','O+','O-'])}
              </div>
              <div>
                {label('Allergies connues')}
                {textarea(form.allergies, set('allergies') as React.ChangeEventHandler<HTMLTextAreaElement>, 'Pénicilline, arachides, latex...')}
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14, marginTop: 4 }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: '#F8F9FC', marginBottom: 12 }}>Contact d&apos;urgence principal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input label="Nom" placeholder="Carine Hounkpatin" value={form.emergencyName} onChange={set('emergencyName')} />
                  <Input label="Relation" placeholder="Épouse, parent, ami..." value={form.emergencyRel} onChange={set('emergencyRel')} />
                  <Input label="Téléphone" placeholder="+229 97 00 00 00" value={form.emergencyPhone} onChange={set('emergencyPhone')} />
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2 : Complémentaires */}
          <Card padding="md">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>Infos complémentaires</h3>
                <p style={{ color: '#9CA3AF', fontSize: 11, fontFamily: 'Space Mono, monospace', letterSpacing: 1 }}>Protégées par PIN si défini</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                {label('Conditions médicales chroniques')}
                {textarea(form.conditions, set('conditions') as React.ChangeEventHandler<HTMLTextAreaElement>, 'Diabète type 2, hypertension, asthme...')}
              </div>
              <div>
                {label('Médicaments en cours')}
                {textarea(form.medications, set('medications') as React.ChangeEventHandler<HTMLTextAreaElement>, 'Metformine 500mg matin, Doliprane si douleur...')}
              </div>
              <div>
                {label('Vaccinations')}
                {textarea(form.vaccinations, set('vaccinations') as React.ChangeEventHandler<HTMLTextAreaElement>, 'Tétanos 2022, Covid vaccin...')}
              </div>
              <Input label="Médecin traitant" placeholder="Dr. Agbossou Sylvain" value={form.doctorName} onChange={set('doctorName')} />
              <Input label="Téléphone médecin" placeholder="+229 97 00 00 00" value={form.doctorPhone} onChange={set('doctorPhone')} />
              <Input label="Hôpital de référence" placeholder="CNHU-HKM de Cotonou" value={form.hospital} onChange={set('hospital')} />
              <Input label="N° assuré / Assurance" placeholder="123456789 — RAMU" value={form.insuranceNumber} onChange={set('insuranceNumber')} />

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14, marginTop: 4 }}>
                <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, color: '#F8F9FC', marginBottom: 12 }}>2ème contact d&apos;urgence</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Input label="Nom" placeholder="Didier Adjovi" value={form.emergency2Name} onChange={set('emergency2Name')} />
                  <Input label="Relation" placeholder="Frère, collègue..." value={form.emergency2Rel} onChange={set('emergency2Rel')} />
                  <Input label="Téléphone" placeholder="+229 96 00 00 00" value={form.emergency2Phone} onChange={set('emergency2Phone')} />
                </div>
              </div>
              <div>
                {label('Notes complémentaires')}
                {textarea(form.notes, set('notes') as React.ChangeEventHandler<HTMLTextAreaElement>, 'Informations utiles pour les soignants...')}
              </div>
            </div>
          </Card>

          {/* Section 3 : Paramètres */}
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>⚙️ Paramètres</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Input label="Poids (kg)" placeholder="75" value={form.weight} onChange={set('weight')} />
                <Input label="Taille (cm)" placeholder="175" value={form.height} onChange={set('height')} />
              </div>
              <div>
                {label('Donneur d\'organes')}
                {select(form.organDonor, set('organDonor') as React.ChangeEventHandler<HTMLSelectElement>, ['Oui', 'Non', 'Non renseigné'])}
              </div>
              <div>
                {label('Instruction DNR (Ne pas réanimer)')}
                {select(form.dnr, set('dnr') as React.ChangeEventHandler<HTMLSelectElement>, ['Non (réanimer normalement)', 'Oui (ne pas réanimer)'], 'Non renseigné')}
              </div>

              {/* PIN avec show/hide */}
              <div>
                {label('Code PIN de protection (optionnel)')}
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={form.pin}
                    onChange={set('pin')}
                    placeholder="Laissez vide = tout visible"
                    maxLength={8}
                    style={{
                      width: '100%', background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6,
                      padding: '10px 44px 10px 14px', color: '#F8F9FC',
                      fontFamily: 'Space Mono, monospace', fontSize: 16,
                      letterSpacing: 4, outline: 'none', boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(v => !v)}
                    style={{
                      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', padding: 4,
                    }}
                  >
                    {showPin ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                <p style={{ color: '#6B7280', fontSize: 11, marginTop: 6, fontFamily: 'DM Sans, sans-serif' }}>
                  Si défini, les infos complémentaires sont cachées derrière ce code. Partagez-le avec vos proches uniquement.
                </p>
              </div>
            </div>
          </Card>

          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder la carte médicale'}
          </Button>
        </div>

        {/* Aperçu */}
        <div style={{ position: 'sticky', top: 24 }}>
          <Card padding="md">
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase', marginBottom: 16 }}>Aperçu</p>

            {/* Toujours visible */}
            <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: 16, marginBottom: 12 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#EF4444', textTransform: 'uppercase', marginBottom: 12 }}>🚨 Urgence — Toujours visible</p>
              {form.fullName && <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', marginBottom: 8 }}>{form.fullName}</p>}
              {form.birthDate && <p style={{ color: '#9CA3AF', fontSize: 12, marginBottom: 8 }}>Né(e) le {new Date(form.birthDate).toLocaleDateString('fr-FR')}</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.bloodType && (
                  <span style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 10px', color: '#EF4444', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 14 }}>
                    🩸 {form.bloodType}
                  </span>
                )}
                {form.organDonor === 'Oui' && (
                  <span style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '4px 10px', color: '#10B981', fontSize: 11 }}>
                    Don d'organes ✓
                  </span>
                )}
              </div>
              {form.allergies && (
                <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '8px 10px', marginBottom: 8 }}>
                  <p style={{ color: '#F59E0B', fontSize: 10, fontFamily: 'Space Mono, monospace', marginBottom: 2 }}>ALLERGIES</p>
                  <p style={{ color: '#F8F9FC', fontSize: 12 }}>{form.allergies}</p>
                </div>
              )}
              {form.emergencyName && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 4 }}>
                  <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace', marginBottom: 4 }}>URGENCE</p>
                  <p style={{ color: '#F8F9FC', fontSize: 13, fontWeight: 600 }}>{form.emergencyName} {form.emergencyRel && `(${form.emergencyRel})`}</p>
                  {form.emergencyPhone && <p style={{ color: '#818CF8', fontSize: 13 }}>{form.emergencyPhone}</p>}
                </div>
              )}
            </div>

            {/* PIN section */}
            <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 16 }}>
              <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 8, letterSpacing: 3, color: '#818CF8', textTransform: 'uppercase', marginBottom: 8 }}>
                🔒 {form.pin ? `Protégé par PIN · ${form.pin.length} chiffre${form.pin.length > 1 ? 's' : ''}` : 'Infos complémentaires — Visible (pas de PIN)'}
              </p>
              {form.conditions && <p style={{ color: '#9CA3AF', fontSize: 12 }}>🏥 {form.conditions}</p>}
              {form.medications && <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>💊 {form.medications}</p>}
              {form.doctorName && <p style={{ color: '#9CA3AF', fontSize: 12, marginTop: 4 }}>👨‍⚕️ {form.doctorName}</p>}
              {!form.conditions && !form.medications && !form.doctorName && (
                <p style={{ color: '#4B5563', fontSize: 12, fontStyle: 'italic' }}>Renseignez les infos complémentaires</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
