// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { setupMockApi } from '../setup';
import { usePressureHSPCorrection } from '../../../src/renderer/hooks/usePressureHSPCorrection';

describe('usePressureHSPCorrection', () => {
  let mockApi: ReturnType<typeof setupMockApi>;

  beforeEach(() => {
    mockApi = setupMockApi();
  });

  it('初期状態が正しい', () => {
    const { result } = renderHook(() => usePressureHSPCorrection());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate呼び出しでAPIが呼ばれる', async () => {
    mockApi.evaluatePressureHSPCorrection.mockResolvedValue({
      original: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
      corrected: { deltaD: 19.0, deltaP: 1.5, deltaH: 2.1 },
      pressureRef: 0.1,
      pressureTarget: 50,
      temperature: 300,
      isothermalCompressibility: 1e-3,
      evaluatedAt: new Date(),
    });

    const { result } = renderHook(() => usePressureHSPCorrection());

    await act(async () => {
      await result.current.evaluate({
        hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        pressureTarget: 50,
        temperature: 300,
      });
    });

    expect(mockApi.evaluatePressureHSPCorrection).toHaveBeenCalledOnce();
    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.corrected.deltaD).toBe(19.0);
  });

  it('エラー時にerrorがセットされる', async () => {
    mockApi.evaluatePressureHSPCorrection.mockRejectedValue(new Error('圧力エラー'));

    const { result } = renderHook(() => usePressureHSPCorrection());

    await act(async () => {
      await result.current.evaluate({
        hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
        pressureTarget: 50,
        temperature: 300,
      });
    });

    expect(result.current.error).toBe('圧力エラー');
  });
});
