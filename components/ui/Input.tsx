'use client';

import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftElement?: ReactNode;
  rightElement?: ReactNode;
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const inputBaseStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '6px',
  padding: '10px 14px',
  color: '#F8F9FC',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '14px',
  width: '100%',
  transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
  outline: 'none',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  hint,
  leftElement,
  rightElement,
  className = '',
  style,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#9CA3AF',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {leftElement && (
          <div style={{ position: 'absolute', left: 12, color: '#6B7280', pointerEvents: 'none' }}>
            {leftElement}
          </div>
        )}
        <input
          ref={ref}
          style={{
            ...inputBaseStyle,
            paddingLeft: leftElement ? 40 : 14,
            paddingRight: rightElement ? 40 : 14,
            borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
            ...style,
          }}
          className={className}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#6366F1';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)';
            e.currentTarget.style.boxShadow = 'none';
            props.onBlur?.(e);
          }}
          {...props}
        />
        {rightElement && (
          <div style={{ position: 'absolute', right: 12, color: '#6B7280' }}>
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p style={{ color: '#EF4444', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p style={{ color: '#6B7280', fontSize: '12px', fontFamily: 'DM Sans, sans-serif' }}>
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  hint,
  className = '',
  style,
  ...props
}, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          style={{
            fontFamily: 'Space Mono, monospace',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#9CA3AF',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        style={{
          ...inputBaseStyle,
          resize: 'vertical',
          minHeight: 100,
          borderColor: error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)',
          ...style,
        }}
        className={className}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = '#6366F1';
          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)';
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
        {...props}
      />
      {error && <p style={{ color: '#EF4444', fontSize: '12px' }}>{error}</p>}
      {hint && !error && <p style={{ color: '#6B7280', fontSize: '12px' }}>{hint}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Input;
