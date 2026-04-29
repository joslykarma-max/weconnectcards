'use client';

interface LogoHorizontalProps {
  symbolSize?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'dark' | 'light' | 'electric';
  className?: string;
}

const heights = { sm: 48, md: 64, lg: 100 };

export default function LogoHorizontal({
  symbolSize = 'md',
  className = '',
}: LogoHorizontalProps) {
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
