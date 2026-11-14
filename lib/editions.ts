// Card editions shown on the landing page: the physical card design (taken from the
// existing site) and the environment the hero adopts when that edition is selected.
// Editions are visual finishes — they are not the Standard / Pro / Prestige offers.

export interface EditionCard {
  bg:     string;   // card face
  accent: string;
  line:   string;   // bottom accent line
  chip:   string;
  edge:   string;   // card thickness colour
  person: { name: string; title: string };
}

export interface EditionTheme {
  dark:       boolean;
  background: string;   // section background (halos included)
  text:       string;
  muted:      string;
  accent:     string;   // highlighted title words, active dot
  ctaBg:      string;
  ctaText:    string;
  line:       string;   // borders of secondary buttons / panels
  panel:      string;   // translucent surfaces (modules panel, chips)
  bubble:     string;
  bubbleEdge: string;
  shadow:     string;   // floor shadow under the selected card
  glow:       string;   // glow around the selected card
}

export interface Edition {
  key:         'midnight' | 'electric' | 'glass' | 'metal';
  name:        string;
  description: string;
  traits:      [string, string];
  card:        EditionCard;
  theme:       EditionTheme;
}

export const EDITIONS: Edition[] = [
  {
    key: 'midnight',
    name: 'Midnight',
    description: 'Le noir profond relevé d’une ligne indigo. Une présence élégante, sans un mot de trop.',
    traits: ['Noir profond', 'Accent indigo'],
    card: {
      bg: 'linear-gradient(135deg, #0D0E14 0%, #181B26 100%)', accent: '#6366F1',
      line: 'linear-gradient(90deg, #6366F1, #06B6D4)', chip: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
      edge: '#05060A', person: { name: 'Sophie Martin', title: 'CEO & Founder' },
    },
    theme: {
      dark: true,
      background:
        'radial-gradient(60% 55% at 72% 38%, rgba(203,213,225,0.16) 0%, transparent 70%),' +
        'radial-gradient(45% 40% at 18% 85%, rgba(99,102,241,0.16) 0%, transparent 70%),' +
        'linear-gradient(160deg, #23262E 0%, #111318 45%, #06070A 100%)',
      text: '#F8FAFC', muted: '#B4BAC5', accent: '#D7DCE5',
      ctaBg: '#F8FAFC', ctaText: '#0B0C10', line: 'rgba(255,255,255,0.22)', panel: 'rgba(255,255,255,0.06)',
      bubble: 'rgba(203,213,225,0.10)', bubbleEdge: 'rgba(226,232,240,0.22)',
      shadow: 'rgba(0,0,0,0.75)', glow: 'rgba(99,102,241,0.30)',
    },
  },
  {
    key: 'electric',
    name: 'Electric',
    description: 'Un indigo intense traversé de reflets violets. Une signature qui ne passe pas inaperçue.',
    traits: ['Indigo intense', 'Reflets violets'],
    card: {
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #4338CA 100%)', accent: '#818CF8',
      line: 'linear-gradient(90deg, #818CF8, #C084FC)', chip: 'linear-gradient(135deg, #C084FC, #818CF8)',
      edge: '#140F3A', person: { name: 'Marcus Chen', title: 'Product Designer' },
    },
    theme: {
      dark: true,
      background:
        'radial-gradient(55% 50% at 72% 40%, rgba(34,211,238,0.30) 0%, transparent 70%),' +
        'radial-gradient(50% 45% at 15% 90%, rgba(129,140,248,0.30) 0%, transparent 70%),' +
        'linear-gradient(160deg, #1D4ED8 0%, #1E3A8A 50%, #0B1A5C 100%)',
      text: '#FFFFFF', muted: '#C7D2FE', accent: '#67E8F9',
      ctaBg: '#22D3EE', ctaText: '#071541', line: 'rgba(199,210,254,0.40)', panel: 'rgba(255,255,255,0.09)',
      bubble: 'rgba(103,232,249,0.12)', bubbleEdge: 'rgba(165,243,252,0.30)',
      shadow: 'rgba(3,8,40,0.70)', glow: 'rgba(34,211,238,0.35)',
    },
  },
  {
    key: 'glass',
    name: 'Glass',
    description: 'Un bleu nuit éclairé de cyan. Une allure moderne, nette et lumineuse.',
    traits: ['Bleu nuit', 'Lueur cyan'],
    card: {
      bg: 'linear-gradient(135deg, #0c1a2e 0%, #0e2340 100%)', accent: '#06B6D4',
      line: 'linear-gradient(90deg, #06B6D4, #3B82F6)', chip: 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
      edge: '#06101E', person: { name: 'Léa Dubois', title: 'Sales Director' },
    },
    theme: {
      dark: false,
      background:
        'radial-gradient(55% 50% at 72% 40%, rgba(255,255,255,0.95) 0%, transparent 70%),' +
        'radial-gradient(50% 45% at 15% 88%, rgba(167,139,250,0.28) 0%, transparent 70%),' +
        'linear-gradient(160deg, #F7F5FF 0%, #ECE8FF 50%, #DCD5FA 100%)',
      text: '#1E1B4B', muted: '#4C4A6B', accent: '#4F46E5',
      ctaBg: '#4F46E5', ctaText: '#FFFFFF', line: 'rgba(30,27,75,0.20)', panel: 'rgba(255,255,255,0.62)',
      bubble: 'rgba(255,255,255,0.45)', bubbleEdge: 'rgba(124,111,227,0.28)',
      shadow: 'rgba(55,40,140,0.35)', glow: 'rgba(6,182,212,0.28)',
    },
  },
  {
    key: 'metal',
    name: 'Métal',
    description: 'Le graphite et l’argent pour une allure exclusive, sobre et affirmée.',
    traits: ['Graphite', 'Reflets argentés'],
    card: {
      bg: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)', accent: '#9CA3AF',
      line: 'linear-gradient(90deg, #9CA3AF, #6B7280)', chip: 'linear-gradient(135deg, #D1D5DB, #9CA3AF)',
      edge: '#0A0A0A', person: { name: 'Alex Torres', title: 'CTO' },
    },
    theme: {
      dark: true,
      background:
        'radial-gradient(50% 45% at 60% 0%, rgba(255,255,255,0.22) 0%, transparent 70%),' +
        'radial-gradient(45% 40% at 85% 75%, rgba(156,163,175,0.18) 0%, transparent 70%),' +
        'linear-gradient(170deg, #4A4F57 0%, #2A2D33 45%, #141518 100%)',
      text: '#F3F4F6', muted: '#C9CDD3', accent: '#E5E7EB',
      ctaBg: '#E5E7EB', ctaText: '#111214', line: 'rgba(229,231,235,0.30)', panel: 'rgba(255,255,255,0.07)',
      bubble: 'rgba(229,231,235,0.08)', bubbleEdge: 'rgba(229,231,235,0.22)',
      shadow: 'rgba(0,0,0,0.70)', glow: 'rgba(229,231,235,0.18)',
    },
  },
];

/** CSS custom properties applied to the hero for the selected edition. */
export function editionVars(e: Edition): Record<string, string> {
  const t = e.theme;
  return {
    '--hx-text': t.text, '--hx-muted': t.muted, '--hx-accent': t.accent,
    '--hx-cta-bg': t.ctaBg, '--hx-cta-text': t.ctaText, '--hx-line': t.line, '--hx-panel': t.panel,
    '--hx-bubble': t.bubble, '--hx-bubble-edge': t.bubbleEdge, '--hx-shadow': t.shadow, '--hx-glow': t.glow,
    // Text flips where both colours read best on the cross-fading background:
    // early when going to a light edition, later when going back to a dark one.
    '--hx-color-delay': t.dark ? '260ms' : '40ms',
  };
}
