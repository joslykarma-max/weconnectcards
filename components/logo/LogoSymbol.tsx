'use client';

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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo2.png"
      alt="We Connect"
      width={width}
      height={height}
      className={className}
      style={{ width, height, objectFit: 'contain', display: 'block' }}
    />
  );
}
