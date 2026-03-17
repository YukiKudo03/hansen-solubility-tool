/**
 * テーマ管理 — MD3準拠のライト/ダークモード
 */

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Surface
  surface: string;
  surfaceDim: string;
  surfaceContainerLowest: string;
  surfaceContainerLow: string;
  surfaceContainer: string;
  surfaceContainerHigh: string;
  surfaceContainerHighest: string;
  onSurface: string;
  onSurfaceVariant: string;
  // Primary
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  // Outline
  outline: string;
  outlineVariant: string;
  // Error
  error: string;
  onError: string;
}

export const THEMES: Record<'light' | 'dark', ThemeColors> = {
  light: {
    surface: '#F8F9FF',
    surfaceDim: '#D8DAE0',
    surfaceContainerLowest: '#FFFFFF',
    surfaceContainerLow: '#F2F3F9',
    surfaceContainer: '#ECEDF3',
    surfaceContainerHigh: '#E6E8EE',
    surfaceContainerHighest: '#E1E2E8',
    onSurface: '#191C20',
    onSurfaceVariant: '#43474E',
    primary: '#1976D2',
    onPrimary: '#FFFFFF',
    primaryContainer: '#D1E4FF',
    outline: '#73777F',
    outlineVariant: '#C3C7CF',
    error: '#BA1A1A',
    onError: '#FFFFFF',
  },
  dark: {
    surface: '#111318',
    surfaceDim: '#111318',
    surfaceContainerLowest: '#0C0E13',
    surfaceContainerLow: '#191C20',
    surfaceContainer: '#1D2024',
    surfaceContainerHigh: '#282A2F',
    surfaceContainerHighest: '#33353A',
    onSurface: '#E1E2E8',
    onSurfaceVariant: '#C3C7CF',
    primary: '#A0CAFD',
    onPrimary: '#003258',
    primaryContainer: '#00497D',
    outline: '#8D9199',
    outlineVariant: '#43474E',
    error: '#FFB4AB',
    onError: '#690005',
  },
};

export function getThemeColors(mode: 'light' | 'dark'): ThemeColors {
  return THEMES[mode];
}

export function isValidTheme(value: string): value is ThemeMode {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * テーマの CSS 変数を生成する
 */
export function generateThemeCssVars(mode: 'light' | 'dark'): Record<string, string> {
  const colors = THEMES[mode];
  return {
    '--md3-surface': colors.surface,
    '--md3-surface-dim': colors.surfaceDim,
    '--md3-surface-container-lowest': colors.surfaceContainerLowest,
    '--md3-surface-container-low': colors.surfaceContainerLow,
    '--md3-surface-container': colors.surfaceContainer,
    '--md3-surface-container-high': colors.surfaceContainerHigh,
    '--md3-surface-container-highest': colors.surfaceContainerHighest,
    '--md3-on-surface': colors.onSurface,
    '--md3-on-surface-variant': colors.onSurfaceVariant,
    '--md3-primary': colors.primary,
    '--md3-on-primary': colors.onPrimary,
    '--md3-primary-container': colors.primaryContainer,
    '--md3-outline': colors.outline,
    '--md3-outline-variant': colors.outlineVariant,
    '--md3-error': colors.error,
    '--md3-on-error': colors.onError,
  };
}
