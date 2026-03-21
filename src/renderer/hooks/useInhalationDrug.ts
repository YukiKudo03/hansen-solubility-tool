import { useState, useCallback } from 'react';

export function useInhalationDrug() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    drugHSP: { deltaD: number; deltaP: number; deltaH: number };
    propellantHSP: { deltaD: number; deltaP: number; deltaH: number };
    propellantR0: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.evaluateInhalationDrug(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '吸入薬適合性評価中にエラーが発生しました';
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
