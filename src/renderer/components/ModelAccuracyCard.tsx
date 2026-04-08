/**
 * Model Accuracy カード — 計算予測と実験結果の精度サマリー
 *
 * 4列表示: 一致率(大) / FP数 / FN数 / 最大乖離Top3
 * 実験データなし時は非表示（hidden, not empty state）
 */
import React from 'react';
import type { ModelAccuracyMetrics } from '../../core/model-accuracy';

interface Props {
  metrics: ModelAccuracyMetrics | null;
  treatPartialAs: 'good' | 'bad';
  onTreatPartialAsChange: (value: 'good' | 'bad') => void;
}

export default function ModelAccuracyCard({ metrics, treatPartialAs, onTreatPartialAsChange }: Props) {
  if (!metrics || metrics.totalCount === 0) return null;

  const matchRateColor = metrics.matchRate >= 80 ? 'text-green-600' :
    metrics.matchRate >= 60 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-800">Model Accuracy</h3>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>partial =</span>
          <select
            value={treatPartialAs}
            onChange={(e) => onTreatPartialAsChange(e.target.value as 'good' | 'bad')}
            className="text-xs border border-gray-300 rounded px-1 py-0.5"
          >
            <option value="good">good</option>
            <option value="bad">bad</option>
          </select>
          <span className="ml-2">n={metrics.totalCount}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* 一致率（大表示） */}
        <div className="text-center">
          <div className={`text-3xl font-bold ${matchRateColor}`}>
            {metrics.matchRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            一致率 ({metrics.matchCount}/{metrics.totalCount})
          </div>
        </div>

        {/* False Positive */}
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-500">
            {metrics.falsePositives}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            False Positive
          </div>
          <div className="text-xs text-gray-400">
            予測good / 実験bad
          </div>
        </div>

        {/* False Negative */}
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {metrics.falseNegatives}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            False Negative
          </div>
          <div className="text-xs text-gray-400">
            予測bad / 実験good
          </div>
        </div>

        {/* 最大乖離 Top3 */}
        <div>
          <div className="text-xs text-gray-500 mb-1">最大乖離 Top3</div>
          {metrics.topDivergences.length === 0 ? (
            <div className="text-xs text-gray-400">全件一致</div>
          ) : (
            <ul className="space-y-1">
              {metrics.topDivergences.map((d, i) => (
                <li key={i} className="text-xs">
                  <span className="font-medium text-gray-700">{d.solventName}</span>
                  <span className="text-gray-400 ml-1">
                    RED={d.red.toFixed(2)} ({d.predicted}→{d.experimental})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
