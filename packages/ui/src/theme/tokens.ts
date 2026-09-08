/**
 * Primitive design tokens — the raw scales. Semantic meaning (what is a
 * "surface", what is "danger") is assigned in theme.ts. Components never read
 * these directly; they read the semantic theme via `useTheme()`.
 */

export const palette = {
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',

  // Neutral (slate)
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Brand (teal)
  teal50: '#F0FDFA',
  teal100: '#CCFBF1',
  teal200: '#99F6E4',
  teal300: '#5EEAD4',
  teal400: '#2DD4BF',
  teal500: '#14B8A6',
  teal600: '#0D9488',
  teal700: '#0F766E',
  teal800: '#115E59',
  teal900: '#134E4A',

  // Semantic bases
  green100: '#DCFCE7',
  green500: '#22C55E',
  green600: '#16A34A',
  green700: '#15803D',

  amber100: '#FEF3C7',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber700: '#B45309',

  red100: '#FEE2E2',
  red500: '#EF4444',
  red600: '#DC2626',
  red700: '#B91C1C',

  blue100: '#DBEAFE',
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue700: '#1D4ED8',

  violet100: '#EDE9FE',
  violet500: '#8B5CF6',
  violet600: '#7C3AED',
} as const;

/** 4px base spacing scale. */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

export const radii = {
  none: 0,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

export const fontSizes = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
} as const;

export const lineHeights = {
  xs: 16,
  sm: 18,
  base: 22,
  md: 24,
  lg: 26,
  xl: 30,
  '2xl': 36,
  '3xl': 42,
} as const;

export const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/** Named text variants used by the Text primitive. */
export const typography = {
  display: { fontSize: fontSizes['3xl'], lineHeight: lineHeights['3xl'], fontWeight: fontWeights.bold },
  h1: { fontSize: fontSizes['2xl'], lineHeight: lineHeights['2xl'], fontWeight: fontWeights.bold },
  h2: { fontSize: fontSizes.xl, lineHeight: lineHeights.xl, fontWeight: fontWeights.semibold },
  h3: { fontSize: fontSizes.lg, lineHeight: lineHeights.lg, fontWeight: fontWeights.semibold },
  title: { fontSize: fontSizes.md, lineHeight: lineHeights.md, fontWeight: fontWeights.semibold },
  body: { fontSize: fontSizes.base, lineHeight: lineHeights.base, fontWeight: fontWeights.regular },
  bodyStrong: { fontSize: fontSizes.base, lineHeight: lineHeights.base, fontWeight: fontWeights.medium },
  label: { fontSize: fontSizes.sm, lineHeight: lineHeights.sm, fontWeight: fontWeights.medium },
  caption: { fontSize: fontSizes.xs, lineHeight: lineHeights.xs, fontWeight: fontWeights.regular },
  overline: {
    fontSize: fontSizes.xs,
    lineHeight: lineHeights.xs,
    fontWeight: fontWeights.semibold,
    letterSpacing: 0.6,
    textTransform: 'uppercase' as const,
  },
} as const;

export type TypographyVariant = keyof typeof typography;
export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radii;
