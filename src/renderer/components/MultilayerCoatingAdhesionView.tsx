import React, { useState, useMemo } from 'react';
import AdhesionStrengthBadge from './AdhesionStrengthBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useMultilayerCoatingAdhesion } from '../hooks/useMultilayerCoatingAdhesion';
import { useSortableTable } from '../hooks/useSortableTable';

interface LayerInput {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
}

type SortKey = 'interface' | 'wa' | 'ra' | 'level';

export default function MultilayerCoatingAdhesionView() {
  const [layers, setLayers] = useState<LayerInput[]>([
    { name: '基材', deltaD: 18.0, deltaP: 1.0, deltaH: 2.0 },
    { name: 'プライマー', deltaD: 17.5, deltaP: 5.0, deltaH: 6.0 },
    { name: 'トップコート', deltaD: 16.0, deltaP: 8.0, deltaH: 10.0 },
  ]);

  const { result, loading, error, evaluate, clear } = useMultilayerCoatingAdhesion();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('wa');

  const addLayer = () => {
    setLayers([...layers, { name: `層${layers.length + 1}`, deltaD: 17.0, deltaP: 5.0, deltaH: 5.0 }]);
    clear();
  };

  const removeLayer = (index: number) => {
    if (layers.length <= 2) return;
    setLayers(layers.filter((_, i) => i !== index));
    clear();
  };

  const updateLayer = (index: number, field: keyof LayerInput, value: string | number) => {
    const updated = [...layers];
    updated[index] = { ...updated[index], [field]: value };
    setLayers(updated);
    clear();
  };

  const handleEvaluate = async () => {
    await evaluate({
      layers: layers.map((l) => ({
        name: l.name,
        hsp: { deltaD: l.deltaD, deltaP: l.deltaP, deltaH: l.deltaH },
      })),
    });
  };

  const sortedResults = useMemo(() => {
    if (!result?.interfaces) return [];
    const items = [...result.interfaces];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'interface': cmp = (a.layer1Name ?? '').localeCompare(b.layer1Name ?? '', 'ja'); break;
        case 'wa': cmp = (a.wa ?? 0) - (b.wa ?? 0); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'level': cmp = (a.level ?? 0) - (b.level ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">多層コーティング密着評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          各層のHSPから隣接層間の接着仕事(Wa)を計算し、最弱界面を特定します。
        </p>

        <div className="space-y-3 mb-4">
          {layers.map((layer, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={layer.name} onChange={(e) => updateLayer(i, 'name', e.target.value)}
                className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm" placeholder="層名" />
              <input type="number" step="0.1" value={layer.deltaD} onChange={(e) => updateLayer(i, 'deltaD', Number(e.target.value))}
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm" title="deltaD" />
              <input type="number" step="0.1" value={layer.deltaP} onChange={(e) => updateLayer(i, 'deltaP', Number(e.target.value))}
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm" title="deltaP" />
              <input type="number" step="0.1" value={layer.deltaH} onChange={(e) => updateLayer(i, 'deltaH', Number(e.target.value))}
                className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm" title="deltaH" />
              <span className="text-xs text-gray-400">(dD, dP, dH)</span>
              {layers.length > 2 && (
                <button onClick={() => removeLayer(i)} className="text-red-500 hover:text-red-700 text-sm px-2">削除</button>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mb-4">
          <button onClick={addLayer}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors">
            + 層を追加
          </button>
        </div>

        <div className="flex gap-3">
          <button onClick={handleEvaluate} disabled={loading || layers.length < 2}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {loading ? '評価中...' : '密着性評価'}
          </button>
          <BookmarkButton
            pipeline="multilayerCoatingAdhesion"
            params={{ layers: layers.map((l) => ({ name: l.name, hsp: { deltaD: l.deltaD, deltaP: l.deltaP, deltaH: l.deltaH } })) }}
            disabled={layers.length < 2}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}

      {result && sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">界面密着評価結果</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="界面" field="interface" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Wa (mJ/m2)" field="wa" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="密着レベル" field="level" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">最弱</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => {
                  const origIndex = result.interfaces.indexOf(r);
                  const isWeakest = origIndex === result.weakestIndex;
                  return (
                    <tr key={i} className={`hover:bg-gray-50 ${isWeakest ? 'bg-red-50' : ''}`}>
                      <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.layer1Name} / {r.layer2Name}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.wa?.toFixed(2)}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3)}</td>
                      <td className="px-3 py-2.5"><AdhesionStrengthBadge level={r.level} /></td>
                      <td className="px-3 py-2.5 text-sm">{isWeakest ? <span className="text-red-600 font-bold">最弱界面</span> : ''}</td>
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
