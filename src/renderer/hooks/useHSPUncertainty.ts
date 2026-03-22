import { useState, useCallback } from 'react';

export function useHSPUncertainty() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bootstrap = useCallback(async (params: {
    classifications: Array<{ solventId: number; isGood: boolean }>;
    numSamples?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const bootstrapResult = await (window as any).api.bootstrapHSPUncertainty(params);
      setResult(bootstrapResult);
      return bootstrapResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'HSP不確かさ定量化中にエラーが発生しました';
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

  return { result, loading, error, bootstrap, clear };
}
