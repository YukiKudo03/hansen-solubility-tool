import { useState, useCallback } from 'react';
import type { NanoDispersionEvaluationResult, SolventConstraints } from '../../core/types';

export function useNanoDispersion() {
  const [result, setResult] = useState<NanoDispersionEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screenAll = useCallback(async (particleId: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.screenAllSolvents(particleId);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '評価に失敗しました');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const screenFiltered = useCallback(async (particleId: number, constraints: SolventConstraints) => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.screenFilteredSolvents(particleId, constraints);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : '評価に失敗しました');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, screenAll, screenFiltered, clear };
}
