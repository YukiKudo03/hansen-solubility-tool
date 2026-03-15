import React, { useState, useMemo } from 'react';
import type { PartsGroup, Solvent, Part, ContactAngleResult } from '../../core/types';
import { formatContactAngleCsv } from '../../core/report';
import PartsGroupSelector from './PartsGroupSelector';
import SolventSelector from './SolventSelector';
import WettabilityBadge from './WettabilityBadge';
import { useContactAngle } from '../hooks/useContactAngle';

type Mode = 'group' | 'screening';
type SortKey = 'partName' | 'solventName' | 'contactAngle' | 'wettability' | 'gammaLV' | 'gammaSV' | 'gammaSL';
type SortDir = 'asc' | 'desc';

function SortHeader({ label, field, sortKey, sortDir, onToggle, className }: {
  label: string; field: SortKey; sortKey: SortKey; sortDir: SortDir;
  onToggle: (key: SortKey) => void; className?: string;
}) {
  return (
    <th
      onClick={() => onToggle(field)}
      className={`px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none ${className ?? ''}`}
    >
      {label} {sortKey === field && (sortDir === 'asc' ? '▲' : '▼')}
    </th>
  );
}

export default function ContactAngleView() {
  const [mode, setMode] = useState<Mode>('group');
  const [selectedGroup, setSelectedGroup] = useState<PartsGroup | null>(null);
  const [selectedSolvent, setSelectedSolvent] = useState<Solvent | null>(null);
  const [selectedPartId, setSelectedPartId] = useState<number | null>(null);

  const { result, loading, error, evaluate, screenAll, clear } = useContactAngle();
  const [csvError, setCsvError] = useState<string | null>(null);

  // ソート
  const [sortKey, setSortKey] = useState<SortKey>('contactAngle');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const canEvaluateGroup = mode === 'group' && selectedGroup && selectedSolvent && !loading;
  const canScreen = mode === 'screening' && selectedGroup && selectedPartId && !loading;

  const handleEvaluate = async () => {
    if (mode === 'group' && selectedGroup && selectedSolvent) {
      await evaluate(selectedGroup.id, selectedSolvent.id);
    } else if (mode === 'screening' && selectedPartId && selectedGroup) {
      await screenAll(selectedPartId, selectedGroup.id);
    }
  };

  const handleExportCsv = async () => {
    if (!result) return;
    setCsvError(null);
    const csv = formatContactAngleCsv(result);
    try {
      await window.api.saveCsv(csv);
    } catch (e) {
      setCsvError(e instanceof Error ? e.message : 'CSV保存中にエラーが発生しました');
    }
  };

  const sortedResults = useMemo(() => {
    if (!result) return [];
    const items = [...result.results];
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'partName':
          cmp = a.part.name.localeCompare(b.part.name, 'ja');
          break;
        case 'solventName':
          cmp = a.solvent.name.localeCompare(b.solvent.name, 'ja');
          break;
        case 'contactAngle':
          cmp = a.contactAngle - b.contactAngle;
          break;
        case 'wettability':
          cmp = a.wettability - b.wettability;
          break;
        case 'gammaLV':
          cmp = a.surfaceTensionLV - b.surfaceTensionLV;
          break;
        case 'gammaSV':
          cmp = a.surfaceEnergySV - b.surfaceEnergySV;
          break;
        case 'gammaSL':
          cmp = a.interfacialTension - b.interfacialTension;
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  // 統計サマリー
  const stats = useMemo(() => {
    if (!result || result.results.length === 0) return null;
    const total = result.results.length;
    const hydrophilic = result.results.filter((r) => r.contactAngle < 90).length;
    const minAngle = Math.min(...result.results.map((r) => r.contactAngle));
    const maxAngle = Math.max(...result.results.map((r) => r.contactAngle));
    const bestResult = result.results.find((r) => r.contactAngle === minAngle);
    return { total, hydrophilic, minAngle, maxAngle, bestName: mode === 'group' ? bestResult?.part.name : bestResult?.solvent.name ?? '-' };
  }, [result, mode]);

  return (
    <div className="space-y-6">
      {/* 設定エリア */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">接触角推定</h2>
        <p className="text-xs text-gray-500 mb-4">
          Nakamoto-Yamamoto式 (Langmuir 2023) に基づき、HSPから接触角を推定します。推定値であり、実測値とは誤差が生じる場合があります。
        </p>

        {/* モード切替 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => { setMode('group'); clear(); }}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              mode === 'group'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            グループ評価
          </button>
          <button
            onClick={() => { setMode('screening'); clear(); }}
            className={`px-4 py-2 text-sm rounded-md font-medium transition-colors ${
              mode === 'screening'
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            溶媒スクリーニング
          </button>
        </div>

        {/* 入力セレクタ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <PartsGroupSelector
            onSelect={(g) => {
              setSelectedGroup(g);
              setSelectedPartId(null);
              clear();
            }}
            selected={selectedGroup}
          />
          {mode === 'group' ? (
            <SolventSelector onSelect={(s) => { setSelectedSolvent(s); clear(); }} selected={selectedSolvent} />
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">部品</label>
              <select
                value={selectedPartId ?? ''}
                onChange={(e) => { setSelectedPartId(Number(e.target.value) || null); clear(); }}
                disabled={!selectedGroup}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="">選択してください...</option>
                {selectedGroup?.parts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.materialType ? `(${p.materialType})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* 実行ボタン */}
        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={mode === 'group' ? !canEvaluateGroup : !canScreen}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading
              ? '推定中...'
              : mode === 'group'
              ? '接触角推定'
              : '全溶媒スクリーニング'}
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error || csvError}
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
              <div className="text-2xl font-bold text-green-600">{stats.hydrophilic}</div>
              <div className="text-gray-500">親水性 (θ &lt; 90°)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.minAngle.toFixed(1)}°</div>
              <div className="text-gray-500">最小接触角</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-800 truncate">{stats.bestName}</div>
              <div className="text-gray-500">最も濡れやすい{mode === 'group' ? '部材' : '溶媒'}</div>
            </div>
          </div>
        </div>
      )}

      {/* 結果テーブル */}
      {result && result.results.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {mode === 'group' ? (
                    <SortHeader label="部品名" field="partName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  ) : (
                    <SortHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  )}
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">δD</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">δP</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">δH</th>
                  <SortHeader label="γ_LV" field="gammaLV" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="γ_SV" field="gammaSV" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="γ_SL" field="gammaSL" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="接触角" field="contactAngle" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortHeader label="濡れ性" field="wettability" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r, i) => (
                  <tr key={`${r.part.id}-${r.solvent.id}-${i}`} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">
                      {mode === 'group' ? r.part.name : r.solvent.name}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">
                      {(mode === 'group' ? r.part.hsp.deltaD : r.solvent.hsp.deltaD).toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">
                      {(mode === 'group' ? r.part.hsp.deltaP : r.solvent.hsp.deltaP).toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">
                      {(mode === 'group' ? r.part.hsp.deltaH : r.solvent.hsp.deltaH).toFixed(1)}
                    </td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.surfaceTensionLV.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.surfaceEnergySV.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.interfacialTension.toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.contactAngle.toFixed(1)}°</td>
                    <td className="px-3 py-2.5">
                      <WettabilityBadge level={r.wettability} />
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
