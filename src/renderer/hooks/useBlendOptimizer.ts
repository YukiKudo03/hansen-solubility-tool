import { useState, useCallback } from 'react';
import type { BlendOptimizationResult } from '../../core/types';

export function useBlendOptimizer() {
  const [result, setResult] = useState<BlendOptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const optimize = useCallback(async (params: {
    targetDeltaD: number; targetDeltaP: number; targetDeltaH: number;
    candidateSolventIds: number[]; maxComponents: 2 | 3; stepSize: number; topN: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const evalResult = await window.api.optimizeBlend(params);
      setResult(evalResult);
      return evalResult;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ブレンド最適化中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { result, loading, error, optimize, clear };
}
