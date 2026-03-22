import { useState, useCallback } from 'react';

export function useIonicLiquidHSP() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async (params: {
    cationHSP: { deltaD: number; deltaP: number; deltaH: number };
    anionHSP: { deltaD: number; deltaP: number; deltaH: number };
    ratio?: [number, number];
    temperature?: number;
    referenceTemp?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const estimateResult = await (window as any).api.estimateIonicLiquidHSP(params);
      setResult(estimateResult);
      return estimateResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'イオン液体HSP推定中にエラーが発生しました';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, estimate, clear };
}
