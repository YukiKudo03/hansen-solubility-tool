// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useChemicalResistance } from '../../../src/renderer/hooks/useChemicalResistance';
import { setupMockApi } from '../setup';
import { resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useChemicalResistance', () => {
  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useChemicalResistance());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate成功でresultに結果が格納される', async () => {
    const evalResult = { partsGroup: {}, results: [] };
    mockApi.evaluateChemicalResistance.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useChemicalResistance());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.result).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockApi.evaluateChemicalResistance).toHaveBeenCalledWith(1, 2);
  });

  it('evaluate中はloading=true', async () => {
    mockApi.evaluateChemicalResistance.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useChemicalResistance());

    act(() => {
      result.current.evaluate(1, 2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
  });

  it('evaluate失敗でerrorにメッセージ', async () => {
    mockApi.evaluateChemicalResistance.mockRejectedValue(new Error('評価エラー'));
    const { result } = renderHook(() => useChemicalResistance());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('評価エラー');
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('evaluate失敗時にError以外の例外でデフォルトメッセージ', async () => {
    mockApi.evaluateChemicalResistance.mockRejectedValue('unknown');
    const { result } = renderHook(() => useChemicalResistance());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('耐薬品性評価中にエラーが発生しました');
  });

  it('clear()でresultとerrorがリセットされる', async () => {
    const evalResult = { partsGroup: {}, results: [] };
    mockApi.evaluateChemicalResistance.mockResolvedValue(evalResult);
    const { result } = renderHook(() => useChemicalResistance());

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
