import React, { useState, useMemo, useEffect } from 'react';
import type { Drug } from '../../core/types';
import PermeabilityBadge from './PermeabilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useLiposomePermeability } from '../hooks/useLiposomePermeability';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'drugName' | 'ra' | 'red' | 'permeabilityLevel';

/** DPPC脂質二重膜の典型的なHSP値 */
const DEFAULT_LIPID_HSP = { deltaD: 16.0, deltaP: 5.0, deltaH: 6.0 };
const DEFAULT_LIPID_R0 = 8.0;

export default function LiposomePermeabilityView() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [lipidHSP, setLipidHSP] = useState(DEFAULT_LIPID_HSP);
  const [lipidR0, setLipidR0] = useState(DEFAULT_LIPID_R0);

  const { result, loading, error, evaluate, clear } = useLiposomePermeability();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('red');

  useEffect(() => {
    (async () => {
      const all = await (window as any).api.getAllDrugs();
      setDrugs(all);
    })();
  }, []);

  const canEvaluate = selectedDrug && !loading;

  const handleEvaluate = async () => {
    if (!selectedDrug) return;
    await evaluate({ drugId: selectedDrug.id, lipidHSP, lipidR0 });
  };

  const sortedResults = useMemo(() => {
    if (!Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'drugName': cmp = (a.drugName ?? '').localeCompare(b.drugName ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'permeabilityLevel': cmp = (a.permeabilityLevel ?? 0) - (b.permeabilityLevel ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">リポソーム膜透過性予測</h2>
        <p className="text-xs text-gray-500 mb-4">
          薬物と脂質二重膜のHSP距離に基づき、受動膜透過性を評価します。
          RED値が小さいほど透過性が高くなります。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">薬物を選択</label>
            <select
              value={selectedDrug?.id ?? ''}
              onChange={(e) => {
                const drug = drugs.find((d) => d.id === Number(e.target.value));
                setSelectedDrug(drug ?? null);
                clear();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            >
              <option value="">選択してください</option>
              {drugs.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {selectedDrug && (
              <p className="mt-1 text-xs text-gray-500">
                HSP: ({selectedDrug.hsp.deltaD.toFixed(1)}, {selectedDrug.hsp.deltaP.toFixed(1)}, {selectedDrug.hsp.deltaH.toFixed(1)})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">脂質膜HSP / R0</label>
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-gray-500">dD</label>
                <input
                  type="number" step="0.1" value={lipidHSP.deltaD}
                  onChange={(e) => setLipidHSP({ ...lipidHSP, deltaD: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">dP</label>
                <input
                  type="number" step="0.1" value={lipidHSP.deltaP}
                  onChange={(e) => setLipidHSP({ ...lipidHSP, deltaP: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">dH</label>
                <input
                  type="number" step="0.1" value={lipidHSP.deltaH}
                  onChange={(e) => setLipidHSP({ ...lipidHSP, deltaH: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">R0</label>
                <input
                  type="number" step="0.1" value={lipidR0}
                  onChange={(e) => setLipidR0(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={!canEvaluate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '膜透過性評価'}
          </button>
          <BookmarkButton
            pipeline="liposomePermeability"
            params={{ drugId: selectedDrug?.id, lipidHSP, lipidR0 }}
            disabled={!selectedDrug}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {sortedResults.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">
              膜透過性評価結果: {selectedDrug?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="薬物名" field="drugName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="透過性" field="permeabilityLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.drugName ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <PermeabilityBadge level={r.permeabilityLevel ?? 3} />
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
