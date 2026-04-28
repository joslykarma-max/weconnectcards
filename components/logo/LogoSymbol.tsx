'use client';

import Image from 'next/image';

interface LogoSymbolProps {
  width?: number;
  height?: number;
  className?: string;
  variant?: 'dark' | 'light' | 'electric';
}

export default function LogoSymbol({
  width = 52,
  height = 35,
  className = '',
}: LogoSymbolProps) {
  return (
    <Image
      src="/logo2.png"
      alt="We Connect"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
