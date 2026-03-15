import { useState, useEffect, useCallback } from 'react';
import type { Solvent } from '../../core/types';

export function useSolvents(searchQuery = '') {
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.api.searchSolvents(searchQuery);
      setSolvents(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '溶媒の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { solvents, loading, error, reload };
}
