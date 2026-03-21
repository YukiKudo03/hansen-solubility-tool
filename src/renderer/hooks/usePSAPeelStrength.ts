import { useState, useCallback } from 'react';

export function usePSAPeelStrength() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    psaHSP: { deltaD: number; deltaP: number; deltaH: number };
    adherendHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.evaluatePSAPeelStrength(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'PSA剥離強度評価中にエラーが発生しました';
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
