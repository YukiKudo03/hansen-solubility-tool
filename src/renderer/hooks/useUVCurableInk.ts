import { useState, useCallback } from 'react';

export function useUVCurableInk() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    oligomerHSP: { deltaD: number; deltaP: number; deltaH: number },
    r0: number,
    monomerIds: number[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenUVCurableInkMonomers(oligomerHSP, r0, monomerIds);
      setResult({ results: evalResult });
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'UV硬化インクモノマー選定中にエラーが発生しました';
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
