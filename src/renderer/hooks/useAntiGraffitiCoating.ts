import { useState, useCallback } from 'react';

export function useAntiGraffitiCoating() {
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const screen = useCallback(async (
    coatingHSP: { deltaD: number; deltaP: number; deltaH: number },
    r0: number,
    materials: Array<{ name: string; hsp: { deltaD: number; deltaP: number; deltaH: number } }>,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const screenResult = await (window as any).api.screenAntiGraffitiCoatings(coatingHSP, r0, materials);
      setResult(screenResult);
      return screenResult;
    } catch (e) {
      const msg = e instanceof Error ? e.message : '防落書きコーティング評価中にエラーが発生しました';
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
