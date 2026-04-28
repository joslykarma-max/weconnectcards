'use client';

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

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo2.png"
      alt="We Connect"
      height={h}
      className={className}
      style={{ height: h, width: 'auto', display: 'block' }}
    />
  );
}
