import { useState, useCallback } from 'react';

export function useSurfaceHSPDetermination() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async (params: {
    testData: Array<{
      liquidName: string;
      liquidHSP: { deltaD: number; deltaP: number; deltaH: number };
      contactAngleDeg: number;
    }>;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const estimateResult = await (window as any).api.estimateSurfaceHSP(params);
      setResult(estimateResult);
      return estimateResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '表面HSP決定中にエラーが発生しました';
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
