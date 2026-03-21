import { useState, useCallback } from 'react';

export function usePhotoresistDeveloper() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (
    unexposedHSP: { deltaD: number; deltaP: number; deltaH: number },
    exposedHSP: { deltaD: number; deltaP: number; deltaH: number },
    developerHSP: { deltaD: number; deltaP: number; deltaH: number },
  ) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.evaluatePhotoresistDeveloper({
        unexposedHSP, exposedHSP, developerHSP,
      });
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'フォトレジスト現像液評価中にエラーが発生しました';
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
