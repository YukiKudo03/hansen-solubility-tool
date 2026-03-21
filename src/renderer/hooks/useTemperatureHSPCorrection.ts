/**
 * 温度依存HSP補正ツール — カスタムフック
 */
import { useState, useCallback } from 'react';

export interface TemperatureHSPCorrectionResult {
  original: { deltaD: number; deltaP: number; deltaH: number };
  corrected: { deltaD: number; deltaP: number; deltaH: number };
  temperature: number;
  referenceTemp: number;
  alpha: number;
  solventName?: string;
  associatingCorrectionApplied: boolean;
  evaluatedAt: Date;
}

export function useTemperatureHSPCorrection() {
  const [result, setResult] = useState<TemperatureHSPCorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluate = useCallback(async (params: {
    hsp: { deltaD: number; deltaP: number; deltaH: number };
    temperature: number;
    referenceTemp?: number;
    alpha: number;
    solventName?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.api.evaluateTemperatureHSPCorrection(params);
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
