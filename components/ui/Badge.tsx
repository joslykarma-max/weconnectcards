import { ReactNode } from 'react';

type BadgeVariant = 'electric' | 'cyan' | 'success' | 'warning' | 'danger' | 'neutral' | 'gradient';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, React.CSSProperties> = {
  electric: {
    background: 'rgba(99,102,241,0.15)',
    color: '#818CF8',
    border: '1px solid rgba(99,102,241,0.25)',
  },
  cyan: {
    background: 'rgba(6,182,212,0.15)',
    color: '#06B6D4',
    border: '1px solid rgba(6,182,212,0.25)',
  },
  success: {
    background: 'rgba(16,185,129,0.15)',
    color: '#10B981',
    border: '1px solid rgba(16,185,129,0.25)',
  },
  warning: {
    background: 'rgba(245,158,11,0.15)',
    color: '#F59E0B',
    border: '1px solid rgba(245,158,11,0.25)',
  },
  danger: {
    background: 'rgba(239,68,68,0.15)',
    color: '#EF4444',
    border: '1px solid rgba(239,68,68,0.25)',
  },
  neutral: {
    background: 'rgba(255,255,255,0.05)',
    color: '#9CA3AF',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  gradient: {
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.2))',
    color: '#818CF8',
    border: '1px solid rgba(99,102,241,0.3)',
  },
};

export default function Badge({
  children,
  variant = 'electric',
  className = '',
  dot = false,
}: BadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 10px',
        borderRadius: '4px',
        fontFamily: 'Space Mono, monospace',
        fontSize: '9px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
        fontWeight: 400,
        ...variantStyles[variant],
      }}
      className={className}
    >
      {dot && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: 'currentColor',
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {children}
    </span>
  );
}
