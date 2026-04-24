'use client';

import LogoSymbol from './LogoSymbol';

interface LogoStackedProps {
  symbolSize?: 'sm' | 'md';
  variant?: 'dark' | 'light' | 'electric';
  className?: string;
}

const sizes = {
  sm: { w: 60, h: 40, wordmark: 14 },
  md: { w: 90, h: 61, wordmark: 20 },
};

export default function LogoStacked({
  symbolSize = 'sm',
  variant = 'dark',
  className = '',
}: LogoStackedProps) {
  const { w, h, wordmark } = sizes[symbolSize];
  const weColor = variant === 'light' ? '#08090C' : '#F8F9FC';
  const connectColor = variant === 'light' ? '#4338CA' : '#6366F1';

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <LogoSymbol width={w} height={h} variant={variant} />
      <div
        style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: 800,
          fontSize: wordmark,
          letterSpacing: '-0.5px',
          lineHeight: 1,
        }}
      >
        <span style={{ color: weColor }}>We</span>
        <span style={{ color: connectColor }}>Connect</span>
      </div>
    </div>
  );
}
