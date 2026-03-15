import { useState, useEffect, useCallback } from 'react';
import type { PartsGroup } from '../../core/types';

export function usePartsGroups() {
  const [groups, setGroups] = useState<PartsGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await window.api.getAllGroups();
      setGroups(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '部品グループの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { groups, loading, error, reload };
}
