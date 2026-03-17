import { useState, useCallback } from 'react';

/**
 * CSV出力の共通ロジックを提供するhook
 * @param formatFn 結果をCSV文字列に変換する関数
 */
export function useCsvExport<T>(formatFn: (result: T) => string) {
  const [csvError, setCsvError] = useState<string | null>(null);

  const exportCsv = useCallback(async (result: T | null) => {
    if (!result) return;
    setCsvError(null);
    const csv = formatFn(result);
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  }, [formatFn]);

  return { csvError, exportCsv };
}
