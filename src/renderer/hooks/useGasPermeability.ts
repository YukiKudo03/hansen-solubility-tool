import { useState, useCallback } from 'react';

export function useGasPermeability() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    polymerHSP: { deltaD: number; deltaP: number; deltaH: number };
    gasNames: string[];
    referenceGas?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.screenGasPermeability(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'ガス透過性評価中にエラーが発生しました';
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
