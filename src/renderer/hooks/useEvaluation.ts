import { useState, useCallback } from 'react';
import type { GroupEvaluationResult } from '../../core/types';

export function useEvaluation() {
  const [result, setResult] = useState<GroupEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (partsGroupId: number, solventId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.evaluate(partsGroupId, solventId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '評価中にエラーが発生しました';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, evaluate, reset };
}
