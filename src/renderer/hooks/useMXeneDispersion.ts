import { useState, useCallback } from 'react';

export function useMXeneDispersion() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    mxeneHSP: { deltaD: number; deltaP: number; deltaH: number },
    r0: number,
    solventIds: number[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenMXeneDispersion(mxeneHSP, r0, solventIds);
      setResult({ results: evalResult });
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'MXene分散評価中にエラーが発生しました';
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
