// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEvaluation } from '../../../src/renderer/hooks/useEvaluation';
import { setupMockApi } from '../setup';
import { buildGroupEvaluationResult, resetIdCounter } from '../factories';

let mockApi: ReturnType<typeof setupMockApi>;

beforeEach(() => {
  resetIdCounter();
  mockApi = setupMockApi();
});

describe('useEvaluation', () => {
  it('evaluate()がwindow.api.evaluateを呼びresultを返す', async () => {
    const evalResult = buildGroupEvaluationResult();
    mockApi.evaluate.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useEvaluation());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.evaluate(1, 2);
    });

    expect(mockApi.evaluate).toHaveBeenCalledWith(1, 2);
    expect(result.current.result).toEqual(evalResult);
    expect(returnValue).toEqual(evalResult);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('API例外時にerrorにメッセージ格納', async () => {
    mockApi.evaluate.mockRejectedValue(new Error('評価失敗'));

    const { result } = renderHook(() => useEvaluation());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('評価失敗');
    expect(result.current.result).toBeNull();
  });

  it('非Errorオブジェクトの例外もハンドリング', async () => {
    mockApi.evaluate.mockRejectedValue('文字列エラー');

    const { result } = renderHook(() => useEvaluation());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });

    expect(result.current.error).toBe('評価中にエラーが発生しました');
  });

  it('reset()でresultとerrorがクリアされる', async () => {
    const evalResult = buildGroupEvaluationResult();
    mockApi.evaluate.mockResolvedValue(evalResult);

    const { result } = renderHook(() => useEvaluation());

    await act(async () => {
      await result.current.evaluate(1, 2);
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('初期状態はresult=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useEvaluation());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
