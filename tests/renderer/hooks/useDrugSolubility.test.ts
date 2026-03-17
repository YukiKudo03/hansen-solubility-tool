// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useDrugSolubility } from '../../../src/renderer/hooks/useDrugSolubility';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useDrugSolubility', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useDrugSolubility());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate成功でresultに結果が格納される', async () => {
    const evalResult = { drug: {}, results: [] };
    mockApi.evaluateDrugSolubility.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useDrugSolubility());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(mockApi.evaluateDrugSolubility).toHaveBeenCalledWith(1, 2);
  });

  it('evaluate中はloading=true', async () => {
    mockApi.evaluateDrugSolubility.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useDrugSolubility());

    act(() => {
      result.current.evaluate(1, 2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('evaluate失敗でerrorにメッセージ', async () => {
    mockApi.evaluateDrugSolubility.mockRejectedValue(new Error('溶解性エラー'));
    const { result } = renderHook(() => useDrugSolubility());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('溶解性エラー');
  });

  it('evaluate失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.evaluateDrugSolubility.mockRejectedValue('unknown');
    const { result } = renderHook(() => useDrugSolubility());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('薬物溶解性評価中にエラーが発生しました');
  });

  it('screenAll成功でresultに結果が格納される', async () => {
    const evalResult = { drug: {}, results: [] };
    mockApi.screenDrugSolvents.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useDrugSolubility());

    await act(async () => {
      await result.current.screenAll(1);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(mockApi.screenDrugSolvents).toHaveBeenCalledWith(1);
  });

  it('screenAll失敗でerrorにメッセージ', async () => {
    mockApi.screenDrugSolvents.mockRejectedValue(new Error('スクリーニング失敗'));
    const { result } = renderHook(() => useDrugSolubility());

    await act(async () => {
      await result.current.screenAll(1);
    });

    expect(result.current.error).toBe('スクリーニング失敗');
  });

  it('screenAll失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.screenDrugSolvents.mockRejectedValue(42);
    const { result } = renderHook(() => useDrugSolubility());

    await act(async () => {
      await result.current.screenAll(1);
    });

    expect(result.current.error).toBe('スクリーニング中にエラーが発生しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    mockApi.evaluateDrugSolubility.mockResolvedValue({ drug: {}, results: [] });
    const { result } = renderHook(() => useDrugSolubility());

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
