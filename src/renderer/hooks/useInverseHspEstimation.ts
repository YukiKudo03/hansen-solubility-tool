import { useState, useCallback } from 'react';

export function useInverseHspEstimation() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimate = useCallback(async (classifications: Array<{ solventId: number; isGood: boolean }>) => {
    setLoading(true);
    setError(null);
    try {
      const fitResult = await (window as any).api.fitSphere(classifications);
      setResult(fitResult);
      return fitResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '逆HSP推定中にエラーが発生しました';
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
