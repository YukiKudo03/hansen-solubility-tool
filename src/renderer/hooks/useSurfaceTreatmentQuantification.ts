import { useState, useCallback } from 'react';

export function useSurfaceTreatmentQuantification() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    beforeHSP: { deltaD: number; deltaP: number; deltaH: number };
    afterHSP: { deltaD: number; deltaP: number; deltaH: number };
    targetHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.evaluateSurfaceTreatmentQuantification(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '表面処理効果評価中にエラーが発生しました';
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

  return { result, loading, error, evaluate, clear };
}
