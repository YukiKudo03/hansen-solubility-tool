// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useContactAngle } from '../../../src/renderer/hooks/useContactAngle';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useContactAngle', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useContactAngle());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate成功でresultに結果が格納される', async () => {
    const evalResult = { partsGroup: {}, results: [] };
    mockApi.estimateContactAngle.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(mockApi.estimateContactAngle).toHaveBeenCalledWith(1, 2);
  });

  it('evaluate中はloading=true', async () => {
    mockApi.estimateContactAngle.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useContactAngle());

    act(() => {
      result.current.evaluate(1, 2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('evaluate失敗でerrorにメッセージ', async () => {
    mockApi.estimateContactAngle.mockRejectedValue(new Error('接触角エラー'));
    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('接触角エラー');
    expect(result.current.result).toBeNull();
  });

  it('evaluate失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.estimateContactAngle.mockRejectedValue(42);
    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('接触角推定中にエラーが発生しました');
  });

  it('screenAll成功でresultに結果が格納される', async () => {
    const evalResult = { partsGroup: {}, results: [] };
    mockApi.screenContactAngle.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.screenAll(10, 20);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(mockApi.screenContactAngle).toHaveBeenCalledWith(10, 20);
  });

  it('screenAll失敗でerrorにメッセージ', async () => {
    mockApi.screenContactAngle.mockRejectedValue(new Error('スクリーニング失敗'));
    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.screenAll(10, 20);
    });

    expect(result.current.error).toBe('スクリーニング失敗');
  });

  it('screenAll失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.screenContactAngle.mockRejectedValue('unknown');
    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.screenAll(10, 20);
    });

    expect(result.current.error).toBe('スクリーニング中にエラーが発生しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    mockApi.estimateContactAngle.mockResolvedValue({ partsGroup: {}, results: [] });
    const { result } = renderHook(() => useContactAngle());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
