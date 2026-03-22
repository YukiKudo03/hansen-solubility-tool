import { useState, useCallback } from 'react';

export function useUnderfillEncapsulant() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    encapsulantHSP: { deltaD: number; deltaP: number; deltaH: number };
    chipSurfaceHSP: { deltaD: number; deltaP: number; deltaH: number };
    substrateHSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.evaluateUnderfillEncapsulant(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'アンダーフィル/封止材評価中にエラーが発生しました';
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
