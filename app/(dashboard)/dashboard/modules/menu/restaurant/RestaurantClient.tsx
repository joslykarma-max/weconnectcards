'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { OrderDoc } from '@/lib/types';

const STATUS_NEXT: Record<OrderDoc['status'], OrderDoc['status'] | null> = {
  pending:   'preparing',
  preparing: 'served',
  served:    null,
};

const STATUS_LABEL: Record<OrderDoc['status'], string> = {
  pending:   'Mettre en préparation',
  preparing: 'Marquer servie',
  served:    '',
};

const STATUS_COLOR: Record<OrderDoc['status'], string> = {
  pending:   '#F59E0B',
  preparing: '#6366F1',
  served:    '#10B981',
};

const STATUS_BG: Record<OrderDoc['status'], string> = {
  pending:   'rgba(245,158,11,0.1)',
  preparing: 'rgba(99,102,241,0.1)',
  served:    'rgba(16,185,129,0.08)',
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m    = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  return `Il y a ${Math.floor(m / 60)}h`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function OrderCard({ order, onAdvance }: { order: OrderDoc; onAdvance: (id: string, status: OrderDoc['status']) => void }) {
  const next = STATUS_NEXT[order.status];
  const isServed = order.status === 'served';

  return (
    <div style={{
      background: isServed ? 'rgba(16,185,129,0.04)' : 'var(--t-surface)',
      border: `1px solid ${STATUS_COLOR[order.status]}33`,
      borderRadius: 10,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            background: STATUS_BG[order.status],
            border: `1px solid ${STATUS_COLOR[order.status]}44`,
            borderRadius: 8,
            padding: '4px 12px',
          }}>
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 15, color: STATUS_COLOR[order.status] }}>
              Table {order.tableNumber}
            </span>
          </div>
        </div>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: '#6B7280', letterSpacing: 1 }}>
          {timeAgo(order.createdAt)}
        </span>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--t-text)', fontSize: 13, fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ color: STATUS_COLOR[order.status], fontWeight: 700, fontFamily: 'Space Mono, monospace', marginRight: 6 }}>
                {item.qty}×
              </span>
              {item.emoji} {item.name}
            </span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 11, color: '#6B7280' }}>
              {(item.qty * item.price).toLocaleString('fr-FR')}
            </span>
          </div>
        ))}
      </div>

      {/* Note */}
      {order.note && (
        <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 6, padding: '8px 10px' }}>
          <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 2, color: '#F59E0B', marginBottom: 3, textTransform: 'uppercase' }}>Note</p>
          <p style={{ color: '#F8F9FC', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{order.note}</p>
        </div>
      )}

      {/* Total + action */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}>
        <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 13, fontWeight: 700, color: 'var(--t-text)' }}>
          {order.total.toLocaleString('fr-FR')} {order.currency}
        </span>
        {next && (
          <button
            onClick={() => onAdvance(order.id, next)}
            style={{
              padding: '7px 16px',
              background: next === 'preparing' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
              border: `1px solid ${next === 'preparing' ? 'rgba(99,102,241,0.35)' : 'rgba(16,185,129,0.35)'}`,
              borderRadius: 7, cursor: 'pointer',
              color: next === 'preparing' ? '#818CF8' : '#10B981',
              fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 12,
            }}
          >
            {STATUS_LABEL[order.status]} →
          </button>
        )}
      </div>
    </div>
  );
}

interface Props {
  uid:            string;
  restaurantName: string;
}

export default function RestaurantClient({ uid, restaurantName }: Props) {
  const [orders,     setOrders]     = useState<OrderDoc[]>([]);
  const [connected,  setConnected]  = useState(false);
  const [activeTab,  setActiveTab]  = useState<OrderDoc['status']>('pending');
  const [advancing,  setAdvancing]  = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!db) return;

    const q = query(
      collection(db, 'orders'),
      where('profileId', '==', uid),
    );

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs
        .map(d => d.data() as OrderDoc)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setOrders(docs);
      setConnected(true);
    }, () => {
      setConnected(false);
    });

    return () => unsub();
  }, [uid]);

  async function advanceOrder(id: string, status: OrderDoc['status']) {
    setAdvancing(prev => new Set([...prev, id]));
    try {
      await fetch(`/api/menu/order/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status }),
      });
    } finally {
      setAdvancing(prev => { const next = new Set(prev); next.delete(id); return next; });
    }
  }

  const todayStr     = today();
  const pending      = orders.filter(o => o.status === 'pending');
  const preparing    = orders.filter(o => o.status === 'preparing');
  const servedToday  = orders.filter(o => o.status === 'served' && o.createdAt.startsWith(todayStr));

  const todayTotal   = [...pending, ...preparing, ...servedToday].reduce((s, o) => s + o.total, 0);
  const todayCurrency = orders[0]?.currency ?? 'FCFA';
  const todayCount   = pending.length + preparing.length + servedToday.length;

  const tabs: { id: OrderDoc['status']; label: string; icon: string; count: number; color: string }[] = [
    { id: 'pending',   label: 'Nouvelles',    icon: '🔔', count: pending.length,     color: '#F59E0B' },
    { id: 'preparing', label: 'En préparation', icon: '🔥', count: preparing.length,   color: '#6366F1' },
    { id: 'served',    label: "Servies auj.", icon: '✅', count: servedToday.length,  color: '#10B981' },
  ];

  const visibleOrders = activeTab === 'pending' ? pending
    : activeTab === 'preparing' ? preparing
    : servedToday;

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Link href="/dashboard/modules/menu" style={{ background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', fontSize: 20, textDecoration: 'none', display: 'flex', alignItems: 'center' }}>←</Link>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 22, color: 'var(--t-text)', marginBottom: 2 }}>
            📊 Dashboard Restaurant
          </h2>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 13 }}>{restaurantName || 'Mon Restaurant'}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? '#10B981' : '#EF4444', display: 'inline-block', boxShadow: connected ? '0 0 6px #10B981' : undefined }} />
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, color: connected ? '#10B981' : '#EF4444', letterSpacing: 1, textTransform: 'uppercase' }}>
            {connected ? 'Live' : 'Déconnecté'}
          </span>
        </div>
      </div>

      {/* Today KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { label: "Commandes auj.", value: todayCount,   color: '#818CF8' },
          { label: "En attente",     value: pending.length, color: '#F59E0B' },
          { label: `CA auj. ${todayCurrency}`, value: todayTotal.toLocaleString('fr-FR'), color: '#10B981' },
        ].map(stat => (
          <div key={stat.label} style={{ flex: 1, minWidth: 120, padding: '14px 16px', background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 8, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 20, color: stat.color }}>{stat.value}</p>
            <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 1, color: 'var(--t-text-muted)', marginTop: 4, textTransform: 'uppercase' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                background: active ? `${tab.color}18` : 'var(--t-surface)',
                border: `1px solid ${active ? tab.color + '44' : 'var(--t-border-color, rgba(255,255,255,0.08))'}`,
                color: active ? tab.color : 'var(--t-text-muted)',
                fontFamily: 'DM Sans, sans-serif', fontWeight: active ? 700 : 400, fontSize: 13,
                transition: 'all 0.15s',
              }}
            >
              <span>{tab.icon}</span>
              <span className="hide-mobile">{tab.label}</span>
              {tab.count > 0 && (
                <span style={{ background: tab.color, color: '#fff', borderRadius: 12, padding: '1px 7px', fontSize: 11, fontFamily: 'Space Mono, monospace', fontWeight: 700 }}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      {visibleOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'var(--t-surface)', border: 'var(--t-border-full)', borderRadius: 10 }}>
          <p style={{ fontSize: 36, marginBottom: 10 }}>
            {activeTab === 'pending' ? '🔔' : activeTab === 'preparing' ? '🔥' : '✅'}
          </p>
          <p style={{ color: 'var(--t-text-muted)', fontSize: 14 }}>
            {activeTab === 'pending' ? 'Aucune nouvelle commande' : activeTab === 'preparing' ? 'Rien en préparation' : 'Aucune commande servie aujourd\'hui'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {visibleOrders.map(order => (
            <div key={order.id} style={{ opacity: advancing.has(order.id) ? 0.5 : 1, transition: 'opacity 0.2s' }}>
              <OrderCard order={order} onAdvance={advanceOrder} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
