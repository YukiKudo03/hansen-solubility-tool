import { describe, it, expect } from 'vitest';
import { THEMES, getThemeColors, isValidTheme, generateThemeCssVars } from '../../src/core/theme';
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

describe('generateThemeCssVars', () => {
  it('light モードで全CSS変数を返す', () => {
    const vars = generateThemeCssVars('light');
    expect(vars['--md3-surface']).toBe(THEMES.light.surface);
    expect(vars['--md3-surface-dim']).toBe(THEMES.light.surfaceDim);
    expect(vars['--md3-surface-container-lowest']).toBe(THEMES.light.surfaceContainerLowest);
    expect(vars['--md3-surface-container-low']).toBe(THEMES.light.surfaceContainerLow);
    expect(vars['--md3-surface-container']).toBe(THEMES.light.surfaceContainer);
    expect(vars['--md3-surface-container-high']).toBe(THEMES.light.surfaceContainerHigh);
    expect(vars['--md3-surface-container-highest']).toBe(THEMES.light.surfaceContainerHighest);
    expect(vars['--md3-on-surface']).toBe(THEMES.light.onSurface);
    expect(vars['--md3-on-surface-variant']).toBe(THEMES.light.onSurfaceVariant);
    expect(vars['--md3-primary']).toBe(THEMES.light.primary);
    expect(vars['--md3-on-primary']).toBe(THEMES.light.onPrimary);
    expect(vars['--md3-primary-container']).toBe(THEMES.light.primaryContainer);
    expect(vars['--md3-outline']).toBe(THEMES.light.outline);
    expect(vars['--md3-outline-variant']).toBe(THEMES.light.outlineVariant);
    expect(vars['--md3-error']).toBe(THEMES.light.error);
    expect(vars['--md3-on-error']).toBe(THEMES.light.onError);
  });

  it('dark モードで全CSS変数を返す', () => {
    const vars = generateThemeCssVars('dark');
    expect(vars['--md3-surface']).toBe(THEMES.dark.surface);
    expect(vars['--md3-primary']).toBe(THEMES.dark.primary);
    expect(vars['--md3-error']).toBe(THEMES.dark.error);
    expect(vars['--md3-on-error']).toBe(THEMES.dark.onError);
  });

  it('返却オブジェクトに16のCSS変数が含まれる', () => {
    const vars = generateThemeCssVars('light');
    expect(Object.keys(vars).length).toBe(16);
  });

  it('全キーが--md3-プレフィックスで始まる', () => {
    const vars = generateThemeCssVars('dark');
    for (const key of Object.keys(vars)) {
      expect(key.startsWith('--md3-')).toBe(true);
    }
  });
});
