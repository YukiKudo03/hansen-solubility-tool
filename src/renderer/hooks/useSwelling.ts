import { useState, useCallback } from 'react';
import type { GroupSwellingResult } from '../../core/types';

export function useSwelling() {
  const [result, setResult] = useState<GroupSwellingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (partsGroupId: number, solventId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.evaluateSwelling(partsGroupId, solventId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '膨潤度予測中にエラーが発生しました';
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
