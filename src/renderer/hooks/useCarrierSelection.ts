import { useState, useCallback } from 'react';
import type { CarrierEvaluationResult } from '../../core/types';

export function useCarrierSelection() {
  const [result, setResult] = useState<CarrierEvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (drugId: number, carrierId: number, carrierGroupId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.evaluateCarrier(drugId, carrierId, carrierGroupId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'キャリア評価中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const screenAll = useCallback(async (drugId: number, carrierGroupId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.screenCarriers(drugId, carrierGroupId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'キャリアスクリーニング中にエラーが発生しました');
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
