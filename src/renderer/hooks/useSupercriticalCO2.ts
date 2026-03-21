/**
 * 超臨界CO2共溶媒選定 — カスタムフック
 */
import { useState, useCallback } from 'react';
import type { SCCO2CosolventScreeningResult } from '../../core/supercritical-co2-cosolvent';

export function useSupercriticalCO2() {
  const [result, setResult] = useState<SCCO2CosolventScreeningResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    targetHSP: { deltaD: number; deltaP: number; deltaH: number };
    targetR0: number;
    pressure: number;
    temperature: number;
    cosolvents: Array<{ name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }>;
    fractions?: number[];
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.screenSupercriticalCO2Cosolvents(params);
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '評価に失敗しました');
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
