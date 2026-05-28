export const THEMES = {
  slate:   { label: 'Ardoise', hex: '#0f172a', hover: '#334155', light: '#f1f5f9', lightText: '#475569', chart1: '#0f172a', chart2: '#94a3b8' },
  blue:    { label: 'Bleu',    hex: '#1d4ed8', hover: '#1e40af', light: '#dbeafe', lightText: '#1e40af', chart1: '#1d4ed8', chart2: '#93c5fd' },
  emerald: { label: 'Vert',   hex: '#059669', hover: '#047857', light: '#d1fae5', lightText: '#065f46', chart1: '#059669', chart2: '#6ee7b7' },
  violet:  { label: 'Violet', hex: '#7c3aed', hover: '#6d28d9', light: '#ede9fe', lightText: '#5b21b6', chart1: '#7c3aed', chart2: '#c4b5fd' },
  orange:  { label: 'Orange', hex: '#ea580c', hover: '#c2410c', light: '#ffedd5', lightText: '#9a3412', chart1: '#ea580c', chart2: '#fdba74' },
  rose:    { label: 'Rose',   hex: '#e11d48', hover: '#be123c', light: '#ffe4e6', lightText: '#9f1239', chart1: '#e11d48', chart2: '#fda4af' },
} as const;

export type ThemeKey = keyof typeof THEMES;
export type Theme = typeof THEMES[ThemeKey];
