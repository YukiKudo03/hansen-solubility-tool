import { useState, useCallback } from 'react';
import type { PlasticizerEvaluationResult } from '../../core/types';

export function usePlasticizer() {
  const [result, setResult] = useState<PlasticizerEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screen = useCallback(async (partId: number, groupId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.screenPlasticizers(partId, groupId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '可塑剤スクリーニング中にエラーが発生しました';
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
