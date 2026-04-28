'use client';

import Image from 'next/image';

interface LogoHorizontalProps {
  symbolSize?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'dark' | 'light' | 'electric';
  className?: string;
}

const heights = { sm: 32, md: 48, lg: 80 };

export default function LogoHorizontal({
  symbolSize = 'md',
  className = '',
}: LogoHorizontalProps) {
  const h = heights[symbolSize];
  const w = Math.round(h * 1.5); // 612/408 ≈ 1.5

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
