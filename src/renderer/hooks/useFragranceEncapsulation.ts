import { useState, useCallback } from 'react';

export function useFragranceEncapsulation() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    wallHSP: { deltaD: number; deltaP: number; deltaH: number },
    r0: number,
    fragranceIds: number[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenFragranceEncapsulation(wallHSP, r0, fragranceIds);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '香料カプセル化評価中にエラーが発生しました';
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
