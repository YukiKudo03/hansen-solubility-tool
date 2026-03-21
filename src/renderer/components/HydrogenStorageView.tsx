import React, { useState, useMemo, useEffect } from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useHydrogenStorage } from '../hooks/useHydrogenStorage';
import { useSortableTable } from '../hooks/useSortableTable';
import type { Solvent } from '../../core/types';

type SortKey = 'solventName' | 'ra' | 'red' | 'compatibilityLevel';

const COMPAT_BADGE: Record<string | number, BadgeLevelConfig> = {
  1: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  3: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

/** DBT (ジベンジルトルエン) の典型的HSP値 */
const DEFAULT_CARRIER_HSP = { deltaD: 18.5, deltaP: 2.0, deltaH: 3.5 };
const DEFAULT_R0 = 8.0;

export default function HydrogenStorageView() {
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [carrierHSP, setCarrierHSP] = useState(DEFAULT_CARRIER_HSP);
  const [r0, setR0] = useState(DEFAULT_R0);

  const { result, loading, error, evaluate, clear } = useHydrogenStorage();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('ra');

  useEffect(() => {
    (async () => {
      const all = await (window as any).api.getAllSolvents();
      setSolvents(all);
    })();
  }, []);

  const handleEvaluate = async () => {
    if (selectedIds.length === 0) return;
    await evaluate({ carrierHSP, r0, solventIds: selectedIds });
  };

  const handleToggleSolvent = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === solvents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(solvents.map(s => s.id));
    }
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'solventName': cmp = (a.solventName ?? '').localeCompare(b.solventName ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'compatibilityLevel': cmp = (a.compatibilityLevel ?? 0) - (b.compatibilityLevel ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">水素貯蔵材料-溶媒相互作用評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          水素キャリア(LOHC, MOF等)と溶媒のHSP適合性を評価します。
          Ra/REDが小さいほど適合性が高いと推定されます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">水素キャリア HSP / R0</label>
            <div className="grid grid-cols-4 gap-2">
              {(['deltaD', 'deltaP', 'deltaH'] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-gray-500">{key === 'deltaD' ? 'dD' : key === 'deltaP' ? 'dP' : 'dH'}</label>
                  <input
                    type="number" step="0.1" value={carrierHSP[key]}
                    onChange={(e) => setCarrierHSP({ ...carrierHSP, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="text-xs text-gray-500">R0</label>
                <input
                  type="number" step="0.1" value={r0}
                  onChange={(e) => setR0(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              溶媒選択 ({selectedIds.length}/{solvents.length})
              <button onClick={handleSelectAll} className="ml-2 text-xs text-blue-600 hover:underline">
                {selectedIds.length === solvents.length ? '全解除' : '全選択'}
              </button>
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
              {solvents.map(s => (
                <label key={s.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => handleToggleSolvent(s.id)}
                    className="rounded"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={selectedIds.length === 0 || loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : '適合性評価'}
          </button>
          <BookmarkButton
            pipeline="hydrogenStorage"
            params={{ carrierHSP, r0, solventIds: selectedIds }}
            disabled={selectedIds.length === 0}
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
            <h3 className="text-sm font-semibold text-gray-800">水素貯蔵材料 適合性結果</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="溶媒名" field="solventName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="適合性" field="compatibilityLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.solventName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <GenericLevelBadge level={r.compatibilityLevel} config={COMPAT_BADGE} />
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
