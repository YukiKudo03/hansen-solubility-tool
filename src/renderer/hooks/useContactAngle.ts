import { useState, useCallback } from 'react';
import type { GroupContactAngleResult } from '../../core/types';

export function useContactAngle() {
  const [result, setResult] = useState<GroupContactAngleResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (partsGroupId: number, solventId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.estimateContactAngle(partsGroupId, solventId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '接触角推定中にエラーが発生しました';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const screenAll = useCallback(async (partId: number, groupId: number) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.screenContactAngle(partId, groupId);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'スクリーニング中にエラーが発生しました';
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

  return { result, loading, error, evaluate, screenAll, clear };
}
