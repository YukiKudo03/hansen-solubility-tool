import { useState, useCallback } from 'react';

export function useCompatibilizerSelection() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screen = useCallback(async (params: {
    groupId1: number; groupId2: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenCompatibilizers(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '相溶化剤選定中にエラーが発生しました';
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

  return { result, loading, error, screen, clear };
}
