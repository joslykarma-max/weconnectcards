'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useState } from 'react';
import cx from '@/components/dashboard/shell/compact.module.css';

interface AnalyticsData {
  scansByDay:  Record<string, number>;
  devices:     Record<string, number>;
  topLinks:    Array<{ label: string; type: string; count: number }>;
  totalScans:  number;
  totalClicks: number;
  username?:   string;
  scansTrend?:  number;
  clicksTrend?: number;
}

const CHART_COLORS = ['#6366F1', '#06B6D4', '#4F46E5', '#0891B2', '#4338CA'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--t-card)',
      border: 'var(--t-border-full)',
      borderRadius: 6,
      padding: '10px 14px',
    }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#64748B', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontWeight: 700, fontSize: 20, color: '#0F172A' }}>{payload[0].value}</p>
    </div>
  );
};

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const lineData = Object.entries(data.scansByDay).slice(-30).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    scans: count,
  }));

  const deviceData = Object.entries(data.devices).map(([name, value]) => ({ name, value }));
  const barData    = data.topLinks.map((l) => ({ name: l.label, clicks: l.count }));

  const engagement = data.totalScans > 0
    ? Math.round((data.totalClicks / data.totalScans) * 100)
    : 0;

  const [tab, setTab] = useState<'scans' | 'liens' | 'appareils'>('scans');
  const trend = (n?: number) => (typeof n === 'number' && n !== 0 ? <span className={cx.kpiTrend}>{n > 0 ? '+' : ''}{n}%</span> : null);

  return (
    <div className={cx.fill}>
      <div className={cx.kpis} style={{ '--cols': 3 } as React.CSSProperties}>
        <div className={cx.kpi}><span className={cx.kpiValue}>{data.totalScans}{trend(data.scansTrend)}</span><span className={cx.kpiLabel}>Scans · 90 j</span></div>
        <div className={cx.kpi}><span className={cx.kpiValue}>{data.totalClicks}{trend(data.clicksTrend)}</span><span className={cx.kpiLabel}>Clics · 90 j</span></div>
        <div className={cx.kpi}><span className={cx.kpiValue}>{engagement}%</span><span className={cx.kpiLabel}>Engagement</span></div>
      </div>

      <div className={cx.tabs} role="tablist" aria-label="Statistiques">
        {([['scans', 'Scans · 30 j'], ['liens', 'Liens cliqués'], ['appareils', 'Appareils']] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`${cx.tab} ${tab === k ? cx.tabOn : ''}`} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      <div className={cx.content} role="tabpanel">
        {tab === 'scans' && (
          <div className={cx.card}>
            <p className={cx.cardTitle}>Scans — 30 derniers jours</p>
            {lineData.length > 0 ? (
              <div className={cx.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <XAxis dataKey="date" stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} />
                    <YAxis stroke="#64748B" allowDecimals={false} tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} width={28} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="scans" stroke="#6366F1" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#6366F1' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : <p className={cx.empty}>Pas encore de données. Partagez votre carte NFC pour commencer.</p>}
          </div>
        )}

        {tab === 'liens' && (
          <div className={cx.card}>
            <p className={cx.cardTitle}>Liens les plus cliqués</p>
            {barData.length > 0 ? (
              <div className={cx.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical">
                    <XAxis type="number" allowDecimals={false} stroke="#64748B" tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} />
                    <YAxis type="category" dataKey="name" width={90} stroke="#64748B" tick={{ fontSize: 11, fontFamily: 'DM Sans, sans-serif' }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="clicks" fill="#6366F1" radius={6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <p className={cx.empty}>Pas encore de clics sur vos liens.</p>}
          </div>
        )}

        {tab === 'appareils' && (
          <div className={cx.card}>
            <p className={cx.cardTitle}>Appareils des visiteurs</p>
            {deviceData.length > 0 ? (
              <div className={cx.chart}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius="45%" outerRadius="75%" paddingAngle={4} dataKey="value">
                      {deviceData.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend formatter={(value) => <span style={{ color: '#334155', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : <p className={cx.empty}>Pas encore de données.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
