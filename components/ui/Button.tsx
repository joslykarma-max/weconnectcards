'use client';

import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'danger' | 'gradient' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantStyles: Record<Variant, string> = {
  primary:   'bg-electric text-white hover:brightness-110 border border-transparent',
  gradient:  'text-white border border-transparent',
  ghost:     'bg-transparent text-electric border border-electric hover:bg-electric/10',
  secondary: 'bg-surface text-white border border-border hover:border-border-accent',
  danger:    'bg-transparent text-red-400 border border-red-500/40 hover:bg-red-500/10',
};

const sizeStyles: Record<Size, string> = {
  sm: 'px-4 py-1.5 text-xs gap-1.5',
  md: 'px-6 py-2.5 text-sm gap-2',
  lg: 'px-8 py-3.5 text-base gap-2.5',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  style,
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  const gradientStyle = variant === 'gradient'
    ? { background: 'linear-gradient(135deg, #4338CA, #6366F1, #818CF8)' }
    : {};

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      style={{
        fontFamily: 'DM Sans, sans-serif',
        borderRadius: '6px',
        fontWeight: 500,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.4 : 1,
        ...gradientStyle,
        ...style,
      }}
      className={`${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
        props.onMouseLeave?.(e);
      }}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
        </svg>
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
