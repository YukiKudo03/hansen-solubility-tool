// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useBlendOptimizer } from '../../../src/renderer/hooks/useBlendOptimizer';
import { setupMockApi } from '../setup';

let mockApi: ReturnType<typeof setupMockApi>;

const defaultParams = {
  targetDeltaD: 18.0,
  targetDeltaP: 10.0,
  targetDeltaH: 12.0,
  candidateSolventIds: [1, 2, 3],
  maxComponents: 2 as const,
  stepSize: 0.05,
  topN: 20,
};

const mockResult = {
  targetHSP: { deltaD: 18.0, deltaP: 10.0, deltaH: 12.0 },
  topResults: [
    {
      components: [
        { solvent: { id: 1, name: '溶媒A' }, volumeFraction: 0.6 },
        { solvent: { id: 2, name: '溶媒B' }, volumeFraction: 0.4 },
      ],
      blendHSP: { deltaD: 17.8, deltaP: 9.8, deltaH: 11.9 },
      ra: 0.42,
    },
  ],
};

beforeEach(() => {
  mockApi = setupMockApi();
});

describe('useBlendOptimizer', () => {
  it('初期状態: result=null, loading=false, error=null', () => {
    const { result } = renderHook(() => useBlendOptimizer());

    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('optimize成功時にresultが設定される', async () => {
    mockApi.optimizeBlend.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useBlendOptimizer());

    let returnValue: unknown;
    await act(async () => {
      returnValue = await result.current.optimize(defaultParams);
    });

    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
    expect(returnValue).toEqual(mockResult);
    expect(mockApi.optimizeBlend).toHaveBeenCalledWith(defaultParams);
  });

  it('optimize中はloading=true、完了後false', async () => {
    let resolvePromise: (value: unknown) => void;
    mockApi.optimizeBlend.mockReturnValue(
      new Promise((resolve) => { resolvePromise = resolve; }),
    );

    const { result } = renderHook(() => useBlendOptimizer());

    let optimizePromise: Promise<unknown>;
    act(() => {
      optimizePromise = result.current.optimize(defaultParams);
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!(mockResult);
      await optimizePromise;
    });

    expect(result.current.loading).toBe(false);
  });

  it('API例外時にerrorが設定される', async () => {
    mockApi.optimizeBlend.mockRejectedValue(new Error('最適化失敗'));
    const { result } = renderHook(() => useBlendOptimizer());

    const returnValue = await act(async () => {
      return await result.current.optimize(defaultParams);
    });

    expect(result.current.error).toBe('最適化失敗');
    expect(result.current.result).toBeNull();
    expect(returnValue).toBeNull();
  });

  it('Error以外の例外でデフォルトメッセージ', async () => {
    mockApi.optimizeBlend.mockRejectedValue('unknown');
    const { result } = renderHook(() => useBlendOptimizer());

    await act(async () => {
      await result.current.optimize(defaultParams);
    });

    expect(result.current.error).toBe('ブレンド最適化中にエラーが発生しました');
  });

  it('clearでresult/errorがリセットされる', async () => {
    mockApi.optimizeBlend.mockResolvedValue(mockResult);
    const { result } = renderHook(() => useBlendOptimizer());

    await act(async () => {
      await result.current.optimize(defaultParams);
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
