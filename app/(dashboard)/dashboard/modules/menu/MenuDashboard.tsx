'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { MenuItem, MenuCategory } from '@/lib/types';

type Info = {
  restaurantName: string;
  address:        string;
  openHours:      string;
  whatsapp:       string;
  currency:       string;
  menuUrl:        string;
};

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

const FOOD_EMOJIS = ['🍽️','🥗','🍗','🍔','🍕','🐟','🍜','🥘','🥩','🍱','🌮','🥙','🧆','🍤','🥚','🥤','🍺','🍷','☕','🍰','🧁','🍦','🍫','🧃','🫕'];
const CAT_EMOJIS  = ['🥗','🍗','🍔','🐟','🥤','🍰','🌮','🥙','🍕','🥩','☕','🍺','🍜','🥘','🧁'];

export default function MenuDashboard({
  initialInfo,
  initialCategories,
}: {
  initialInfo:       Info;
  initialCategories: MenuCategory[];
}) {
  const router = useRouter();
  const [info, setInfo]             = useState<Info>(initialInfo);
  const [categories, setCategories] = useState<MenuCategory[]>(initialCategories);
  const [saving, setSaving]         = useState(false);
  const [saved,  setSaved]          = useState(false);

  const [openCatIds,    setOpenCatIds]    = useState<Set<string>>(new Set(initialCategories.map(c => c.id)));
  const [addingCat,     setAddingCat]     = useState(false);
  const [newCatName,    setNewCatName]    = useState('');
  const [newCatEmoji,   setNewCatEmoji]   = useState('🍽️');
  const [addingItemTo,  setAddingItemTo]  = useState<string | null>(null);
  const [newItem,       setNewItem]       = useState({ emoji: '🍽️', name: '', description: '', price: '' });

  const setInfoField = (k: keyof Info) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInfo(p => ({ ...p, [k]: e.target.value }));

  function toggleCat(id: string) {
    setOpenCatIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function addCategory() {
    if (!newCatName.trim()) return;
    const cat: MenuCategory = { id: uid(), name: newCatName.trim(), emoji: newCatEmoji, items: [] };
    setCategories(p => [...p, cat]);
    setOpenCatIds(prev => new Set([...prev, cat.id]));
    setNewCatName('');
    setAddingCat(false);
  }

  function removeCategory(catId: string) {
    setCategories(p => p.filter(c => c.id !== catId));
    setOpenCatIds(prev => { const next = new Set(prev); next.delete(catId); return next; });
  }

  function addItem(catId: string) {
    if (!newItem.name.trim()) return;
    const item: MenuItem = {
      id:          uid(),
      name:        newItem.name.trim(),
      description: newItem.description.trim(),
      price:       Number(newItem.price) || 0,
      emoji:       newItem.emoji,
      available:   true,
    };
    setCategories(p => p.map(c => c.id === catId ? { ...c, items: [...c.items, item] } : c));
    setNewItem({ emoji: '🍽️', name: '', description: '', price: '' });
    setAddingItemTo(null);
  }

  function removeItem(catId: string, itemId: string) {
    setCategories(p => p.map(c => c.id === catId ? { ...c, items: c.items.filter(i => i.id !== itemId) } : c));
  }

  function toggleAvailable(catId: string, itemId: string) {
    setCategories(p => p.map(c => c.id === catId
      ? { ...c, items: c.items.map(i => i.id === itemId ? { ...i, available: !i.available } : i) }
      : c
    ));
  }

  async function save() {
    setSaving(true);
    await fetch('/api/modules', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'menu', config: { ...info, categories } }),
    });
    setSaving(false); setSaved(true);
    setTimeout(() => { setSaved(false); router.refresh(); }, 1500);
  }

  const totalItems = categories.reduce((s, c) => s + c.items.length, 0);

  return (
    <div style={{ maxWidth: 920, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🍽️ Menu Restaurant</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} · {totalItems} plat{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="dash-overview-grid" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left: info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card padding="md">
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC', marginBottom: 18 }}>Informations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="Nom du restaurant" placeholder="Chez Kofi" value={info.restaurantName} onChange={setInfoField('restaurantName')} />
              <Input label="Adresse" placeholder="Cocody, Abidjan" value={info.address} onChange={setInfoField('address')} />
              <Input label="Horaires" placeholder="Lun–Sam : 8h–22h" value={info.openHours} onChange={setInfoField('openHours')} />
              <Input label="WhatsApp commandes" placeholder="+229 97 00 00 00" value={info.whatsapp} onChange={setInfoField('whatsapp')} hint="Reçoit les commandes formatées" />
              <div>
                <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#6B7280', textTransform: 'uppercase', marginBottom: 8 }}>Devise</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['FCFA', 'XOF', 'EUR', 'USD', 'MAD'].map(c => (
                    <button key={c} onClick={() => setInfo(p => ({ ...p, currency: c }))}
                      style={{ padding: '6px 12px', background: info.currency === c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${info.currency === c ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 6, color: info.currency === c ? '#818CF8' : '#9CA3AF', fontSize: 12, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <Input label="Lien menu PDF (optionnel)" placeholder="https://drive.google.com/..." value={info.menuUrl} onChange={setInfoField('menuUrl')} hint="En complément du menu digital" />
            </div>
          </Card>
          <Button variant="gradient" size="lg" loading={saving} onClick={save} style={{ width: '100%' }}>
            {saved ? '✓ Sauvegardé !' : 'Sauvegarder'}
          </Button>
        </div>

        {/* Right: menu builder */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>Carte du menu</p>
            <button onClick={() => { setAddingCat(true); setAddingItemTo(null); }}
              style={{ fontSize: 13, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '6px 14px', color: '#818CF8', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
              + Catégorie
            </button>
          </div>

          {/* New category form */}
          {addingCat && (
            <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 10, padding: 16 }}>
              <p style={{ color: '#818CF8', fontSize: 12, fontFamily: 'Syne, sans-serif', fontWeight: 600, marginBottom: 12 }}>Nouvelle catégorie</p>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                {CAT_EMOJIS.map(e => (
                  <button key={e} onClick={() => setNewCatEmoji(e)}
                    style={{ fontSize: 18, background: newCatEmoji === e ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newCatEmoji === e ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, padding: '4px 8px', cursor: 'pointer' }}>
                    {e}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  autoFocus type="text" value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') { setAddingCat(false); setNewCatName(''); } }}
                  placeholder="Entrées, Plats, Boissons..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}
                />
                <button onClick={addCategory}
                  style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#818CF8', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>
                  Créer
                </button>
                <button onClick={() => { setAddingCat(false); setNewCatName(''); }}
                  style={{ padding: '10px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#6B7280', cursor: 'pointer' }}>
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Empty state */}
          {categories.length === 0 && !addingCat && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🍽️</span>
              <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 4 }}>Aucune catégorie.</p>
              <p style={{ color: '#4B5563', fontSize: 12 }}>Cliquez sur « + Catégorie » pour créer votre carte.</p>
            </div>
          )}

          {/* Categories */}
          {categories.map(cat => {
            const isOpen       = openCatIds.has(cat.id);
            const isAddingHere = addingItemTo === cat.id;
            return (
              <div key={cat.id} style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                {/* Category header */}
                <div
                  onClick={() => toggleCat(cat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
                >
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <span style={{ flex: 1, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>{cat.name}</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>
                    {cat.items.length} plat{cat.items.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); removeCategory(cat.id); }}
                    title="Supprimer la catégorie"
                    style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', fontSize: 18, padding: '2px 6px', borderRadius: 4, lineHeight: 1 }}>
                    ×
                  </button>
                  <span style={{ color: '#6B7280', fontSize: 11, transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>
                </div>

                {/* Category body */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {cat.items.length === 0 && !isAddingHere && (
                      <p style={{ color: '#4B5563', fontSize: 12, padding: '12px 16px', fontFamily: 'Space Mono, monospace' }}>
                        Aucun plat. Ajoutez-en un ci-dessous.
                      </p>
                    )}

                    {cat.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: item.available ? 1 : 0.45 }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{item.emoji}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{item.name}</p>
                          {item.description && (
                            <p style={{ color: '#6B7280', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>
                          )}
                        </div>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#818CF8', flexShrink: 0 }}>
                          {item.price.toLocaleString('fr-FR')} {info.currency}
                        </span>
                        <button
                          onClick={() => toggleAvailable(cat.id, item.id)}
                          title={item.available ? 'Marquer épuisé' : 'Marquer disponible'}
                          style={{ padding: '4px 8px', borderRadius: 4, background: item.available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${item.available ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: item.available ? '#10B981' : '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                          {item.available ? 'Dispo' : 'Épuisé'}
                        </button>
                        <button
                          onClick={() => removeItem(cat.id, item.id)}
                          style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', fontSize: 18, padding: '2px 6px', flexShrink: 0, lineHeight: 1 }}>
                          ×
                        </button>
                      </div>
                    ))}

                    {/* Add item form */}
                    {isAddingHere ? (
                      <div style={{ padding: '14px 16px', background: 'rgba(99,102,241,0.04)' }}>
                        {/* Emoji picker */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                          {FOOD_EMOJIS.map(e => (
                            <button key={e} onClick={() => setNewItem(p => ({ ...p, emoji: e }))}
                              style={{ fontSize: 18, background: newItem.emoji === e ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newItem.emoji === e ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 5, padding: '3px 6px', cursor: 'pointer' }}>
                              {e}
                            </button>
                          ))}
                        </div>
                        {/* Name + price */}
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input
                            autoFocus type="text" value={newItem.name}
                            onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                            placeholder="Nom du plat *"
                            style={{ flex: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}
                          />
                          <input
                            type="number" value={newItem.price}
                            onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                            placeholder={`Prix ${info.currency}`}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 10px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 14, outline: 'none' }}
                          />
                        </div>
                        {/* Description */}
                        <input
                          type="text" value={newItem.description}
                          onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                          placeholder="Description courte (optionnel)"
                          onKeyDown={e => { if (e.key === 'Enter') addItem(cat.id); }}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                        />
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => addItem(cat.id)} disabled={!newItem.name.trim()}
                            style={{ flex: 1, padding: '10px', background: newItem.name.trim() ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newItem.name.trim() ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: newItem.name.trim() ? '#818CF8' : '#6B7280', cursor: newItem.name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
                            Ajouter au menu
                          </button>
                          <button onClick={() => { setAddingItemTo(null); setNewItem({ emoji: '🍽️', name: '', description: '', price: '' }); }}
                            style={{ padding: '10px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, color: '#6B7280', cursor: 'pointer', fontSize: 16 }}>
                            ×
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingItemTo(cat.id); setNewItem({ emoji: '🍽️', name: '', description: '', price: '' }); }}
                        style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#6366F1', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 13, textAlign: 'left' }}>
                        + Ajouter un plat
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
