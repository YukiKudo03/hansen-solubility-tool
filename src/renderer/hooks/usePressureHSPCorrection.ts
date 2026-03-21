/**
 * 圧力依存HSP補正ツール — カスタムフック
 */
import { useState, useCallback } from 'react';

export interface PressureHSPCorrectionResult {
  original: { deltaD: number; deltaP: number; deltaH: number };
  corrected: { deltaD: number; deltaP: number; deltaH: number };
  pressureRef: number;
  pressureTarget: number;
  temperature: number;
  isothermalCompressibility: number;
  evaluatedAt: Date;
}

export function usePressureHSPCorrection() {
  const [result, setResult] = useState<PressureHSPCorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    hsp: { deltaD: number; deltaP: number; deltaH: number };
    pressureRef?: number;
    pressureTarget: number;
    temperature: number;
    isothermalCompressibility?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.evaluatePressureHSPCorrection(params);
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
