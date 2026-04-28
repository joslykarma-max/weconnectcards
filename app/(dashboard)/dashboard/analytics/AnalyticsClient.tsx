'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import KPICard from '@/components/dashboard/KPICard';

interface AnalyticsData {
  scansByDay: Record<string, number>;
  devices: Record<string, number>;
  topLinks: Array<{ label: string; type: string; count: number }>;
  totalScans: number;
  totalClicks: number;
  username?: string;
}

const CHART_COLORS = ['#6366F1', '#06B6D4', '#818CF8', '#0891B2', '#4338CA'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#181B26',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 6,
      padding: '10px 14px',
    }}>
      <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 10, color: '#6B7280', marginBottom: 4 }}>{label}</p>
      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F8F9FC' }}>{payload[0].value}</p>
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

  return (
    <div>
      <div className="dash-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 36 }}>
        <KPICard label="Scans (90j)" value={data.totalScans} trend={12} />
        <KPICard label="Clics (90j)" value={data.totalClicks} trend={8} />
        <KPICard label="Engagement" value={`${engagement}%`} trend={3} />
      </div>

      {/* Scans chart */}
      <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC' }}>Scans — 30 derniers jours</h3>
        </div>
        {lineData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={lineData}>
              <XAxis dataKey="date" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} />
              <YAxis stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="scans" stroke="#6366F1" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#6366F1' }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#6B7280', fontSize: 14 }}>Pas encore de données. Partagez votre carte NFC pour commencer.</p>
          </div>
        )}
      </div>

      <div className="dash-analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Top links */}
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 28 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 24 }}>Top liens cliqués</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} layout="vertical">
                <XAxis type="number" stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} />
                <YAxis type="category" dataKey="name" width={80} stroke="#6B7280" tick={{ fontSize: 10, fontFamily: 'Space Mono, monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="clicks" fill="#6366F1" radius={3} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#6B7280', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>Pas encore de clics.</p>
          )}
        </div>

        {/* Device breakdown */}
        <div style={{ background: '#12141C', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: 28 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F8F9FC', marginBottom: 24 }}>Appareils</h3>
          {deviceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {deviceData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ color: '#9CA3AF', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#6B7280', fontSize: 14, padding: '32px 0', textAlign: 'center' }}>Pas encore de données.</p>
          )}
        </div>
      </div>
    </div>
  );
}
