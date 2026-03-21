// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { setupMockApi } from '../setup';
import { useTemperatureHSPCorrection } from '../../../src/renderer/hooks/useTemperatureHSPCorrection';

describe('useTemperatureHSPCorrection', () => {
  let mockApi: ReturnType<typeof setupMockApi>;

  beforeEach(() => {
    mockApi = setupMockApi();
  });

  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useTemperatureHSPCorrection());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate呼び出しでAPIが呼ばれる', async () => {
    mockApi.evaluateTemperatureHSPCorrection.mockResolvedValue({
      original: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
      corrected: { deltaD: 17.5, deltaP: 1.3, deltaH: 1.8 },
      temperature: 80,
      referenceTemp: 25,
      alpha: 1.07e-3,
      associatingCorrectionApplied: false,
      evaluatedAt: new Date(),
    });

    const { result } = renderHook(() => useTemperatureHSPCorrection());

    await act(async () => {
      await result.current.evaluate({
        hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        temperature: 80,
        alpha: 1.07e-3,
      });
    });

    expect(mockApi.evaluateTemperatureHSPCorrection).toHaveBeenCalledOnce();
    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.corrected.deltaD).toBe(17.5);
  });

  it('エラー時にerrorがセットされる', async () => {
    mockApi.evaluateTemperatureHSPCorrection.mockRejectedValue(new Error('テストエラー'));

    const { result } = renderHook(() => useTemperatureHSPCorrection());

    await act(async () => {
      await result.current.evaluate({
        hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        temperature: 80,
        alpha: 1.07e-3,
      });
    });

    expect(result.current.error).toBe('テストエラー');
  });

  it('clearで結果がリセットされる', async () => {
    mockApi.evaluateTemperatureHSPCorrection.mockResolvedValue({
      original: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
      corrected: { deltaD: 17.5, deltaP: 1.3, deltaH: 1.8 },
      temperature: 80,
      referenceTemp: 25,
      alpha: 1.07e-3,
      associatingCorrectionApplied: false,
      evaluatedAt: new Date(),
    });

    const { result } = renderHook(() => useTemperatureHSPCorrection());

    await act(async () => {
      await result.current.evaluate({
        hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        temperature: 80,
        alpha: 1.07e-3,
      });
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});
