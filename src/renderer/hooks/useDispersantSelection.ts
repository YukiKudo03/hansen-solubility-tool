import { useState, useCallback, useEffect } from 'react';
import type { Dispersant, DispersantEvaluationResult, DispersantFallbackResult } from '../../core/types';
import type { SolventForDispersantEvaluationResult } from '../../core/types';

export function useDispersants() {
  const [dispersants, setDispersants] = useState<Dispersant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.api.getAllDispersants().then((data) => {
      setDispersants(data);
    }).catch(() => {
      // DB取得失敗時は空リストのまま
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return { dispersants, loading };
}

export function useDispersantSelection() {
  const [screenResult, setScreenResult] = useState<DispersantEvaluationResult | null>(null);
  const [solventResult, setSolventResult] = useState<SolventForDispersantEvaluationResult | null>(null);
  const [fallbackResult, setFallbackResult] = useState<DispersantFallbackResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screenDispersants = useCallback(async (particleId: number, solventId: number) => {
    setLoading(true);
    setError(null);
    setSolventResult(null);
    setFallbackResult(null);
    try {
      const result = await window.api.screenDispersants(particleId, solventId);
      setScreenResult(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : '分散剤スクリーニング中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const screenSolvents = useCallback(async (particleId: number, dispersantId: number) => {
    setLoading(true);
    setError(null);
    setScreenResult(null);
    setFallbackResult(null);
    try {
      const result = await window.api.screenSolventsForDispersant(particleId, dispersantId);
      setSolventResult(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : '溶媒スクリーニング中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const screenFallback = useCallback(async (particleId: number) => {
    setLoading(true);
    setError(null);
    setScreenResult(null);
    setSolventResult(null);
    try {
      const result = await window.api.screenDispersantsFallback(particleId);
      setFallbackResult(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'フォールバック評価中にエラーが発生しました');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clear = useCallback(() => {
    setScreenResult(null);
    setSolventResult(null);
    setFallbackResult(null);
    setError(null);
  }, []);

  return { screenResult, solventResult, fallbackResult, loading, error, screenDispersants, screenSolvents, screenFallback, clear };
}
