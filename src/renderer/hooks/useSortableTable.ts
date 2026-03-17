import { useState, useCallback } from 'react';

type SortDir = 'asc' | 'desc';

/**
 * テーブルソートの共通ロジックを提供するhook
 * @param defaultKey 初期ソートキー
 * @param defaultDir 初期ソート方向（デフォルト: 'asc'）
 */
export function useSortableTable<K extends string>(defaultKey: K, defaultDir: SortDir = 'asc') {
  const [sortKey, setSortKey] = useState<K>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const toggleSort = useCallback((key: K) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  return { sortKey, sortDir, toggleSort };
}
