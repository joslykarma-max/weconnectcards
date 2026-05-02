/**
 * Shared inline-style primitives for dashboard forms.
 * Import where you need consistent input/label/card styling.
 */

import type { CSSProperties } from 'react';

export const inputStyle: CSSProperties = {
  width:           '100%',
  boxSizing:       'border-box',
  background:      'rgba(255,255,255,0.03)',
  border:          '1px solid rgba(255,255,255,0.1)',
  borderRadius:    6,
  padding:         '10px 14px',
  color:           '#F8F9FC',
  fontFamily:      'DM Sans, sans-serif',
  fontSize:        14,
  outline:         'none',
};

export const labelStyle: CSSProperties = {
  fontFamily:    'Space Mono, monospace',
  fontSize:      9,
  letterSpacing: 2,
  color:         '#6B7280',
  textTransform: 'uppercase',
  display:       'block',
  marginBottom:  6,
};

export const cardStyle: CSSProperties = {
  background:   '#12141C',
  border:       '1px solid rgba(255,255,255,0.07)',
  borderRadius: 10,
  padding:      '20px 24px',
};

export const sectionLabel: CSSProperties = {
  fontFamily:    'Space Mono, monospace',
  fontSize:      9,
  letterSpacing: 3,
  color:         '#6B7280',
  textTransform: 'uppercase',
  marginBottom:  16,
};
