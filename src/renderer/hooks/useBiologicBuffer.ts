import { useState, useCallback } from 'react';

export function useBiologicBuffer() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    proteinHSP: { deltaD: number; deltaP: number; deltaH: number },
    r0: number,
    bufferIds: number[],
    temperature?: number,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenBiologicBuffers(proteinHSP, r0, bufferIds, temperature);
      setResult({ results: evalResult });
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'バイオ製剤バッファー評価中にエラーが発生しました';
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
