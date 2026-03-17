import { useState, useEffect, useCallback } from 'react';
import type { ThemeMode } from '../../core/theme';
import { isValidTheme, generateThemeCssVars } from '../../core/theme';

const STORAGE_KEY = 'theme-mode';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

export function useTheme() {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && isValidTheme(saved) ? saved : 'light';
  });

  const resolved = getResolvedTheme(mode);

  const applyTheme = useCallback((resolvedMode: 'light' | 'dark') => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolvedMode === 'dark');
    const vars = generateThemeCssVars(resolvedMode);
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value);
    }
  }, []);

  useEffect(() => {
    applyTheme(resolved);
  }, [resolved, applyTheme]);

  // システムテーマ変更を監視
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode, applyTheme]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(STORAGE_KEY, newMode);
  }, []);

  return { mode, resolved, setMode };
}
