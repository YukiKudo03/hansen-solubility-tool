// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCarrierSelection } from '../../../src/renderer/hooks/useCarrierSelection';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useCarrierSelection', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useCarrierSelection());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate成功でresultに結果が格納される', async () => {
    const evalResult = { drug: {}, results: [] };
    mockApi.evaluateCarrier.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.evaluate(1, 2, 3);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(mockApi.evaluateCarrier).toHaveBeenCalledWith(1, 2, 3);
  });

  it('evaluate中はloading=true', async () => {
    mockApi.evaluateCarrier.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useCarrierSelection());

    act(() => {
      result.current.evaluate(1, 2, 3);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('evaluate失敗でerrorにメッセージ', async () => {
    mockApi.evaluateCarrier.mockRejectedValue(new Error('キャリアエラー'));
    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.evaluate(1, 2, 3);
    });

    expect(result.current.error).toBe('キャリアエラー');
  });

  it('evaluate失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.evaluateCarrier.mockRejectedValue('unknown');
    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.evaluate(1, 2, 3);
    });

    expect(result.current.error).toBe('キャリア評価中にエラーが発生しました');
  });

  it('screenAll成功でresultに結果が格納される', async () => {
    const evalResult = { drug: {}, results: [] };
    mockApi.screenCarriers.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.screenAll(1, 3);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(mockApi.screenCarriers).toHaveBeenCalledWith(1, 3);
  });

  it('screenAll失敗でerrorにメッセージ', async () => {
    mockApi.screenCarriers.mockRejectedValue(new Error('スクリーニング失敗'));
    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.screenAll(1, 3);
    });

    expect(result.current.error).toBe('スクリーニング失敗');
  });

  it('screenAll失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.screenCarriers.mockRejectedValue(42);
    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.screenAll(1, 3);
    });

    expect(result.current.error).toBe('キャリアスクリーニング中にエラーが発生しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    mockApi.evaluateCarrier.mockResolvedValue({ drug: {}, results: [] });
    const { result } = renderHook(() => useCarrierSelection());

    await act(async () => {
      await result.current.evaluate(1, 2, 3);
    });

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
