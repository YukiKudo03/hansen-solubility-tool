import { useState, useEffect, useCallback } from 'react';
import type { Drug } from '../../core/types';

export function useDrugs() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await window.api.getAllDrugs();
      setDrugs(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { drugs, loading, refresh };
}
