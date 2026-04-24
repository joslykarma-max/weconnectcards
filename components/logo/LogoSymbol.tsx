'use client';

interface LogoSymbolProps {
  width?: number;
  height?: number;
  className?: string;
  /** 'dark' = fond sombre (défaut) | 'light' = fond clair | 'electric' = fond electric */
  variant?: 'dark' | 'light' | 'electric';
}

export default function LogoSymbol({
  width = 130,
  height = 88,
  className = '',
  variant = 'dark',
}: LogoSymbolProps) {
  const idSuffix = `${width}${height}${variant}`;

  const colorStart = variant === 'light' ? '#4338CA' : '#6366F1';
  const colorEnd   = variant === 'light' ? '#0891B2' : '#06B6D4';
  const frameFill  = variant === 'electric' ? 'rgba(255,255,255,0.05)' : 'rgba(99,102,241,0.05)';
  const frameStroke = variant === 'light'
    ? 'rgba(67,56,202,0.22)'
    : variant === 'electric'
    ? 'rgba(255,255,255,0.2)'
    : 'rgba(99,102,241,0.22)';
  const innerStroke = variant === 'light'
    ? 'rgba(67,56,202,0.08)'
    : 'rgba(99,102,241,0.08)';

  const cornerH = Math.round(width * 0.2);
  const cornerV = Math.round(height * 0.2);
  const sw = Math.max(1.5, width * 0.019);
  const fontSize = Math.round(height * 0.545);
  const textY = Math.round(height * 0.705);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="We Connect logo"
    >
      <defs>
        <linearGradient id={`lg-top-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colorStart} />
          <stop offset="100%" stopColor={colorEnd} />
        </linearGradient>
        <linearGradient id={`lg-bot-${idSuffix}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colorEnd} />
          <stop offset="100%" stopColor={colorStart} />
        </linearGradient>
      </defs>

      {/* Fond subtil */}
      <rect x="0" y="0" width={width} height={height} fill={frameFill} />
      {/* Cadre principal */}
      <rect x="0" y="0" width={width} height={height} fill="none" stroke={frameStroke} strokeWidth="1" />
      {/* Cadre intérieur fin */}
      <rect x="4" y="4" width={width - 8} height={height - 8} fill="none" stroke={innerStroke} strokeWidth="0.5" />

      {/* Coins — bas gauche */}
      <line x1="0" y1={height} x2={cornerH} y2={height} stroke={`url(#lg-top-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />
      <line x1="0" y1={height} x2="0" y2={height - cornerV} stroke={`url(#lg-top-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />
      {/* Coins — bas droit */}
      <line x1={width} y1={height} x2={width - cornerH} y2={height} stroke={`url(#lg-top-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />
      <line x1={width} y1={height} x2={width} y2={height - cornerV} stroke={`url(#lg-top-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />

      {/* Coins — haut gauche */}
      <line x1="0" y1="0" x2={cornerH} y2="0" stroke={`url(#lg-bot-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />
      <line x1="0" y1="0" x2="0" y2={cornerV} stroke={`url(#lg-bot-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />
      {/* Coins — haut droit */}
      <line x1={width} y1="0" x2={width - cornerH} y2="0" stroke={`url(#lg-bot-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />
      <line x1={width} y1="0" x2={width} y2={cornerV} stroke={`url(#lg-bot-${idSuffix})`} strokeWidth={sw} strokeLinecap="square" />

      {/* WC outline gradient */}
      <text
        x={width / 2}
        y={textY}
        textAnchor="middle"
        fill="none"
        stroke={`url(#lg-top-${idSuffix})`}
        strokeWidth="2"
        strokeLinejoin="round"
        fontFamily="Syne, sans-serif"
        fontWeight="800"
        fontSize={fontSize}
        letterSpacing="-3"
      >
        WC
      </text>
    </svg>
  );
}
