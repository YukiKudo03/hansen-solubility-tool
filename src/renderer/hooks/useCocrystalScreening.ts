import { useState, useCallback } from 'react';

export function useCocrystalScreening() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (drugId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenCocrystals(drugId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '共結晶スクリーニング中にエラーが発生しました';
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
