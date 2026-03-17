import React, { useState } from 'react';
import type { PartsGroup, Solvent, GroupEvaluationResult } from '../../core/types';
import { formatCsv } from '../../core/report';
import PartsGroupSelector from './PartsGroupSelector';
import SolventSelector from './SolventSelector';
import ResultsTable from './ResultsTable';

export default function ReportView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);
  const [result, setResult] = useState<GroupEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canEvaluate = selectedGroup && selectedSolvent && !isEvaluating;

  const handleEvaluate = async () => {
    if (!selectedGroup || !selectedSolvent) return;
    setIsEvaluating(true);
    setError(null);
    try {
      const evalResult = await window.api.evaluate(selectedGroup.id, selectedSolvent.id);
      setResult(evalResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : '評価中にエラーが発生しました');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExportCsv = async () => {
    if (!result) return;
    const csv = formatCsv(result);
    try {
      const saveResult = await window.api.saveCsv(csv);
      if (saveResult.saved) {
        // 成功通知はUIで表示
      }
    } catch (e) {
      setError('CSV保存中にエラーが発生しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* 選択エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">評価条件</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PartsGroupSelector onSelect={setSelectedGroup} selected={selectedGroup} />
          <SolventSelector onSelect={setSelectedSolvent} selected={selectedSolvent} />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isEvaluating ? '評価中...' : '評価実行'}
          </button>
          {result && (
            <button
              onClick={handleExportCsv}
              className="px-6 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          )}
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              評価結果: {result.partsGroup.name} × {result.solvent.name}
            </h2>
            <span className="text-xs text-gray-500">
              評価日時: {new Date(result.evaluatedAt).toLocaleString('ja-JP')}
            </span>
          </div>
          <div className="mb-4 grid grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">溶媒 δD:</span>{' '}
              <span className="font-medium">{result.solvent.hsp.deltaD}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">溶媒 δP:</span>{' '}
              <span className="font-medium">{result.solvent.hsp.deltaP}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">溶媒 δH:</span>{' '}
              <span className="font-medium">{result.solvent.hsp.deltaH}</span>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <span className="text-gray-500">部品数:</span>{' '}
              <span className="font-medium">{result.results.length}</span>
            </div>
            {result.solvent.boilingPoint != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">沸点:</span>{' '}
                <span className="font-medium">{result.solvent.boilingPoint} °C</span>
              </div>
            )}
            {result.solvent.viscosity != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">粘度:</span>{' '}
                <span className="font-medium">{result.solvent.viscosity} mPa·s</span>
              </div>
            )}
            {result.solvent.specificGravity != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">比重:</span>{' '}
                <span className="font-medium">{result.solvent.specificGravity}</span>
              </div>
            )}
            {result.solvent.surfaceTension != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">表面張力:</span>{' '}
                <span className="font-medium">{result.solvent.surfaceTension} mN/m</span>
              </div>
            )}
          </div>
          <ResultsTable result={result} />
        </div>
      )}
    </div>
  );
}
