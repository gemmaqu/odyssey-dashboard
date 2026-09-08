import type { OrderStatus } from '@odyssey/types';
import type { ViewStyle } from 'react-native';
import {
  fontSizes,
  fontWeights,
  lineHeights,
  palette,
  radii,
  spacing,
  typography,
} from './tokens';

/** Semantic color roles. Components reference these, never raw palette values. */
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceHover: string;
  border: string;
  borderStrong: string;

  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;

  primary: string;
  primaryHover: string;
  primaryActive: string;
  primarySubtle: string;
  onPrimary: string;

  success: string;
  successSubtle: string;
  warning: string;
  warningSubtle: string;
  danger: string;
  dangerHover: string;
  dangerSubtle: string;
  onDanger: string;
  info: string;
  infoSubtle: string;

  focusRing: string;
  overlay: string;
}

export interface StatusColor {
  fg: string;
  bg: string;
  dot: string;
}

export interface Theme {
  name: 'light' | 'dark';
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  typography: typeof typography;
  shadows: {
    sm: ViewStyle;
    md: ViewStyle;
    lg: ViewStyle;
  };
  status: Record<OrderStatus, StatusColor>;
}

const shared = { spacing, radii, fontSizes, fontWeights, lineHeights, typography };

export const lightTheme: Theme = {
  name: 'light',
  ...shared,
  colors: {
    background: palette.slate100,
    surface: palette.white,
    surfaceAlt: palette.slate50,
    surfaceHover: palette.slate100,
    border: palette.slate200,
    borderStrong: palette.slate300,

    text: palette.slate900,
    textMuted: palette.slate600,
    textSubtle: palette.slate400,
    textInverse: palette.white,

    primary: palette.teal600,
    primaryHover: palette.teal700,
    primaryActive: palette.teal800,
    primarySubtle: palette.teal50,
    onPrimary: palette.white,

    success: palette.green600,
    successSubtle: palette.green100,
    warning: palette.amber600,
    warningSubtle: palette.amber100,
    danger: palette.red600,
    dangerHover: palette.red700,
    dangerSubtle: palette.red100,
    onDanger: palette.white,
    info: palette.blue600,
    infoSubtle: palette.blue100,

    focusRing: palette.teal500,
    overlay: 'rgba(15, 23, 42, 0.45)',
  },
  shadows: {
    sm: {
      shadowColor: palette.slate900,
      shadowOpacity: 0.06,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    md: {
      shadowColor: palette.slate900,
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    lg: {
      shadowColor: palette.slate900,
      shadowOpacity: 0.16,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  },
  status: {
    pending: { fg: palette.amber700, bg: palette.amber100, dot: palette.amber500 },
    accepted: { fg: palette.blue700, bg: palette.blue100, dot: palette.blue500 },
    preparing: { fg: palette.violet600, bg: palette.violet100, dot: palette.violet500 },
    ready: { fg: palette.teal700, bg: palette.teal100, dot: palette.teal500 },
    completed: { fg: palette.green700, bg: palette.green100, dot: palette.green500 },
    cancelled: { fg: palette.slate600, bg: palette.slate200, dot: palette.slate400 },
  },
};

export const darkTheme: Theme = {
  name: 'dark',
  ...shared,
  colors: {
    background: palette.slate950,
    surface: palette.slate900,
    surfaceAlt: palette.slate800,
    surfaceHover: palette.slate800,
    border: palette.slate800,
    borderStrong: palette.slate700,

    text: palette.slate50,
    textMuted: palette.slate400,
    textSubtle: palette.slate500,
    textInverse: palette.slate900,

    primary: palette.teal500,
    primaryHover: palette.teal400,
    primaryActive: palette.teal300,
    primarySubtle: 'rgba(20, 184, 166, 0.14)',
    onPrimary: palette.slate950,

    success: palette.green500,
    successSubtle: 'rgba(34, 197, 94, 0.16)',
    warning: palette.amber400,
    warningSubtle: 'rgba(245, 158, 11, 0.16)',
    danger: palette.red500,
    dangerHover: palette.red600,
    dangerSubtle: 'rgba(239, 68, 68, 0.16)',
    onDanger: palette.white,
    info: palette.blue500,
    infoSubtle: 'rgba(59, 130, 246, 0.16)',

    focusRing: palette.teal400,
    overlay: 'rgba(2, 6, 23, 0.6)',
  },
  shadows: {
    sm: {
      shadowColor: palette.black,
      shadowOpacity: 0.3,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    md: {
      shadowColor: palette.black,
      shadowOpacity: 0.4,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    lg: {
      shadowColor: palette.black,
      shadowOpacity: 0.5,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
      elevation: 8,
    },
  },
  status: {
    pending: { fg: palette.amber400, bg: 'rgba(245, 158, 11, 0.16)', dot: palette.amber400 },
    accepted: { fg: palette.blue500, bg: 'rgba(59, 130, 246, 0.16)', dot: palette.blue500 },
    preparing: { fg: palette.violet500, bg: 'rgba(139, 92, 246, 0.18)', dot: palette.violet500 },
    ready: { fg: palette.teal300, bg: 'rgba(20, 184, 166, 0.18)', dot: palette.teal400 },
    completed: { fg: palette.green500, bg: 'rgba(34, 197, 94, 0.16)', dot: palette.green500 },
    cancelled: { fg: palette.slate400, bg: palette.slate800, dot: palette.slate500 },
  },
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
