/**
 * 防落書きコーティング設計 — コーティング材料HSP+R0と落書き材料のRED値で防落書き効果を評価
 * RED値が大きいほど防落書き効果が高い（逆方向判定）
 */
import React, { useState, useMemo } from 'react';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useAntiGraffitiCoating } from '../hooks/useAntiGraffitiCoating';
import { useSortableTable } from '../hooks/useSortableTable';

interface GraffitiMaterialEntry {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
}

const emptyMaterial = (): GraffitiMaterialEntry => ({ name: '', deltaD: 0, deltaP: 0, deltaH: 0 });

const LEVEL_BADGE: Record<number, { label: string; className: string }> = {
  1: { label: '優秀', className: 'bg-green-100 text-green-800' },
  2: { label: '良好', className: 'bg-blue-100 text-blue-800' },
  3: { label: '中程度', className: 'bg-yellow-100 text-yellow-800' },
  4: { label: '不良', className: 'bg-red-100 text-red-800' },
};

type SortKey = 'name' | 'ra' | 'red' | 'level';

export default function AntiGraffitiCoatingView() {
  const [coatingDeltaD, setCoatingDeltaD] = useState(0);
  const [coatingDeltaP, setCoatingDeltaP] = useState(0);
  const [coatingDeltaH, setCoatingDeltaH] = useState(0);
  const [coatingR0, setCoatingR0] = useState(5);
  const [materials, setMaterials] = useState<GraffitiMaterialEntry[]>([emptyMaterial()]);

  const { result, loading, error, screen, clear } = useAntiGraffitiCoating();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  const updateMaterial = (index: number, field: keyof GraffitiMaterialEntry, value: string | number) => {
    setMaterials((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    clear();
  };

  const addMaterial = () => {
    setMaterials((prev) => [...prev, emptyMaterial()]);
  };

  const removeMaterial = (index: number) => {
    if (materials.length <= 1) return;
    setMaterials((prev) => prev.filter((_, i) => i !== index));
    clear();
  };

  const canScreen =
    coatingR0 > 0 &&
    materials.length >= 1 &&
    materials.every((m) => m.name.trim().length > 0) &&
    !loading;

  const handleScreen = async () => {
    await screen(
      { deltaD: Number(coatingDeltaD), deltaP: Number(coatingDeltaP), deltaH: Number(coatingDeltaH) },
      Number(coatingR0),
      materials.map((m) => ({
        name: m.name,
        hsp: { deltaD: Number(m.deltaD), deltaP: Number(m.deltaP), deltaH: Number(m.deltaH) },
      })),
    );
  };

  // ソート処理
  const sortedResults = useMemo(() => {
    if (!result || !Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = (a.graffitiMaterial?.name ?? '').localeCompare(b.graffitiMaterial?.name ?? '', 'ja');
          break;
        case 'ra':
          cmp = (a.ra ?? 0) - (b.ra ?? 0);
          break;
        case 'red':
          cmp = (a.red ?? 0) - (b.red ?? 0);
          break;
        case 'level':
          cmp = (a.level ?? 0) - (b.level ?? 0);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">防落書きコーティング設計</h2>
        <p className="text-xs text-gray-500 mb-4">
          コーティング材料と落書き材料のHSP距離から防落書き効果を評価します。
          RED値が大きいほど防落書き効果が高くなります。
        </p>

        {/* コーティング材料HSP入力 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">コーティング材料HSP + R0</h3>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">dD</label>
              <input
                type="number"
                step="0.1"
                value={coatingDeltaD}
                onChange={(e) => { setCoatingDeltaD(Number(e.target.value)); clear(); }}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">dP</label>
              <input
                type="number"
                step="0.1"
                value={coatingDeltaP}
                onChange={(e) => { setCoatingDeltaP(Number(e.target.value)); clear(); }}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">dH</label>
              <input
                type="number"
                step="0.1"
                value={coatingDeltaH}
                onChange={(e) => { setCoatingDeltaH(Number(e.target.value)); clear(); }}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">R0</label>
              <input
                type="number"
                step="0.1"
                min={0.1}
                value={coatingR0}
                onChange={(e) => { setCoatingR0(Number(e.target.value)); clear(); }}
                className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
              />
            </div>
          </div>
        </div>

        {/* 落書き材料リスト */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">落書き材料</h3>
          <div className="space-y-2">
            {materials.map((m, i) => (
              <div key={i} className="grid grid-cols-5 gap-2 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">材料名</label>
                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateMaterial(i, 'name', e.target.value)}
                    placeholder={`材料${i + 1}`}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">dD</label>
                  <input
                    type="number"
                    step="0.1"
                    value={m.deltaD}
                    onChange={(e) => updateMaterial(i, 'deltaD', Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">dP</label>
                  <input
                    type="number"
                    step="0.1"
                    value={m.deltaP}
                    onChange={(e) => updateMaterial(i, 'deltaP', Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">dH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={m.deltaH}
                    onChange={(e) => updateMaterial(i, 'deltaH', Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <button
                    onClick={() => removeMaterial(i)}
                    disabled={materials.length <= 1}
                    className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={addMaterial}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            + 材料追加
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleScreen}
            disabled={!canScreen}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '防落書き効果評価'}
          </button>
          <BookmarkButton
            pipeline="antiGraffitiCoating"
            params={{
              coatingHSP: { deltaD: coatingDeltaD, deltaP: coatingDeltaP, deltaH: coatingDeltaH },
              r0: coatingR0,
              materials,
            }}
            disabled={!canScreen}
          />
        </div>
      </div>

      {/* エラー */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果テーブル */}
      {sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">防落書き効果評価結果</h3>
            <p className="text-xs text-gray-500 mt-1">RED値が大きいほど防落書き効果が高い</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="落書き材料" field="name" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="防落書き効果" field="level" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => {
                  const badge = LEVEL_BADGE[r.level] ?? { label: '-', className: 'bg-gray-100 text-gray-800' };
                  return (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">
                        {r.graffitiMaterial?.name ?? '-'}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3)}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3)}</td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
