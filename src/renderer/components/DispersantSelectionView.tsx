import React, { useState, useMemo, useEffect } from 'react';
import type { NanoParticle, Solvent, Dispersant, NanoParticleCategory, DispersantScreeningResult } from '../../core/types';
import { DispersantAffinityLevel } from '../../core/types';
import DispersantBadge from './DispersantBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useSortableTable } from '../hooks/useSortableTable';
import { useDispersants, useDispersantSelection } from '../hooks/useDispersantSelection';

type Mode = 'dispersantScreen' | 'solventScreen' | 'fallback';
type SortKey = 'name' | 'raAnchor' | 'redAnchor' | 'raSolvation' | 'redSolvation' | 'compositeScore' | 'overallLevel';

export default function DispersantSelectionView() {
  const [mode, setMode] = useState<Mode>('dispersantScreen');
  const [nanoParticles, setNanoParticles] = useState<NanoParticle[]>([]);
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [selectedParticle, setSelectedParticle] = useState<NanoParticle | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);
  const [selectedDispersant, setSelectedDispersant] = useState<Dispersant | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<NanoParticleCategory | ''>('');

  const { dispersants, loading: dispersantsLoading } = useDispersants();
  const { screenResult, solventResult, fallbackResult, loading: evalLoading, error, screenDispersants, screenSolvents, screenFallback, clear } = useDispersantSelection();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('compositeScore');

  useEffect(() => {
    window.api.getAllNanoParticles().then(setNanoParticles).catch(() => { /* 初期ロード失敗時は空リスト */ });
    window.api.getAllSolvents().then(setSolvents).catch(() => { /* 初期ロード失敗時は空リスト */ });
  }, []);

  const filteredParticles = useMemo(() => {
    if (!categoryFilter) return nanoParticles;
    return nanoParticles.filter((p) => p.category === categoryFilter);
  }, [nanoParticles, categoryFilter]);

  const handleExecute = async () => {
    if (mode === 'dispersantScreen' && selectedParticle && selectedSolvent) {
      await screenDispersants(selectedParticle.id, selectedSolvent.id);
    } else if (mode === 'solventScreen' && selectedParticle && selectedDispersant) {
      await screenSolvents(selectedParticle.id, selectedDispersant.id);
    } else if (mode === 'fallback' && selectedParticle) {
      await screenFallback(selectedParticle.id);
    }
  };

  const canExecute = !evalLoading && selectedParticle && (
    (mode === 'dispersantScreen' && selectedSolvent) ||
    (mode === 'solventScreen' && selectedDispersant) ||
    (mode === 'fallback')
  );

  // 分散剤スクリーニング結果のソート
  const sortedScreenResults = useMemo(() => {
    const items = screenResult ? [...screenResult.results] : solventResult ? [...solventResult.results] : [];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = (mode === 'solventScreen' ? a.solvent.name : a.dispersant.name)
            .localeCompare(mode === 'solventScreen' ? b.solvent.name : b.dispersant.name, 'ja');
          break;
        case 'raAnchor': cmp = a.raAnchor - b.raAnchor; break;
        case 'redAnchor': cmp = a.redAnchor - b.redAnchor; break;
        case 'raSolvation': cmp = a.raSolvation - b.raSolvation; break;
        case 'redSolvation': cmp = a.redSolvation - b.redSolvation; break;
        case 'compositeScore': cmp = a.compositeScore - b.compositeScore; break;
        case 'overallLevel': cmp = a.overallLevel - b.overallLevel; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [screenResult, solventResult, sortKey, sortDir, mode]);

  // 統計サマリー
  const stats = useMemo(() => {
    const results = screenResult?.results ?? solventResult?.results;
    if (!results || results.length === 0) return null;
    const total = results.length;
    const recommended = results.filter((r) => r.redAnchor < 1 && r.redSolvation < 1).length;
    const bestScore = Math.min(...results.map((r) => r.compositeScore));
    const best = results.find((r) => r.compositeScore === bestScore);
    const bestName = best
      ? (mode === 'solventScreen' ? best.solvent.name : best.dispersant.name)
      : '-';
    return { total, recommended, bestScore, bestName };
  }, [screenResult, solventResult, mode]);

  const isRecommended = (r: DispersantScreeningResult) => r.redAnchor < 1 && r.redSolvation < 1;

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">分散剤選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          HSPに基づき、分散剤のアンカー基（粒子吸着）と溶媒和鎖（分散媒溶解）の二部構造を評価し、
          最適な分散剤候補をスクリーニングします。
        </p>

        {/* モード切替 */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'dispersantScreen' as Mode, label: '分散剤スクリーニング' },
            { key: 'solventScreen' as Mode, label: '溶媒スクリーニング' },
            { key: 'fallback' as Mode, label: '簡易評価（全体HSP）' },
          ]).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => { setMode(key); clear(); }}
              className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
                mode === key
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 粒子選択 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ナノ粒子</label>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as NanoParticleCategory | '')}
                className="border border-gray-300 rounded-md px-2 py-2 text-sm"
              >
                <option value="">全カテゴリ</option>
                <option value="carbon">カーボン系</option>
                <option value="metal">金属</option>
                <option value="metal_oxide">金属酸化物</option>
                <option value="quantum_dot">量子ドット</option>
                <option value="polymer">高分子</option>
                <option value="other">その他</option>
              </select>
              <select
                value={selectedParticle?.id ?? ''}
                onChange={(e) => {
                  const p = nanoParticles.find((np) => np.id === Number(e.target.value)) ?? null;
                  setSelectedParticle(p);
                  clear();
                }}
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">選択してください...</option>
                {filteredParticles.map((np) => (
                  <option key={np.id} value={np.id}>
                    {np.name}{np.nameEn ? ` (${np.nameEn})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 分散剤モード: 溶媒選択 / 溶媒モード: 分散剤選択 */}
          {mode === 'dispersantScreen' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">溶媒（分散媒）</label>
              <select
                value={selectedSolvent?.id ?? ''}
                onChange={(e) => {
                  const s = solvents.find((sv) => sv.id === Number(e.target.value)) ?? null;
                  setSelectedSolvent(s);
                  clear();
                }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">選択してください...</option>
                {solvents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}{s.nameEn ? ` (${s.nameEn})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
          {mode === 'solventScreen' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">分散剤</label>
              <select
                value={selectedDispersant?.id ?? ''}
                onChange={(e) => {
                  const d = dispersants.find((dp) => dp.id === Number(e.target.value)) ?? null;
                  setSelectedDispersant(d);
                  clear();
                }}
                disabled={dispersantsLoading}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">選択してください...</option>
                {dispersants.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}{d.nameEn ? ` (${d.nameEn})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 選択中の粒子情報 */}
        {selectedParticle && (
          <div className="bg-blue-50 rounded-md p-3 mb-4 text-sm">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              <div><span className="text-gray-500">δD:</span> {selectedParticle.hsp.deltaD.toFixed(1)}</div>
              <div><span className="text-gray-500">δP:</span> {selectedParticle.hsp.deltaP.toFixed(1)}</div>
              <div><span className="text-gray-500">δH:</span> {selectedParticle.hsp.deltaH.toFixed(1)}</div>
              <div><span className="text-gray-500">R₀:</span> {selectedParticle.r0.toFixed(1)}</div>
              {selectedParticle.particleSize != null && (
                <div><span className="text-gray-500">粒子径:</span> {selectedParticle.particleSize} nm</div>
              )}
            </div>
          </div>
        )}

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleExecute}
            disabled={!canExecute}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {evalLoading ? '評価中...' : 'スクリーニング実行'}
          </button>
          <BookmarkButton
            pipeline="dispersantSelection"
            params={{ particleId: selectedParticle?.id, solventId: selectedSolvent?.id, dispersantId: selectedDispersant?.id, mode }}
            disabled={!canExecute}
          />
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 精度警告 */}
      {(screenResult || solventResult) && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-amber-800 text-xs">
          <strong>注意:</strong> アンカー基・溶媒和鎖の分離HSP値には推定値が含まれます。
          分散安定性にはHSP以外の要因（電荷、立体効果、粘度、粒子サイズ等）も影響します。
          最終的には実験による検証が必要です。
        </div>
      )}

      {/* 統計サマリー */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-gray-500">評価数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.recommended}</div>
              <div className="text-gray-500">推奨候補 (両RED &lt; 1)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.bestScore.toFixed(3)}</div>
              <div className="text-gray-500">最小スコア</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 truncate">{stats.bestName}</div>
              <div className="text-gray-500">最適候補</div>
            </div>
          </div>
        </div>
      )}

      {/* 結果テーブル: 横並び（アンカー基 + 溶媒和鎖 + 総合） */}
      {sortedScreenResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label={mode === 'solventScreen' ? '溶媒' : '分散剤'} field="name" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  {/* アンカー基評価 */}
                  <th className="px-2 py-2 text-xs text-center text-gray-400 border-l border-gray-200" colSpan={2}>アンカー基 → 粒子</th>
                  {/* 溶媒和鎖評価 */}
                  <th className="px-2 py-2 text-xs text-center text-gray-400 border-l border-gray-200" colSpan={2}>溶媒和鎖 → 溶媒</th>
                  {/* 総合 */}
                  <th className="px-2 py-2 text-xs text-center text-gray-400 border-l border-gray-200" colSpan={2}>総合</th>
                </tr>
                <tr>
                  <th className="px-3 py-1"></th>
                  <SortTableHeader label="Ra" field="raAnchor" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="redAnchor" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="raSolvation" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="border-l border-gray-200" />
                  <SortTableHeader label="RED" field="redSolvation" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="スコア" field="compositeScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} className="border-l border-gray-200" />
                  <SortTableHeader label="判定" field="overallLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedScreenResults.map((r, i) => {
                  const recommended = isRecommended(r);
                  const name = mode === 'solventScreen' ? r.solvent.name : r.dispersant.name;
                  return (
                    <tr
                      key={i}
                      className={recommended ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-gray-50'}
                    >
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">
                        {recommended && <span className="mr-1" title="推奨候補">*</span>}
                        {name}
                      </td>
                      {/* アンカー基 */}
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.raAnchor.toFixed(2)}</td>
                      <td className="px-3 py-2.5">
                        <DispersantBadge level={r.affinityAnchor} red={r.redAnchor} />
                      </td>
                      {/* 溶媒和鎖 */}
                      <td className="px-3 py-2.5 text-sm text-gray-500 border-l border-gray-100">{r.raSolvation.toFixed(2)}</td>
                      <td className="px-3 py-2.5">
                        <DispersantBadge level={r.affinitySolvation} red={r.redSolvation} />
                      </td>
                      {/* 総合 */}
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-700 border-l border-gray-100">
                        {r.compositeScore.toFixed(3)}
                      </td>
                      <td className="px-3 py-2.5">
                        <DispersantBadge level={r.overallLevel} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* フォールバック結果テーブル */}
      {fallbackResult && fallbackResult.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h3 className="text-sm font-medium text-gray-700">簡易評価結果（全体HSPのみ）</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">分散剤</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ra</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">RED</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">判定</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {fallbackResult.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.dispersant.name}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.raOverall.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.redOverall.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <DispersantBadge level={r.affinity} red={r.redOverall} />
                    </td>
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
