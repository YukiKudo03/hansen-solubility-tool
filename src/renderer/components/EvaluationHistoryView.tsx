import React, { useState } from 'react';
import { useEvaluationHistory } from '../hooks/useEvaluationHistory';
import { VALID_HISTORY_PIPELINES } from '../../core/evaluation-history';

const PIPELINE_LABELS: Record<string, string> = {
  risk: '溶解性評価',
  contactAngle: '接触角推定',
  swelling: '膨潤度予測',
  chemicalResistance: '耐薬品性予測',
  nanoDispersion: 'ナノ粒子分散',
  plasticizer: '可塑剤選定',
  carrierSelection: 'キャリア選定',
  blendOptimizer: 'ブレンド最適化',
  drugSolubility: '薬物溶解性',
};

export default function EvaluationHistoryView() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { entries, loading, error, deleteEntry } = useEvaluationHistory(filter);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">評価履歴</h2>

        {/* パイプラインフィルタ */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter(undefined)}
            className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
              !filter ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            すべて
          </button>
          {VALID_HISTORY_PIPELINES.map((p) => (
            <button
              key={p}
              onClick={() => setFilter(p)}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                filter === p ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {PIPELINE_LABELS[p] ?? p}
            </button>
          ))}
        </div>

        {loading && <p className="text-gray-500 text-sm">読み込み中...</p>}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && entries.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">履歴がありません</p>
        )}

        {/* 履歴一覧 */}
        {entries.length > 0 && (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md mr-2">
                      {PIPELINE_LABELS[entry.pipeline] ?? entry.pipeline}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.evaluatedAt).toLocaleString('ja-JP')}
                    </span>
                    {entry.note && (
                      <p className="text-sm text-gray-600 mt-1">{entry.note}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1"
                    aria-label="削除"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
