'use client';

import { HTMLAttributes, ReactNode } from 'react';

type Padding = 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: Padding;
  hover?: boolean;
  glowOnHover?: boolean;
  className?: string;
}

const paddingMap: Record<Padding, string> = {
  sm: 'p-5',
  md: 'p-7',
  lg: 'p-10',
};

export default function Card({
  children,
  padding = 'md',
  hover = false,
  glowOnHover = false,
  className = '',
  style,
  ...props
}: CardProps) {
  return (
    <div
      style={{
        background: '#181B26',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '8px',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        ...style,
      }}
      className={`
        ${paddingMap[padding]}
        ${hover ? 'hover:-translate-y-0.5 hover:border-electric/30 cursor-pointer' : ''}
        ${glowOnHover ? 'hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
