'use client';

import LogoSymbol from './LogoSymbol';

interface LogoHorizontalProps {
  symbolSize?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'dark' | 'light' | 'electric';
  className?: string;
}

const sizes = {
  sm:  { w: 52,  h: 35,  wordmark: 20 },
  md:  { w: 78,  h: 53,  wordmark: 30 },
  lg:  { w: 130, h: 88,  wordmark: 44 },
};

export default function LogoHorizontal({
  symbolSize = 'md',
  showTagline = false,
  variant = 'dark',
  className = '',
}: LogoHorizontalProps) {
  const { w, h, wordmark } = sizes[symbolSize];
  const weColor = variant === 'light' ? '#08090C' : '#F8F9FC';
  const connectColor = variant === 'light' ? '#4338CA' : '#6366F1';
  const taglineColor = variant === 'light' ? '#6B7280' : '#9CA3AF';

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <LogoSymbol width={w} height={h} variant={variant} />
      <div>
        <div
          style={{
            fontFamily: 'Syne, sans-serif',
            fontWeight: 800,
            fontSize: wordmark,
            letterSpacing: '-1.5px',
            lineHeight: 1,
          }}
        >
          <span style={{ color: weColor }}>We</span>
          <span style={{ color: connectColor }}>Connect</span>
        </div>
        {showTagline && (
          <div
            style={{
              fontFamily: 'Space Mono, monospace',
              fontSize: 8,
              letterSpacing: '4px',
              color: taglineColor,
              marginTop: 5,
              textTransform: 'uppercase',
            }}
          >
            Your Identity. One Touch.
          </div>
        )}
      </div>
    </div>
  );
}
