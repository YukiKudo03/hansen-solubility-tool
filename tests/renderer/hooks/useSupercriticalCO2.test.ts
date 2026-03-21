// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { setupMockApi } from '../setup';
import { useSupercriticalCO2 } from '../../../src/renderer/hooks/useSupercriticalCO2';

describe('useSupercriticalCO2', () => {
  let mockApi: ReturnType<typeof setupMockApi>;

  beforeEach(() => {
    mockApi = setupMockApi();
  });

  it('初期状態が正しい', () => {
    const { result } = renderHook(() => useSupercriticalCO2());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('evaluate呼び出しでAPIが呼ばれる', async () => {
    const mockResult = {
      targetHSP: { deltaD: 19.5, deltaP: 10.1, deltaH: 13.0 },
      targetR0: 8.0,
      co2HSP: { deltaD: 12.0, deltaP: 5.0, deltaH: 3.0 },
      co2Density: 840,
      pressure: 20,
      temperature: 313,
      results: [
        {
          cosolventName: 'エタノール',
          cosolventHSP: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
          volumeFraction: 0.05,
          blendHSP: { deltaD: 12.19, deltaP: 5.19, deltaH: 3.82 },
          ra: 15.0,
          red: 1.875,
        },
      ],
      evaluatedAt: new Date(),
    };
    mockApi.screenSupercriticalCO2Cosolvents.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useSupercriticalCO2());

    await act(async () => {
      await result.current.evaluate({
        targetHSP: { deltaD: 19.5, deltaP: 10.1, deltaH: 13.0 },
        targetR0: 8.0,
        pressure: 20,
        temperature: 313,
        cosolvents: [{ name: 'エタノール', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } }],
      });
    });

    expect(mockApi.screenSupercriticalCO2Cosolvents).toHaveBeenCalledOnce();
    expect(result.current.result).not.toBeNull();
    expect(result.current.result!.results.length).toBe(1);
  });

  it('clearで結果がリセットされる', async () => {
    mockApi.screenSupercriticalCO2Cosolvents.mockResolvedValue({
      targetHSP: { deltaD: 19.5, deltaP: 10.1, deltaH: 13.0 },
      targetR0: 8.0,
      co2HSP: { deltaD: 12.0, deltaP: 5.0, deltaH: 3.0 },
      co2Density: 840,
      pressure: 20,
      temperature: 313,
      results: [],
      evaluatedAt: new Date(),
    });

    const { result } = renderHook(() => useSupercriticalCO2());

    await act(async () => {
      await result.current.evaluate({
        targetHSP: { deltaD: 19.5, deltaP: 10.1, deltaH: 13.0 },
        targetR0: 8.0,
        pressure: 20,
        temperature: 313,
        cosolvents: [{ name: 'Test', hsp: { deltaD: 15.0, deltaP: 8.0, deltaH: 19.0 } }],
      });
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
  });
});
