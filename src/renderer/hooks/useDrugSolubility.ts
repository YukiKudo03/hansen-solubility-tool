import { useState, useCallback } from 'react';
import type { DrugSolubilityScreeningResult } from '../../core/types';

export function useDrugSolubility() {
  const [result, setResult] = useState<DrugSolubilityScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (drugId: number, solventId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.evaluateDrugSolubility(drugId, solventId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      setError(e instanceof Error ? e.message : '薬物溶解性評価中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const screenAll = useCallback(async (drugId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.screenDrugSolvents(drugId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'スクリーニング中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, evaluate, screenAll, clear };
}
