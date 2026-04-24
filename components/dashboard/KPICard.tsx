'use client';

interface KPICardProps {
  label: string;
  value: string | number;
  trend?: number;
  icon?: React.ReactNode;
  description?: string;
}

export default function KPICard({ label, value, trend, icon, description }: KPICardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div style={{
      background: '#12141C',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 8,
      padding: '24px 28px',
      transition: 'all 0.3s cubic-bezier(0.23,1,0.32,1)',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(99,102,241,0.2)';
      (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)';
      (e.currentTarget as HTMLDivElement).style.transform   = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <p style={{ fontFamily: 'Space Mono, monospace', fontSize: 9, letterSpacing: 3, color: '#6B7280', textTransform: 'uppercase' }}>
          {label}
        </p>
        {icon && (
          <div style={{ color: '#818CF8', opacity: 0.7 }}>{icon}</div>
        )}
      </div>

      <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 36, color: '#F8F9FC', lineHeight: 1, marginBottom: 10 }}>
        {value}
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {trend !== undefined && (
          <span style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: 9,
            letterSpacing: 1,
            color: isPositive ? '#10B981' : '#EF4444',
            background: isPositive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
            padding: '2px 8px',
            borderRadius: 3,
          }}>
            {isPositive ? '+' : ''}{trend}%
          </span>
        )}
        {description && (
          <p style={{ color: '#6B7280', fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
