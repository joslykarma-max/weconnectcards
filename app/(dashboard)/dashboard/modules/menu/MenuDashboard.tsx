'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

async function uploadImageFile(file: File): Promise<string | null> {
  if (!file.type.startsWith('image/')) return null;
  const fd = new FormData();
  fd.append('file', file);
  const res = await fetch('/api/upload', { method: 'POST', body: fd });
  if (!res.ok) return null;
  const { url } = await res.json() as { url: string };
  return url;
}

// ── Live preview ─────────────────────────────────────────────────────────────
function MenuPreview({ info, categories }: { info: Info; categories: MenuCategory[] }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [cart, setCart] = useState<Record<string, number>>({});

  const allItems    = categories.flatMap(c => c.items.filter(i => i.available !== false));
  const displayCats = selectedCat === 'all' ? categories : categories.filter(c => c.id === selectedCat);

  const cartItems = Object.entries(cart)
    .filter(([, q]) => q > 0)
    .flatMap(([id, qty]) => {
      const item = allItems.find(i => i.id === id);
      return item ? [{ item, qty }] : [];
    });
  const cartTotal = cartItems.reduce((s, { item, qty }) => s + item.price * qty, 0);
  const cartCount = cartItems.reduce((s, { qty }) => s + qty, 0);

  function add(id: string) { setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 })); }
  function sub(id: string) {
    setCart(p => {
      const n = (p[id] || 0) - 1;
      if (n <= 0) { const { [id]: _r, ...rest } = p; return rest; }
      return { ...p, [id]: n };
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#4B5563', textTransform: 'uppercase' }}>
        Vue client · {allItems.length} plat{allItems.length !== 1 ? 's' : ''} disponible{allItems.length !== 1 ? 's' : ''}
      </p>

      {/* Phone frame */}
      <div style={{
        width: '100%', maxWidth: 360, height: 660,
        background: '#08090C',
        borderRadius: 18,
        border: '2px solid rgba(255,255,255,0.1)',
        boxShadow: '0 0 0 6px rgba(255,255,255,0.03), 0 24px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Status bar mock */}
        <div style={{ height: 28, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', flexShrink: 0 }}>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>9:41</span>
          <div style={{ width: 60, height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4 }} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280' }}>●●●</span>
        </div>

        {/* Back link mock */}
        <div style={{ padding: '8px 16px 0', flexShrink: 0 }}>
          <span style={{ color: '#6B7280', fontSize: 11, fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Voir le profil
          </span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px', paddingBottom: cartCount > 0 ? 80 : 20, scrollbarWidth: 'none' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 7, letterSpacing: 4, color: '#6366F1', textTransform: 'uppercase', marginBottom: 8 }}>Menu</p>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: '#F8F9FC', marginBottom: 4 }}>
              {info.restaurantName || 'Votre Restaurant'}
            </h1>
            {info.address   && <p style={{ color: '#9CA3AF', fontSize: 11, marginBottom: 2 }}>📍 {info.address}</p>}
            {info.openHours && <p style={{ color: '#6B7280', fontSize: 10, fontFamily: 'Space Mono, monospace' }}>🕐 {info.openHours}</p>}
          </div>

          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', paddingTop: 32 }}>
              <span style={{ fontSize: 32, display: 'block', marginBottom: 12 }}>🍽️</span>
              <p style={{ color: '#4B5563', fontSize: 12 }}>Ajoutez des catégories pour voir l&apos;aperçu.</p>
            </div>
          ) : (
            <>
              {/* Category tabs */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' } as React.CSSProperties}>
                <button onClick={() => setSelectedCat('all')}
                  style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 14, background: selectedCat === 'all' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedCat === 'all' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, color: selectedCat === 'all' ? '#818CF8' : '#9CA3AF', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap' }}>
                  Tout
                </button>
                {categories.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCat(cat.id)}
                    style={{ flexShrink: 0, padding: '5px 10px', borderRadius: 14, background: selectedCat === cat.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${selectedCat === cat.id ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, color: selectedCat === cat.id ? '#818CF8' : '#9CA3AF', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 10, whiteSpace: 'nowrap' }}>
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {displayCats
                  .filter(cat => cat.items.some(i => i.available !== false))
                  .map(cat => (
                    <div key={cat.id}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                        <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 13, color: '#F8F9FC' }}>{cat.name}</h2>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                        {cat.items.filter(i => i.available !== false).map(item => {
                          const qty = cart[item.id] || 0;
                          return (
                            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 10px', background: '#181B26', border: `1px solid ${qty > 0 ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 8, transition: 'border-color 0.2s' }}>
                              {item.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <Image src={item.imageUrl} alt={item.name} width={52} height={52} style={{ borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                              ) : (
                                <span style={{ fontSize: 24, flexShrink: 0 }}>{item.emoji}</span>
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ color: '#F8F9FC', fontSize: 12, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                                {item.description && <p style={{ color: '#6B7280', fontSize: 10, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>}
                                <p style={{ color: '#818CF8', fontSize: 10, fontFamily: 'Space Mono, monospace', marginTop: 2 }}>
                                  {item.price.toLocaleString('fr-FR')} {info.currency}
                                </p>
                              </div>
                              {qty === 0 ? (
                                <button onClick={() => add(item.id)}
                                  style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818CF8', fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>+</button>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                                  <button onClick={() => sub(item.id)}
                                    style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>−</button>
                                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 12, color: '#F8F9FC', minWidth: 14, textAlign: 'center' }}>{qty}</span>
                                  <button onClick={() => add(item.id)}
                                    style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: '#818CF8', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>+</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>

        {/* Cart bar */}
        {cartCount > 0 && (
          <div style={{ padding: '10px 14px 14px', background: 'rgba(8,9,12,0.97)', borderTop: '1px solid rgba(99,102,241,0.2)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ color: '#9CA3AF', fontSize: 11, fontFamily: 'DM Sans, sans-serif' }}>{cartCount} article{cartCount > 1 ? 's' : ''}</span>
              <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#818CF8' }}>{cartTotal.toLocaleString('fr-FR')} {info.currency}</span>
            </div>
            <div style={{ padding: '10px', background: 'linear-gradient(135deg, #059669, #10B981)', borderRadius: 8, color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, textAlign: 'center', cursor: 'default' }}>
              💬 Envoyer la commande
            </div>
          </div>
        )}
      </div>

      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#4B5563', textAlign: 'center', letterSpacing: 1 }}>
        Le panier est interactif · les prix sont en temps réel
      </p>
    </div>
  );
}

// ── Main dashboard ────────────────────────────────────────────────────────────
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
  const [activeTab, setActiveTab]   = useState<'editor' | 'preview'>('editor');

  const [openCatIds,   setOpenCatIds]   = useState<Set<string>>(new Set(initialCategories.map(c => c.id)));
  const [addingCat,    setAddingCat]    = useState(false);
  const [newCatName,   setNewCatName]   = useState('');
  const [newCatEmoji,  setNewCatEmoji]  = useState('🍽️');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ emoji: '🍽️', name: '', description: '', price: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  const newItemFileRef  = useRef<HTMLInputElement>(null);
  const updateImageRef  = useRef<HTMLInputElement>(null);
  const [updatingImageFor, setUpdatingImageFor] = useState<string | null>(null);

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
      imageUrl:    newItem.imageUrl || undefined,
    };
    setCategories(p => p.map(c => c.id === catId ? { ...c, items: [...c.items, item] } : c));
    setNewItem({ emoji: '🍽️', name: '', description: '', price: '', imageUrl: '' });
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

  function updateItemImage(itemId: string, url: string) {
    setCategories(p => p.map(c => ({
      ...c, items: c.items.map(i => i.id === itemId ? { ...i, imageUrl: url } : i),
    })));
  }

  async function handleNewItemImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImageFile(file);
    setUploading(false);
    if (url) setNewItem(p => ({ ...p, imageUrl: url }));
    e.target.value = '';
  }

  async function handleUpdateItemImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !updatingImageFor) return;
    setUploading(true);
    const url = await uploadImageFile(file);
    setUploading(false);
    if (url) updateItemImage(updatingImageFor, url);
    setUpdatingImageFor(null);
    e.target.value = '';
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
    <div style={{ maxWidth: 980, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <input ref={newItemFileRef}  type="file" accept="image/*" style={{ display: 'none' }} onChange={handleNewItemImage} />
      <input ref={updateImageRef}  type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpdateItemImage} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="module-back-btn" onClick={() => router.back()} style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>←</button>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: '#F8F9FC' }}>🍽️ Menu Restaurant</h2>
          <p style={{ color: '#6B7280', fontSize: 13 }}>
            {categories.length} catégorie{categories.length !== 1 ? 's' : ''} · {totalItems} plat{totalItems !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="module-3col" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 340px', gap: 24, alignItems: 'start' }}>
        {/* Col 1: info */}
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
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {['FCFA', 'XOF', 'EUR', 'USD', 'MAD'].map(c => (
                    <button key={c} onClick={() => setInfo(p => ({ ...p, currency: c }))}
                      style={{ padding: '5px 10px', background: info.currency === c ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${info.currency === c ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 5, color: info.currency === c ? '#818CF8' : '#9CA3AF', fontSize: 11, cursor: 'pointer', fontFamily: 'Space Mono, monospace' }}>
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

        {/* Col 2: editor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>Carte du menu</p>
            <button onClick={() => { setAddingCat(true); setAddingItemTo(null); }}
              style={{ fontSize: 13, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 6, padding: '6px 14px', color: '#818CF8', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 600 }}>
              + Catégorie
            </button>
          </div>

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
                <input autoFocus type="text" value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') { setAddingCat(false); setNewCatName(''); } }}
                  placeholder="Entrées, Plats, Boissons..."
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}
                />
                <button onClick={addCategory}
                  style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6, color: '#818CF8', cursor: 'pointer', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap' }}>Créer</button>
                <button onClick={() => { setAddingCat(false); setNewCatName(''); }}
                  style={{ padding: '10px 12px', background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, color: '#6B7280', cursor: 'pointer' }}>×</button>
              </div>
            </div>
          )}

          {categories.length === 0 && !addingCat && (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 12 }}>
              <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🍽️</span>
              <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 4 }}>Aucune catégorie.</p>
              <p style={{ color: '#4B5563', fontSize: 12 }}>Cliquez sur « + Catégorie » pour créer votre carte.</p>
            </div>
          )}

          {categories.map(cat => {
            const isOpen       = openCatIds.has(cat.id);
            const isAddingHere = addingItemTo === cat.id;
            return (
              <div key={cat.id} style={{ background: '#181B26', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden' }}>
                <div onClick={() => toggleCat(cat.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}>
                  <span style={{ fontSize: 20 }}>{cat.emoji}</span>
                  <span style={{ flex: 1, fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F8F9FC' }}>{cat.name}</span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280' }}>{cat.items.length} plat{cat.items.length !== 1 ? 's' : ''}</span>
                  <button onClick={e => { e.stopPropagation(); removeCategory(cat.id); }} title="Supprimer"
                    style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', fontSize: 18, padding: '2px 6px', lineHeight: 1 }}>×</button>
                  <span style={{ color: '#6B7280', fontSize: 11, transform: isOpen ? 'rotate(90deg)' : 'rotate(0)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>
                </div>

                {isOpen && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {cat.items.length === 0 && !isAddingHere && (
                      <p style={{ color: '#4B5563', fontSize: 12, padding: '12px 16px', fontFamily: 'Space Mono, monospace' }}>Aucun plat.</p>
                    )}

                    {cat.items.map(item => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', opacity: item.available ? 1 : 0.45 }}>
                        <button title="Changer la photo"
                          onClick={() => { setUpdatingImageFor(item.id); updateImageRef.current?.click(); }}
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', flexShrink: 0 }}>
                          {item.imageUrl ? (
                            <div style={{ width: 40, height: 40, borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image src={item.imageUrl} alt="" fill style={{ objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                              {uploading && updatingImageFor === item.id ? '⏳' : item.emoji}
                            </div>
                          )}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: '#F8F9FC', fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{item.name}</p>
                          {item.description && <p style={{ color: '#6B7280', fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</p>}
                        </div>
                        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 12, color: '#818CF8', flexShrink: 0 }}>
                          {item.price.toLocaleString('fr-FR')} {info.currency}
                        </span>
                        <button onClick={() => toggleAvailable(cat.id, item.id)}
                          style={{ padding: '4px 8px', borderRadius: 4, background: item.available ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${item.available ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, color: item.available ? '#10B981' : '#EF4444', fontSize: 10, cursor: 'pointer', fontFamily: 'Space Mono, monospace', flexShrink: 0 }}>
                          {item.available ? 'Dispo' : 'Épuisé'}
                        </button>
                        <button onClick={() => removeItem(cat.id, item.id)}
                          style={{ background: 'none', border: 'none', color: '#4B5563', cursor: 'pointer', fontSize: 18, padding: '2px 6px', flexShrink: 0, lineHeight: 1 }}>×</button>
                      </div>
                    ))}

                    {isAddingHere ? (
                      <div style={{ padding: '14px 16px', background: 'rgba(99,102,241,0.04)' }}>
                        <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                          {FOOD_EMOJIS.map(e => (
                            <button key={e} onClick={() => setNewItem(p => ({ ...p, emoji: e }))}
                              style={{ fontSize: 17, background: newItem.emoji === e ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newItem.emoji === e ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 5, padding: '3px 6px', cursor: 'pointer' }}>
                              {e}
                            </button>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                          <input autoFocus type="text" value={newItem.name}
                            onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))}
                            placeholder="Nom du plat *"
                            style={{ flex: 2, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 14, outline: 'none' }}
                          />
                          <input type="number" value={newItem.price}
                            onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                            placeholder={`Prix ${info.currency}`}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 10px', color: '#F8F9FC', fontFamily: 'Space Mono, monospace', fontSize: 14, outline: 'none' }}
                          />
                        </div>
                        <input type="text" value={newItem.description}
                          onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))}
                          placeholder="Description courte (optionnel)"
                          onKeyDown={e => { if (e.key === 'Enter') addItem(cat.id); }}
                          style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, padding: '10px 12px', color: '#F8F9FC', fontFamily: 'DM Sans, sans-serif', fontSize: 13, outline: 'none', boxSizing: 'border-box', marginBottom: 10 }}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                          {newItem.imageUrl ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <Image src={newItem.imageUrl} alt="" width={44} height={44} style={{ borderRadius: 6, objectFit: 'cover' }} />
                              <button onClick={() => setNewItem(p => ({ ...p, imageUrl: '' }))}
                                style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 12, fontFamily: 'Space Mono, monospace' }}>
                                Supprimer
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => newItemFileRef.current?.click()} disabled={uploading}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 6, color: '#6B7280', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
                              {uploading ? '⏳ Upload...' : '📸 Ajouter une photo'}
                            </button>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => addItem(cat.id)} disabled={!newItem.name.trim()}
                            style={{ flex: 1, padding: '10px', background: newItem.name.trim() ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)', border: `1px solid ${newItem.name.trim() ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 6, color: newItem.name.trim() ? '#818CF8' : '#6B7280', cursor: newItem.name.trim() ? 'pointer' : 'not-allowed', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
                            Ajouter au menu
                          </button>
                          <button onClick={() => { setAddingItemTo(null); setNewItem({ emoji: '🍽️', name: '', description: '', price: '', imageUrl: '' }); }}
                            style={{ padding: '10px 14px', background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, color: '#6B7280', cursor: 'pointer', fontSize: 16 }}>×</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingItemTo(cat.id); setNewItem({ emoji: '🍽️', name: '', description: '', price: '', imageUrl: '' }); }}
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

        {/* Col 3: live preview */}
        <div style={{ position: 'sticky', top: 24 }}>
          <MenuPreview info={info} categories={categories} />
        </div>
      </div>
    </div>
  );
}
