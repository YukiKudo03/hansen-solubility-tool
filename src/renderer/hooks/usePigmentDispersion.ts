import { useState, useCallback } from 'react';

export function usePigmentDispersion() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    pigmentHSP: { deltaD: number; deltaP: number; deltaH: number },
    r0: number,
    vehicleIds: number[],
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenPigmentDispersion(pigmentHSP, r0, vehicleIds);
      setResult({ results: evalResult });
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '顔料分散安定性評価中にエラーが発生しました';
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
