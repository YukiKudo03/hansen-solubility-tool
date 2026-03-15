import { useState, useEffect, useCallback } from 'react';
import type { NanoParticle, NanoParticleCategory } from '../../core/types';

export function useNanoParticles(category?: NanoParticleCategory) {
  const [particles, setParticles] = useState<NanoParticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = category
        ? await window.api.getNanoParticlesByCategory(category)
        : await window.api.getAllNanoParticles();
      setParticles(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'ナノ粒子の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { particles, loading, error, reload };
}
