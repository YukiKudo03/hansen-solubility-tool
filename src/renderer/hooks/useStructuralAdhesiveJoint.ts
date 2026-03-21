import { useState, useCallback } from 'react';

export function useStructuralAdhesiveJoint() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    adhesiveHSP: { deltaD: number; deltaP: number; deltaH: number };
    adherend1HSP: { deltaD: number; deltaP: number; deltaH: number };
    adherend2HSP: { deltaD: number; deltaP: number; deltaH: number };
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await (window as any).api.evaluateStructuralAdhesiveJoint(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '構造接着設計評価中にエラーが発生しました';
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
