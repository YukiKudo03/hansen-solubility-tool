import { useState, useEffect, useCallback } from 'react';
import type { EvaluationHistoryRow } from '../../db/history-repository';

export function useEvaluationHistory(pipelineFilter?: string) {
  const [entries, setEntries] = useState<EvaluationHistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = pipelineFilter
        ? await window.api.getHistoryByPipeline(pipelineFilter)
        : await window.api.getAllHistory();
      setEntries(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '履歴の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [pipelineFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  const deleteEntry = useCallback(async (id: number) => {
    await window.api.deleteHistory(id);
    await reload();
  }, [reload]);

  return { entries, loading, error, deleteEntry, reload };
}
