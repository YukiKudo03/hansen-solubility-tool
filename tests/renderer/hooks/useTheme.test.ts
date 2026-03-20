// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../../src/renderer/hooks/useTheme';

let matchMediaListeners: Array<() => void>;
let matchMediaMatches: boolean;

beforeEach(() => {
  matchMediaListeners = [];
  matchMediaMatches = false;
  localStorage.clear();

  // matchMedia mock
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchMediaMatches,
      media: query,
      addEventListener: vi.fn((_event: string, handler: () => void) => {
        matchMediaListeners.push(handler);
      }),
      removeEventListener: vi.fn(),
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('useTheme', () => {
  it('初期状態: mode=light, resolved=light（localStorage空）', () => {
    const { result } = renderHook(() => useTheme());

    expect(result.current.mode).toBe('light');
    expect(result.current.resolved).toBe('light');
  });

  it('localStorageに保存済みのテーマを読み込む', () => {
    localStorage.setItem('theme-mode', 'dark');
    const { result } = renderHook(() => useTheme());

    expect(result.current.mode).toBe('dark');
    expect(result.current.resolved).toBe('dark');
  });

  it('localStorageの無効な値はlightにフォールバック', () => {
    localStorage.setItem('theme-mode', 'invalid');
    const { result } = renderHook(() => useTheme());

    expect(result.current.mode).toBe('light');
  });

  it('setModeでlocalStorageに保存される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => { result.current.setMode('dark'); });

    expect(result.current.mode).toBe('dark');
    expect(localStorage.getItem('theme-mode')).toBe('dark');
  });

  it('setMode(system)でシステムテーマが反映される（dark環境）', () => {
    matchMediaMatches = true;
    const { result } = renderHook(() => useTheme());

    act(() => { result.current.setMode('system'); });

    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('dark');
  });

  it('setMode(system)でシステムテーマが反映される（light環境）', () => {
    matchMediaMatches = false;
    const { result } = renderHook(() => useTheme());

    act(() => { result.current.setMode('system'); });

    expect(result.current.mode).toBe('system');
    expect(result.current.resolved).toBe('light');
  });

  it('applyThemeでdocument.documentElementにクラスとCSS変数が適用される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => { result.current.setMode('dark'); });

    const root = document.documentElement;
    expect(root.classList.contains('dark')).toBe(true);
    expect(root.style.getPropertyValue('--md3-primary')).toBeTruthy();
  });

  it('lightモードではdarkクラスが除去される', () => {
    const { result } = renderHook(() => useTheme());

    act(() => { result.current.setMode('dark'); });
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    act(() => { result.current.setMode('light'); });
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
