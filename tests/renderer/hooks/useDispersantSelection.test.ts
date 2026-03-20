// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDispersants, useDispersantSelection } from '../../../src/renderer/hooks/useDispersantSelection';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useDispersants', () => {
  it('初期状態はloading=true', () => {
    mockApi.getAllDispersants.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDispersants());
    expect(result.current.loading).toBe(true);
    expect(result.current.dispersants).toEqual([]);
  });

  it('ロード完了でdispersantsが格納される', async () => {
    const data = [{ id: 1, name: 'BYK-163' }];
    mockApi.getAllDispersants.mockResolvedValue(data);
    const { result } = renderHook(() => useDispersants());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    expect(result.current.dispersants).toEqual(data);
  });
});

describe('useDispersantSelection', () => {
  it('初期状態はすべてnull, loading=false', () => {
    const { result } = renderHook(() => useDispersantSelection());
    expect(result.current.screenResult).toBeNull();
    expect(result.current.solventResult).toBeNull();
    expect(result.current.fallbackResult).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  // screenDispersants
  it('screenDispersants成功でscreenResultに結果', async () => {
    const evalResult = { particle: {}, solvent: {}, results: [] };
    mockApi.screenDispersants.mockResolvedValue(evalResult);
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenDispersants(1, 2);
    });

    expect(result.current.screenResult).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(mockApi.screenDispersants).toHaveBeenCalledWith(1, 2);
  });

  it('screenDispersants失敗でerrorにメッセージ', async () => {
    mockApi.screenDispersants.mockRejectedValue(new Error('テストエラー'));
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenDispersants(1, 2);
    });

    expect(result.current.error).toBe('テストエラー');
  });

  it('screenDispersants失敗時にError以外でデフォルトメッセージ', async () => {
    mockApi.screenDispersants.mockRejectedValue(42);
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenDispersants(1, 2);
    });

    expect(result.current.error).toBe('分散剤スクリーニング中にエラーが発生しました');
  });

  // screenSolvents
  it('screenSolvents成功でsolventResultに結果', async () => {
    const evalResult = { particle: {}, dispersant: {}, results: [] };
    mockApi.screenSolventsForDispersant.mockResolvedValue(evalResult);
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenSolvents(1, 3);
    });

    expect(result.current.solventResult).toEqual(evalResult);
    expect(result.current.screenResult).toBeNull();
  });

  it('screenSolvents失敗でerrorにメッセージ', async () => {
    mockApi.screenSolventsForDispersant.mockRejectedValue(new Error('溶媒エラー'));
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenSolvents(1, 3);
    });

    expect(result.current.error).toBe('溶媒エラー');
  });

  // screenFallback
  it('screenFallback成功でfallbackResultに結果', async () => {
    const fallback = [{ dispersant: {}, particle: {}, raOverall: 1.0, redOverall: 0.5, affinity: 1 }];
    mockApi.screenDispersantsFallback.mockResolvedValue(fallback);
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenFallback(1);
    });

    expect(result.current.fallbackResult).toEqual(fallback);
    expect(result.current.screenResult).toBeNull();
    expect(result.current.solventResult).toBeNull();
  });

  it('screenFallback失敗でerrorにメッセージ', async () => {
    mockApi.screenDispersantsFallback.mockRejectedValue(new Error('フォールバックエラー'));
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenFallback(1);
    });

    expect(result.current.error).toBe('フォールバックエラー');
  });

  // clear
  it('clear()で全stateがリセットされる', async () => {
    mockApi.screenDispersants.mockResolvedValue({ particle: {}, solvent: {}, results: [] });
    const { result } = renderHook(() => useDispersantSelection());

    await act(async () => {
      await result.current.screenDispersants(1, 2);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.screenResult).toBeNull();
    expect(result.current.solventResult).toBeNull();
    expect(result.current.fallbackResult).toBeNull();
    expect(result.current.error).toBeNull();
  });

  // loading state
  it('screenDispersants中はloading=true', async () => {
    mockApi.screenDispersants.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDispersantSelection());

    act(() => {
      result.current.screenDispersants(1, 2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });
});
