import React, { useState, useMemo } from 'react';
import type { NanoParticle, NanoParticleCategory, NanoDispersionEvaluationResult, SolventConstraints, SolventDispersibilityResult } from '../../core/types';
import { formatNanoDispersionCsv } from '../../core/report';
import { getDispersionWarnings } from '../../core/accuracy-warnings';
import { useNanoParticles } from '../hooks/useNanoParticles';
import { useNanoDispersion } from '../hooks/useNanoDispersion';
import DispersibilityBadge from './DispersibilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useCsvExport } from '../hooks/useCsvExport';
import { useSortableTable } from '../hooks/useSortableTable';

const CATEGORY_LABELS: Record<NanoParticleCategory, string> = {
  carbon: 'カーボン系',
  metal: '金属',
  metal_oxide: '金属酸化物',
  quantum_dot: '量子ドット',
  polymer: '高分子',
  other: 'その他',
};

type SortKey = 'solventName' | 'ra' | 'red' | 'dispersibility' | 'boilingPoint' | 'viscosity';

export default function NanoDispersionView() {
  // 粒子選択
  const [categoryFilter, setCategoryFilter] = useState<NanoParticleCategory | ''>('');
  const { particles, loading: particlesLoading } = useNanoParticles(categoryFilter || undefined);
  const [selectedParticle, setSelectedParticle] = useState<NanoParticle | null>(null);

  // 物性制約
  const [useConstraints, setUseConstraints] = useState(false);
  const [constraints, setConstraints] = useState<SolventConstraints>({});

  // 評価
  const { result, loading: evalLoading, error, screenAll, screenFiltered, clear } = useNanoDispersion();
  const { csvError, exportCsv } = useCsvExport(formatNanoDispersionCsv);

  // ソート
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  const canEvaluate = selectedParticle && !evalLoading;

  const handleEvaluate = async () => {
    if (!selectedParticle) return;
    if (useConstraints) {
      await screenFiltered(selectedParticle.id, constraints);
    } else {
      await screenAll(selectedParticle.id);
    }
  };

  const handleExportCsv = () => exportCsv(result);

  const handleParticleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value);
    const p = particles.find((p) => p.id === id) ?? null;
    setSelectedParticle(p);
    clear();
  };

  const sortedResults = useMemo(() => {
    if (!result) return [];
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName':
          cmp = a.solvent.name.localeCompare(b.solvent.name, 'ja');
          break;
        case 'ra':
          cmp = a.ra - b.ra;
          break;
        case 'red':
          cmp = a.red - b.red;
          break;
        case 'dispersibility':
          cmp = a.dispersibility - b.dispersibility;
          break;
        case 'boilingPoint':
          cmp = (a.solvent.boilingPoint ?? 9999) - (b.solvent.boilingPoint ?? 9999);
          break;
        case 'viscosity':
          cmp = (a.solvent.viscosity ?? 9999) - (b.solvent.viscosity ?? 9999);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  // 統計サマリー
  const stats = useMemo(() => {
    if (!result || result.results.length === 0) return null;
    const total = result.results.length;
    const good = result.results.filter((r) => r.red < 1.0).length;
    const bestRed = Math.min(...result.results.map((r) => r.red));
    const bestSolvent = result.results.find((r) => r.red === bestRed);
    return { total, good, bestRed, bestSolventName: bestSolvent?.solvent.name ?? '-' };
  }, [result]);

  // RED境界警告
  const warnings = useMemo(() => {
    if (!result) return [];
    return getDispersionWarnings(result.results);
  }, [result]);

  return (
    <div className="space-y-6">
      {/* 粒子選択エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ナノ粒子分散評価</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* カテゴリフィルタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as NanoParticleCategory | '');
                setSelectedParticle(null);
                clear();
              }}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべて</option>
              {(Object.keys(CATEGORY_LABELS) as NanoParticleCategory[]).map((cat) => (
                <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
          </div>

          {/* 粒子選択 */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">ナノ粒子</label>
            <select
              value={selectedParticle?.id ?? ''}
              onChange={handleParticleSelect}
              disabled={particlesLoading}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
            >
              <option value="">選択してください...</option>
              {particles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.surfaceLigand ? `(${p.surfaceLigand})` : ''} — {CATEGORY_LABELS[p.category]}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 選択中の粒子情報 */}
        {selectedParticle && (
          <div className="bg-blue-50 rounded-md p-3 mb-4 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <div><span className="text-gray-500">母材:</span> {selectedParticle.coreMaterial}</div>
              <div><span className="text-gray-500">表面修飾:</span> {selectedParticle.surfaceLigand ?? 'なし'}</div>
              <div><span className="text-gray-500">粒子径:</span> {selectedParticle.particleSize ? `${selectedParticle.particleSize} nm` : '-'}</div>
              <div><span className="text-gray-500">R₀:</span> {selectedParticle.r0.toFixed(1)}</div>
              <div><span className="text-gray-500">δD:</span> {selectedParticle.hsp.deltaD.toFixed(1)}</div>
              <div><span className="text-gray-500">δP:</span> {selectedParticle.hsp.deltaP.toFixed(1)}</div>
              <div><span className="text-gray-500">δH:</span> {selectedParticle.hsp.deltaH.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* 物性制約フィルタ */}
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useConstraints}
              onChange={(e) => setUseConstraints(e.target.checked)}
              className="rounded border-gray-300"
            />
            物性制約フィルタを使用
          </label>
          {useConstraints && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-6">
              <div>
                <label className="block text-xs text-gray-500 mb-1">最低沸点 (°C)</label>
                <input
                  type="number"
                  value={constraints.minBoilingPoint ?? ''}
                  onChange={(e) => setConstraints({ ...constraints, minBoilingPoint: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="例: 60"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">最高沸点 (°C)</label>
                <input
                  type="number"
                  value={constraints.maxBoilingPoint ?? ''}
                  onChange={(e) => setConstraints({ ...constraints, maxBoilingPoint: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="例: 200"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">最大粘度 (mPa·s)</label>
                <input
                  type="number"
                  value={constraints.maxViscosity ?? ''}
                  onChange={(e) => setConstraints({ ...constraints, maxViscosity: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="例: 2.0"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">最大表面張力 (mN/m)</label>
                <input
                  type="number"
                  value={constraints.maxSurfaceTension ?? ''}
                  onChange={(e) => setConstraints({ ...constraints, maxSurfaceTension: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                  placeholder="例: 30"
                />
              </div>
            </div>
          )}
        </div>

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {evalLoading ? 'スクリーニング中...' : '全溶媒スクリーニング'}
          </button>
          {result && (
            <button
              onClick={handleExportCsv}
              className="px-6 py-2.5 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              CSV出力
            </button>
          )}
          <BookmarkButton
            pipeline="nanoDispersion"
            params={{ particleId: selectedParticle?.id }}
            disabled={!selectedParticle}
          />
        </div>
      </div>

      {/* エラー表示 */}
      {(error || csvError) && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
        </div>
      )}

      {/* 統計サマリー */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-500">評価溶媒数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.good}</div>
              <div className="text-gray-500">分散可能 (RED &lt; 1.0)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.bestRed.toFixed(3)}</div>
              <div className="text-gray-500">最小RED値</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 truncate">{stats.bestSolventName}</div>
              <div className="text-gray-500">最適溶媒</div>
            </div>
          </div>
        </div>
      )}

      {/* RED境界の警告 */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
          <div className="font-medium mb-1">推定精度に関する注意</div>
          <ul className="list-disc list-inside space-y-1">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">δD</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">δP</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">δH</th>
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="分散性" field="dispersibility" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="沸点" field="boilingPoint" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="粘度" field="viscosity" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">表面張力</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r) => (
                  <tr key={r.solvent.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solvent.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.hsp.deltaD.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.hsp.deltaP.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.hsp.deltaH.toFixed(1)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <DispersibilityBadge level={r.dispersibility} />
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.boilingPoint?.toFixed(1) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.viscosity?.toFixed(2) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.solvent.surfaceTension?.toFixed(1) ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
