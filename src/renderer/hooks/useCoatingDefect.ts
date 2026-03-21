import { useState, useCallback } from 'react';

export function useCoatingDefect() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    coatingHSP: { deltaD: number; deltaP: number; deltaH: number },
    substrateHSP: { deltaD: number; deltaP: number; deltaH: number },
    solventHSP: { deltaD: number; deltaP: number; deltaH: number },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.predictCoatingDefects({
        coatingHSP, substrateHSP, solventHSP,
      });
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'コーティング欠陥予測中にエラーが発生しました';
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
