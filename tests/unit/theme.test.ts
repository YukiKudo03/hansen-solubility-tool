import { describe, it, expect } from 'vitest';
import { THEMES, getThemeColors, isValidTheme } from '../../src/core/theme';
import type { ThemeMode } from '../../src/core/theme';

describe('THEMES', () => {
  it('light テーマが定義されている', () => {
    expect(THEMES.light).toBeDefined();
    expect(THEMES.light.surface).toBeTruthy();
    expect(THEMES.light.onSurface).toBeTruthy();
  });

  it('dark テーマが定義されている', () => {
    expect(THEMES.dark).toBeDefined();
    expect(THEMES.dark.surface).toBeTruthy();
    expect(THEMES.dark.onSurface).toBeTruthy();
  });

  it('light と dark の surface 色が異なる', () => {
    expect(THEMES.light.surface).not.toBe(THEMES.dark.surface);
  });
});

describe('getThemeColors', () => {
  it('light モードで light テーマの色を返す', () => {
    const colors = getThemeColors('light');
    expect(colors.surface).toBe(THEMES.light.surface);
  });

  it('dark モードで dark テーマの色を返す', () => {
    const colors = getThemeColors('dark');
    expect(colors.surface).toBe(THEMES.dark.surface);
  });
});

describe('isValidTheme', () => {
  it('light は有効', () => {
    expect(isValidTheme('light')).toBe(true);
  });

  it('dark は有効', () => {
    expect(isValidTheme('dark')).toBe(true);
  });

  it('system は有効', () => {
    expect(isValidTheme('system')).toBe(true);
  });

  it('無効な値は false', () => {
    expect(isValidTheme('invalid')).toBe(false);
  });
});
