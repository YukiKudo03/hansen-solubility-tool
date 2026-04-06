import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Plot from 'react-plotly.js';
import type { PartsGroup, Solvent } from '../../core/types';
import type { ExperimentalResultRow } from '../../db/experimental-repository';
import type { ModelAccuracyMetrics } from '../../core/model-accuracy';
import type { SphereFitResult } from '../../core/sphere-fitting';
import type { ExperimentalRow, SolventMatchResult } from '../../core/experimental-import';
import { buildScatterData, buildSphereData, redToColor } from '../../core/hsp-visualization';
import { calculateRed } from '../../core/hsp';
import PartsGroupSelector from './PartsGroupSelector';
import ModelAccuracyCard from './ModelAccuracyCard';
import SolventMappingModal from './SolventMappingModal';

export default function HSPVisualizationView() {
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [showSpheres, setShowSpheres] = useState(true);
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 実験データ状態
  const [experimentalResults, setExperimentalResults] = useState<ExperimentalResultRow[]>([]);
  const [showExperimental, setShowExperimental] = useState(true);
  const [accuracy, setAccuracy] = useState<ModelAccuracyMetrics | null>(null);
  const [treatPartialAs, setTreatPartialAs] = useState<'good' | 'bad'>('good');
  const [refineResult, setRefineResult] = useState<SphereFitResult | null>(null);
  const [showRefinedSphere, setShowRefinedSphere] = useState(false);

  // インポート状態
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [mappingModal, setMappingModal] = useState<{
    unmatchedNames: string[];
    parsedRows: ExperimentalRow[];
    matchResult: SolventMatchResult;
  } | null>(null);

  useEffect(() => {
    window.api.getAllSolvents()
      .then(setSolvents)
      .catch((e) => setLoadError(e instanceof Error ? e.message : '溶媒の読み込みに失敗しました'));
  }, []);

  // 選択部品変更時に実験データ読み込み
  const selectedPart = selectedGroup?.parts[0] ?? null;

  const loadExperimentalData = useCallback(async () => {
    if (!selectedPart) {
      setExperimentalResults([]);
      setAccuracy(null);
      setRefineResult(null);
      return;
    }
    try {
      const results = await window.api.experimentalGetResults(selectedPart.id);
      setExperimentalResults(results);

      if (results.length > 0) {
        const metrics = await window.api.experimentalModelAccuracy({
          polymerId: selectedPart.id,
          polymerHSP: selectedPart.hsp,
          r0: selectedPart.r0,
          treatPartialAs,
        });
        setAccuracy(metrics);
      } else {
        setAccuracy(null);
      }
    } catch {
      setExperimentalResults([]);
      setAccuracy(null);
    }
  }, [selectedPart, treatPartialAs]);

  useEffect(() => {
    loadExperimentalData();
    setRefineResult(null);
    setShowRefinedSphere(false);
  }, [loadExperimentalData]);

  // CSVインポート
  const handleImport = async () => {
    if (!selectedPart) return;
    setImporting(true);
    setImportError(null);

    try {
      const result = await window.api.experimentalImport({
        polymerId: selectedPart.id,
        treatPartialAs,
      });

      if (!result) { setImporting(false); return; } // キャンセル
      if (!result.success) {
        setImportError(result.errors.join('\n'));
        setImporting(false);
        return;
      }

      const { rows, matchResult } = result;
      if (!rows || !matchResult) { setImporting(false); return; }

      // 全件自動マッチ → マッピングダイアログスキップ、直接インポート
      if (matchResult.unmatched.length === 0) {
        await saveImport(rows, matchResult, []);
      } else {
        // 未マッチあり → バッチマッピングモーダル表示
        setMappingModal({ unmatchedNames: matchResult.unmatched, parsedRows: rows, matchResult });
      }
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'インポートに失敗しました');
    } finally {
      setImporting(false);
    }
  };

  // インポート確定
  const saveImport = async (
    rows: ExperimentalRow[],
    matchResult: SolventMatchResult,
    manualMappings: Array<{ rawName: string; solventId: number }>,
  ) => {
    if (!selectedPart) return;

    // 自動マッチ + 手動マッピングをマージ
    const solventIdMap = new Map<string, number>();
    for (const m of matchResult.matched) {
      solventIdMap.set(m.rawName, m.solvent.id);
    }
    for (const m of manualMappings) {
      solventIdMap.set(m.rawName, m.solventId);
    }

    const importRows = rows.map((r) => ({
      solventNameRaw: r.solventNameRaw,
      solventId: solventIdMap.get(r.solventNameRaw) ?? null,
      result: r.result,
      quantitativeValue: r.quantitativeValue,
      quantitativeUnit: r.quantitativeUnit,
      temperatureC: r.temperatureC,
      concentration: r.concentration,
      notes: r.notes,
    }));

    // Finding 6: マッピングとデータを同一IPC呼び出しでアトミックに保存
    await window.api.experimentalSaveImport({
      polymerId: selectedPart.id,
      rows: importRows,
      mappings: manualMappings.length > 0 ? manualMappings : undefined,
    });

    setMappingModal(null);
    await loadExperimentalData();
  };

  // Refine Sphere
  const handleRefine = async () => {
    if (!selectedPart) return;
    try {
      const result = await window.api.experimentalRefitSphere({
        polymerId: selectedPart.id,
        treatPartialAs,
      });
      setRefineResult(result);
      setShowRefinedSphere(true);
    } catch (e) {
      setImportError(e instanceof Error ? e.message : 'Refine Sphereに失敗しました');
    }
  };

  // 実験データ全削除（確認ダイアログ付き）
  const handleDeleteExperimental = async () => {
    if (!selectedPart) return;
    const confirmed = window.confirm(
      `${selectedPart.name} の実験データ ${experimentalResults.length}件 を全て削除しますか？\nこの操作は元に戻せません。`,
    );
    if (!confirmed) return;
    await window.api.experimentalDeleteByPolymer(selectedPart.id);
    await loadExperimentalData();
    setRefineResult(null);
    setShowRefinedSphere(false);
  };

  // 溶媒の散布点データ
  const solventScatter = useMemo(() => buildScatterData(solvents), [solvents]);

  // 実験点の溶媒IDマップ
  const solventById = useMemo(() => new Map(solvents.map((s) => [s.id, s])), [solvents]);

  // 部品のHSP球データ + 溶媒の色分け + 実験オーバーレイ
  const plotData = useMemo(() => {
    const traces: any[] = [];

    // 溶媒散布点（部品が選択されている場合はRED値で色分け）
    if (selectedGroup && selectedGroup.parts.length > 0) {
      const firstPart = selectedGroup.parts[0];
      const colors = solvents.map((s) => {
        const red = calculateRed(firstPart.hsp, s.hsp, firstPart.r0);
        return redToColor(red);
      });

      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        name: '溶媒',
        x: solventScatter.x,
        y: solventScatter.y,
        z: solventScatter.z,
        text: solventScatter.names,
        hovertemplate: '%{text}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<extra></extra>',
        marker: { size: 4, color: colors, opacity: 0.8 },
      });

      // HSP球
      if (showSpheres) {
        for (const part of selectedGroup.parts) {
          const sphere = buildSphereData(part);
          traces.push({
            type: 'mesh3d',
            name: part.name,
            x: sphere.vertices.x,
            y: sphere.vertices.y,
            z: sphere.vertices.z,
            alphahull: 0,
            opacity: 0.15,
            color: '#3B82F6',
            hoverinfo: 'name',
          });
          // 中心点
          traces.push({
            type: 'scatter3d',
            mode: 'markers+text',
            name: `${part.name} (中心)`,
            x: [sphere.center.x],
            y: [sphere.center.y],
            z: [sphere.center.z],
            text: [part.name],
            textposition: 'top center',
            marker: { size: 6, color: '#1D4ED8', symbol: 'diamond' },
            hovertemplate: `${part.name}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<br>R₀=${part.r0.toFixed(1)}<extra></extra>`,
          });
        }
      }

      // Refined Sphere
      if (showRefinedSphere && refineResult) {
        const c = refineResult.center;
        const r = refineResult.r0;
        // 球面のワイヤーフレーム表現（mesh3d で半透明オレンジ）
        const N = 20;
        const xs: number[] = [], ys: number[] = [], zs: number[] = [];
        for (let lat = 0; lat <= N; lat++) {
          const theta = (Math.PI * lat) / N;
          for (let lon = 0; lon <= N; lon++) {
            const phi = (2 * Math.PI * lon) / N;
            xs.push(c.deltaD + r * Math.sin(theta) * Math.cos(phi));
            ys.push(c.deltaP + r * Math.sin(theta) * Math.sin(phi));
            zs.push(c.deltaH + r * Math.cos(theta));
          }
        }
        traces.push({
          type: 'mesh3d',
          name: 'Refined Sphere',
          x: xs, y: ys, z: zs,
          alphahull: 0,
          opacity: 0.1,
          color: '#F97316',
          hoverinfo: 'name',
        });
        // Refined center
        traces.push({
          type: 'scatter3d',
          mode: 'markers+text',
          name: 'Refined 中心',
          x: [c.deltaD], y: [c.deltaP], z: [c.deltaH],
          text: ['Refined'],
          textposition: 'top center',
          marker: { size: 6, color: '#EA580C', symbol: 'diamond' },
          hovertemplate: `Refined<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<br>R₀=${r.toFixed(1)}<extra></extra>`,
        });
      }
    } else {
      // 部品未選択時は溶媒のみ表示
      traces.push({
        type: 'scatter3d',
        mode: 'markers',
        name: '溶媒',
        x: solventScatter.x,
        y: solventScatter.y,
        z: solventScatter.z,
        text: solventScatter.names,
        hovertemplate: '%{text}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<extra></extra>',
        marker: { size: 4, color: '#6B7280', opacity: 0.6 },
      });
    }

    // 実験データオーバーレイ
    if (showExperimental && experimentalResults.length > 0) {
      const resultColorMap = { good: '#22C55E', partial: '#EAB308', bad: '#EF4444' };
      const resultLabelMap = { good: '実験:Good', partial: '実験:Partial', bad: '実験:Bad' };

      for (const resultType of ['good', 'partial', 'bad'] as const) {
        const points = experimentalResults
          .filter((r) => r.result === resultType && r.solventId != null)
          .map((r) => {
            const solvent = solventById.get(r.solventId!);
            return solvent ? { name: r.solventNameRaw, hsp: solvent.hsp } : null;
          })
          .filter((p): p is NonNullable<typeof p> => p !== null);

        if (points.length > 0) {
          traces.push({
            type: 'scatter3d',
            mode: 'markers',
            name: resultLabelMap[resultType],
            x: points.map((p) => p.hsp.deltaD),
            y: points.map((p) => p.hsp.deltaP),
            z: points.map((p) => p.hsp.deltaH),
            text: points.map((p) => p.name),
            hovertemplate: '%{text}<br>δD=%{x:.1f} δP=%{y:.1f} δH=%{z:.1f}<extra></extra>',
            marker: {
              size: 7,
              color: resultColorMap[resultType],
              opacity: 0.9,
              symbol: 'cross',
              line: { width: 1, color: '#374151' },
            },
          });
        }
      }
    }

    return traces;
  }, [selectedGroup, solvents, solventScatter, showSpheres, showExperimental, experimentalResults, solventById, showRefinedSphere, refineResult]);

  const layout = {
    autosize: true,
    margin: { l: 0, r: 0, t: 30, b: 0 },
    scene: {
      xaxis: { title: 'δD (MPa½)' },
      yaxis: { title: 'δP (MPa½)' },
      zaxis: { title: 'δH (MPa½)' },
    },
    showlegend: true,
    legend: { x: 0, y: 1 },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">HSP 3D可視化</h2>
        <p className="text-xs text-gray-500 mb-4">
          δD-δP-δH空間に溶媒と材料のHSP球をプロットします。HSP球内の溶媒は溶解リスクが高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => setSelectedGroup(g)}
            selected={selectedGroup}
          />
          <div className="flex items-center gap-3 flex-wrap">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showSpheres}
                onChange={(e) => setShowSpheres(e.target.checked)}
                className="rounded border-gray-300"
              />
              HSP球を表示
            </label>
            {experimentalResults.length > 0 && (
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExperimental}
                  onChange={(e) => setShowExperimental(e.target.checked)}
                  className="rounded border-gray-300"
                />
                実験データ表示
              </label>
            )}
          </div>
        </div>

        {/* 実験データ操作ボタン */}
        {selectedPart && (
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleImport}
              disabled={importing}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? 'インポート中...' : '実験データ読込 (CSV)'}
            </button>
            {experimentalResults.length > 0 && (
              <>
                <button
                  onClick={handleRefine}
                  className="px-4 py-2 text-sm text-white bg-orange-500 rounded-lg hover:bg-orange-600"
                >
                  Refine Sphere
                </button>
                <button
                  onClick={handleDeleteExperimental}
                  className="px-3 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                >
                  実験データ削除
                </button>
                <span className="text-xs text-gray-500">
                  実験データ: {experimentalResults.length}件
                </span>
              </>
            )}
          </div>
        )}

        {importError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-700 whitespace-pre-wrap">{importError}</p>
            <button
              onClick={() => setImportError(null)}
              className="text-xs text-red-500 underline mt-1"
            >
              閉じる
            </button>
          </div>
        )}

        {selectedGroup && (
          <div className="text-xs text-gray-500 mb-2">
            溶媒: {solvents.length}種 / 材料: {selectedGroup.parts.length}種
            {selectedGroup.parts.length > 0 && (
              <span className="ml-2">
                （色: 緑=安全 → 黄=注意 → 赤=危険、{selectedGroup.parts[0].name} 基準）
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3Dプロット */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: 600 }}>
        <Plot
          data={plotData}
          layout={layout}
          config={{ responsive: true, displayModeBar: true }}
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Model Accuracy カード */}
      <ModelAccuracyCard
        metrics={accuracy}
        treatPartialAs={treatPartialAs}
        onTreatPartialAsChange={(v) => setTreatPartialAs(v)}
      />

      {/* Refine Sphere 比較 */}
      {refineResult && selectedPart && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-800">Refine Sphere 比較</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showRefinedSphere}
                onChange={(e) => setShowRefinedSphere(e.target.checked)}
                className="rounded border-gray-300"
              />
              3Dプロットに表示
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-2">元のHSP球（DB値）</div>
              <div className="space-y-1">
                <div>δD = {selectedPart.hsp.deltaD.toFixed(1)}</div>
                <div>δP = {selectedPart.hsp.deltaP.toFixed(1)}</div>
                <div>δH = {selectedPart.hsp.deltaH.toFixed(1)}</div>
                <div>R₀ = {selectedPart.r0.toFixed(1)}</div>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-2">Refined（実験データベース）</div>
              <div className="space-y-1">
                <div>
                  δD = {refineResult.center.deltaD.toFixed(1)}
                  <span className={`ml-2 text-xs ${Math.abs(refineResult.center.deltaD - selectedPart.hsp.deltaD) > 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                    (Δ{(refineResult.center.deltaD - selectedPart.hsp.deltaD).toFixed(1)})
                  </span>
                </div>
                <div>
                  δP = {refineResult.center.deltaP.toFixed(1)}
                  <span className={`ml-2 text-xs ${Math.abs(refineResult.center.deltaP - selectedPart.hsp.deltaP) > 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                    (Δ{(refineResult.center.deltaP - selectedPart.hsp.deltaP).toFixed(1)})
                  </span>
                </div>
                <div>
                  δH = {refineResult.center.deltaH.toFixed(1)}
                  <span className={`ml-2 text-xs ${Math.abs(refineResult.center.deltaH - selectedPart.hsp.deltaH) > 1 ? 'text-orange-500' : 'text-gray-400'}`}>
                    (Δ{(refineResult.center.deltaH - selectedPart.hsp.deltaH).toFixed(1)})
                  </span>
                </div>
                <div>
                  R₀ = {refineResult.r0.toFixed(1)}
                  <span className={`ml-2 text-xs ${Math.abs(refineResult.r0 - selectedPart.r0) > 0.5 ? 'text-orange-500' : 'text-gray-400'}`}>
                    (Δ{(refineResult.r0 - selectedPart.r0).toFixed(1)})
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-500">
            分類正解率: {refineResult.correctCount}/{refineResult.totalCount}
            {refineResult.misclassified.length > 0 && (
              <span className="ml-2 text-orange-500">
                不一致: {refineResult.misclassified.map((m) => m.name).join(', ')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* 溶媒名マッピングモーダル */}
      {mappingModal && (
        <SolventMappingModal
          unmatchedNames={mappingModal.unmatchedNames}
          solvents={solvents}
          onConfirm={async (manualMappings) => {
            await saveImport(mappingModal.parsedRows, mappingModal.matchResult, manualMappings);
          }}
          onCancel={() => setMappingModal(null)}
        />
      )}
    </div>
  );
}
