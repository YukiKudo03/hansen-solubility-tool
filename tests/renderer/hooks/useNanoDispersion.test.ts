// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useNanoDispersion } from '../../../src/renderer/hooks/useNanoDispersion';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useNanoDispersion', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useNanoDispersion());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('screenAll成功でresultに結果が格納される', async () => {
    const evalResult = { nanoParticle: {}, results: [] };
    mockApi.screenAllSolvents.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenAll(1);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockApi.screenAllSolvents).toHaveBeenCalledWith(1);
  });

  it('screenAll中はloading=true', async () => {
    mockApi.screenAllSolvents.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useNanoDispersion());

    act(() => {
      result.current.screenAll(1);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('screenAll失敗でerrorにメッセージ', async () => {
    mockApi.screenAllSolvents.mockRejectedValue(new Error('分散エラー'));
    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenAll(1);
    });

    expect(result.current.error).toBe('分散エラー');
    expect(result.current.result).toBeNull();
  });

  it('screenAll失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.screenAllSolvents.mockRejectedValue('unknown');
    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenAll(1);
    });

    expect(result.current.error).toBe('評価に失敗しました');
  });

  it('screenFiltered成功でresultに結果が格納される', async () => {
    const evalResult = { nanoParticle: {}, results: [] };
    mockApi.screenFilteredSolvents.mockResolvedValue(evalResult);

    const constraints = { maxBoilingPoint: 150 };
    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenFiltered(1, constraints);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(mockApi.screenFilteredSolvents).toHaveBeenCalledWith(1, constraints);
  });

  it('screenFiltered失敗でerrorにメッセージ', async () => {
    mockApi.screenFilteredSolvents.mockRejectedValue(new Error('フィルタエラー'));
    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenFiltered(1, {});
    });

    expect(result.current.error).toBe('フィルタエラー');
    expect(result.current.result).toBeNull();
  });

  it('screenFiltered失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.screenFilteredSolvents.mockRejectedValue(42);
    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenFiltered(1, {});
    });

    expect(result.current.error).toBe('評価に失敗しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    mockApi.screenAllSolvents.mockResolvedValue({ nanoParticle: {}, results: [] });
    const { result } = renderHook(() => useNanoDispersion());

    await act(async () => {
      await result.current.screenAll(1);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
