'use client';

import Image from 'next/image';

interface LogoStackedProps {
  symbolSize?: 'sm' | 'md';
  variant?: 'dark' | 'light' | 'electric';
  className?: string;
}

const heights = { sm: 40, md: 60 };

export default function LogoStacked({
  symbolSize = 'sm',
  className = '',
}: LogoStackedProps) {
  const h = heights[symbolSize];
  const w = Math.round(h * 1.5);

  return (
    <Image
      src="/logo2.png"
      alt="We Connect"
      width={w}
      height={h}
      className={className}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
