import React, { useState, useMemo, useEffect } from 'react';
import { formatBlendOptimizationCsv } from '../../core/report';
import { useSolvents } from '../hooks/useSolvents';
import { useBlendOptimizer } from '../hooks/useBlendOptimizer';
import { usePartsGroups } from '../hooks/usePartsGroups';
import { useDrugs } from '../hooks/useDrugs';
import type { NanoParticle } from '../../core/types';

export default function BlendOptimizerView() {
  const { solvents, loading: solventsLoading } = useSolvents();
  const { result, loading: optimizing, error, optimize, clear } = useBlendOptimizer();

  // ターゲットHSP入力
  const [targetDeltaD, setTargetDeltaD] = useState<string>('');
  const [targetDeltaP, setTargetDeltaP] = useState<string>('');
  const [targetDeltaH, setTargetDeltaH] = useState<string>('');

  // 候補溶媒チェックボックス
  const [selectedSolventIds, setSelectedSolventIds] = useState<Set<number>>(new Set());

  // 設定
  const [maxComponents, setMaxComponents] = useState<2 | 3>(2);
  const [stepSize, setStepSize] = useState<string>('0.05');
  const [topN, setTopN] = useState<string>('20');

  const [csvError, setCsvError] = useState<string | null>(null);

  // 材料参照
  type RefType = '' | 'part' | 'nanoparticle' | 'drug';
  const [refType, setRefType] = useState<RefType>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [selectedDrugId, setSelectedDrugId] = useState<string>('');
  const [selectedNanoId, setSelectedNanoId] = useState<string>('');
  const [nanoParticles, setNanoParticles] = useState<NanoParticle[]>([]);

  const { groups } = usePartsGroups();
  const { drugs } = useDrugs();

  useEffect(() => {
    if (refType === 'nanoparticle') {
      window.api.getAllNanoParticles().then(setNanoParticles);
    }
  }, [refType]);

  const selectedGroup = groups.find(g => g.id === Number(selectedGroupId));

  const applyHSP = (hsp: { deltaD: number; deltaP: number; deltaH: number }) => {
    setTargetDeltaD(String(hsp.deltaD));
    setTargetDeltaP(String(hsp.deltaP));
    setTargetDeltaH(String(hsp.deltaH));
    clear();
  };

  const handleRefTypeChange = (type: RefType) => {
    setRefType(type);
    setSelectedGroupId('');
    setSelectedPartId('');
    setSelectedDrugId('');
    setSelectedNanoId('');
  };

  const handlePartSelect = (partId: string) => {
    setSelectedPartId(partId);
    const part = selectedGroup?.parts.find(p => p.id === Number(partId));
    if (part) applyHSP(part.hsp);
  };

  const handleDrugSelect = (drugId: string) => {
    setSelectedDrugId(drugId);
    const drug = drugs.find(d => d.id === Number(drugId));
    if (drug) applyHSP(drug.hsp);
  };

  const handleNanoSelect = (nanoId: string) => {
    setSelectedNanoId(nanoId);
    const np = nanoParticles.find(n => n.id === Number(nanoId));
    if (np) applyHSP(np.hsp);
  };

  const canOptimize =
    targetDeltaD !== '' &&
    targetDeltaP !== '' &&
    targetDeltaH !== '' &&
    selectedSolventIds.size >= 2 &&
    !optimizing;

  const handleToggleSolvent = (id: number) => {
    setSelectedSolventIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    clear();
  };

  const handleSelectAll = () => {
    setSelectedSolventIds(new Set(solvents.map((s) => s.id)));
    clear();
  };

  const handleClearAll = () => {
    setSelectedSolventIds(new Set());
    clear();
  };

  const handleOptimize = async () => {
    const dD = parseFloat(targetDeltaD);
    const dP = parseFloat(targetDeltaP);
    const dH = parseFloat(targetDeltaH);
    const step = parseFloat(stepSize);
    const top = parseInt(topN, 10);

    if (isNaN(dD) || isNaN(dP) || isNaN(dH) || isNaN(step) || isNaN(top)) return;

    await optimize({
      targetDeltaD: dD,
      targetDeltaP: dP,
      targetDeltaH: dH,
      candidateSolventIds: Array.from(selectedSolventIds),
      maxComponents,
      stepSize: step,
      topN: top,
    });
  };

  const handleExportCsv = async () => {
    if (!result) return;
    setCsvError(null);
    const csv = formatBlendOptimizationCsv(result);
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">溶剤ブレンド最適化</h2>
        <p className="text-xs text-gray-500 mb-4">
          ターゲットHSPに最も近いブレンド組成を候補溶媒から探索します。
        </p>

        {/* ターゲットHSP入力 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">ターゲットHSP</h3>

          {/* 材料から参照 */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <h4 className="text-xs font-medium text-gray-600 mb-2">材料から参照</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label htmlFor="ref-type" className="block text-xs text-gray-500 mb-1">参照元</label>
                <select
                  id="ref-type"
                  aria-label="参照元"
                  value={refType}
                  onChange={(e) => handleRefTypeChange(e.target.value as RefType)}
                  className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                >
                  <option value="">-- 手入力 --</option>
                  <option value="part">ポリマー材料</option>
                  <option value="nanoparticle">ナノ粒子</option>
                  <option value="drug">薬物</option>
                </select>
              </div>

              {refType === 'part' && (
                <>
                  <div>
                    <label htmlFor="ref-group" className="block text-xs text-gray-500 mb-1">グループ</label>
                    <select
                      id="ref-group"
                      aria-label="グループ"
                      value={selectedGroupId}
                      onChange={(e) => { setSelectedGroupId(e.target.value); setSelectedPartId(''); }}
                      className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                    >
                      <option value="">選択...</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                  {selectedGroup && (
                    <div>
                      <label htmlFor="ref-part" className="block text-xs text-gray-500 mb-1">材料</label>
                      <select
                        id="ref-part"
                        aria-label="材料"
                        value={selectedPartId}
                        onChange={(e) => handlePartSelect(e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                      >
                        <option value="">選択...</option>
                        {selectedGroup.parts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {refType === 'drug' && (
                <div>
                  <label htmlFor="ref-drug" className="block text-xs text-gray-500 mb-1">薬物</label>
                  <select
                    id="ref-drug"
                    aria-label="薬物"
                    value={selectedDrugId}
                    onChange={(e) => handleDrugSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                  >
                    <option value="">選択...</option>
                    {drugs.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}

              {refType === 'nanoparticle' && (
                <div>
                  <label htmlFor="ref-nano" className="block text-xs text-gray-500 mb-1">ナノ粒子</label>
                  <select
                    id="ref-nano"
                    aria-label="ナノ粒子"
                    value={selectedNanoId}
                    onChange={(e) => handleNanoSelect(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                  >
                    <option value="">選択...</option>
                    {nanoParticles.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">δD (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaD}
                onChange={(e) => { setTargetDeltaD(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 18.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">δP (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaP}
                onChange={(e) => { setTargetDeltaP(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 10.0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">δH (MPa½)</label>
              <input
                type="number"
                step="0.1"
                value={targetDeltaH}
                onChange={(e) => { setTargetDeltaH(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: 12.0"
              />
            </div>
          </div>
        </div>

        {/* 最適化パラメータ */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">最適化設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* maxComponents */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">最大成分数</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="maxComponents"
                    value="2"
                    checked={maxComponents === 2}
                    onChange={() => { setMaxComponents(2); clear(); }}
                    className="text-blue-600"
                  />
                  2成分
                </label>
                <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="maxComponents"
                    value="3"
                    checked={maxComponents === 3}
                    onChange={() => { setMaxComponents(3); clear(); }}
                    className="text-blue-600"
                  />
                  3成分
                </label>
              </div>
            </div>

            {/* stepSize */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">ステップサイズ</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="0.5"
                value={stepSize}
                onChange={(e) => { setStepSize(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">混合比の刻み幅 (例: 0.05 = 5%)</p>
            </div>

            {/* topN */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">上位件数</label>
              <input
                type="number"
                step="1"
                min="1"
                max="100"
                value={topN}
                onChange={(e) => { setTopN(e.target.value); clear(); }}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 候補溶媒選択 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              候補溶媒 ({selectedSolventIds.size} / {solvents.length} 選択中)
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleSelectAll}
                disabled={solventsLoading}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                全選択
              </button>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                全解除
              </button>
            </div>
          </div>
          {solventsLoading ? (
            <p className="text-sm text-gray-400">読み込み中...</p>
          ) : (
            <div className="border border-gray-200 rounded-md max-h-48 overflow-y-auto p-2 grid grid-cols-2 md:grid-cols-3 gap-1">
              {solvents.map((s) => (
                <label key={s.id} className="flex items-center gap-1.5 text-xs cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded">
                  <input
                    type="checkbox"
                    checked={selectedSolventIds.has(s.id)}
                    onChange={() => handleToggleSolvent(s.id)}
                    className="rounded border-gray-300 text-blue-600"
                  />
                  <span className="truncate">{s.name}</span>
                </label>
              ))}
            </div>
          )}
          {selectedSolventIds.size < 2 && (
            <p className="text-xs text-amber-600 mt-1">2種類以上の溶媒を選択してください。</p>
          )}
        </div>

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleOptimize}
            disabled={!canOptimize}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {optimizing ? '最適化中...' : 'ブレンド最適化実行'}
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
      {(error || csvError) && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.topResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              最適化結果 (ターゲット: δD={result.targetHSP.deltaD.toFixed(1)}, δP={result.targetHSP.deltaP.toFixed(1)}, δH={result.targetHSP.deltaH.toFixed(1)})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">順位</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">成分 (体積分率)</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ブレンド δD</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ブレンド δP</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ブレンド δH</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ra</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.topResults.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{idx + 1}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700">
                      {r.components.map((c, ci) => (
                        <span key={ci}>
                          {ci > 0 && <span className="text-gray-400"> + </span>}
                          <span className="font-medium">{c.solvent.name}</span>
                          <span className="text-gray-500"> ({(c.volumeFraction * 100).toFixed(0)}%)</span>
                        </span>
                      ))}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.blendHSP.deltaD.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.blendHSP.deltaP.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.blendHSP.deltaH.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.ra.toFixed(3)}</td>
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
