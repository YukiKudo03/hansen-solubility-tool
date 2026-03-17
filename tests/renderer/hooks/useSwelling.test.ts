// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSwelling } from '../../../src/renderer/hooks/useSwelling';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useSwelling', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useSwelling());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate成功でresultに結果が格納される', async () => {
    const evalResult = { partsGroup: {}, results: [] };
    mockApi.evaluateSwelling.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useSwelling());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockApi.evaluateSwelling).toHaveBeenCalledWith(1, 2);
  });

  it('evaluate中はloading=true', async () => {
    mockApi.evaluateSwelling.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useSwelling());

    act(() => {
      result.current.evaluate(1, 2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('evaluate失敗でerrorにメッセージ', async () => {
    mockApi.evaluateSwelling.mockRejectedValue(new Error('膨潤エラー'));
    const { result } = renderHook(() => useSwelling());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('膨潤エラー');
    expect(result.current.result).toBeNull();
  });

  it('evaluate失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.evaluateSwelling.mockRejectedValue('unknown');
    const { result } = renderHook(() => useSwelling());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('膨潤度予測中にエラーが発生しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    mockApi.evaluateSwelling.mockResolvedValue({ partsGroup: {}, results: [] });
    const { result } = renderHook(() => useSwelling());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
