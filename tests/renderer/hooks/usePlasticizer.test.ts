// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePlasticizer } from '../../../src/renderer/hooks/usePlasticizer';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('usePlasticizer', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => usePlasticizer());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('screen成功でresultに結果が格納される', async () => {
    const evalResult = { part: {}, results: [] };
    mockApi.screenPlasticizers.mockResolvedValue(evalResult);

    const { result } = renderHook(() => usePlasticizer());

    await act(async () => {
      await result.current.screen(1, 2);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockApi.screenPlasticizers).toHaveBeenCalledWith(1, 2);
  });

  it('screen中はloading=true', async () => {
    mockApi.screenPlasticizers.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => usePlasticizer());

    act(() => {
      result.current.screen(1, 2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('screen失敗でerrorにメッセージ', async () => {
    mockApi.screenPlasticizers.mockRejectedValue(new Error('可塑剤エラー'));
    const { result } = renderHook(() => usePlasticizer());

    await act(async () => {
      await result.current.screen(1, 2);
    });

    expect(result.current.error).toBe('可塑剤エラー');
    expect(result.current.result).toBeNull();
  });

  it('screen失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.screenPlasticizers.mockRejectedValue('unknown');
    const { result } = renderHook(() => usePlasticizer());

    await act(async () => {
      await result.current.screen(1, 2);
    });

    expect(result.current.error).toBe('可塑剤スクリーニング中にエラーが発生しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    mockApi.screenPlasticizers.mockResolvedValue({ part: {}, results: [] });
    const { result } = renderHook(() => usePlasticizer());

    await act(async () => {
      await result.current.screen(1, 2);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
