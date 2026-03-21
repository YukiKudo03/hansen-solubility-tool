import React, { useState, useMemo, useEffect } from 'react';
import type { Drug } from '../../core/types';
import TransdermalBadge from './TransdermalBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useTransdermalEnhancer } from '../hooks/useTransdermalEnhancer';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'enhancerName' | 'raDrugEnhancer' | 'raSkinEnhancer' | 'compositeScore' | 'level';

/** 皮膚の典型的なHSP値 (SC: Stratum Corneum) */
const DEFAULT_SKIN_HSP = { deltaD: 17.4, deltaP: 8.2, deltaH: 7.6 };

export default function TransdermalEnhancerView() {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [skinHSP, setSkinHSP] = useState(DEFAULT_SKIN_HSP);

  const { result, loading, error, evaluate, clear } = useTransdermalEnhancer();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('compositeScore');

  useEffect(() => {
    (async () => {
      const all = await (window as any).api.getAllDrugs();
      setDrugs(all);
    })();
  }, []);

  const canEvaluate = selectedDrug && !loading;

  const handleEvaluate = async () => {
    if (!selectedDrug) return;
    await evaluate({ drugId: selectedDrug.id, skinHSP });
  };

  const sortedResults = useMemo(() => {
    if (!Array.isArray(result)) return [];
    const items = [...result];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'enhancerName': cmp = (a.enhancerName ?? '').localeCompare(b.enhancerName ?? '', 'ja'); break;
        case 'raDrugEnhancer': cmp = (a.raDrugEnhancer ?? 0) - (b.raDrugEnhancer ?? 0); break;
        case 'raSkinEnhancer': cmp = (a.raSkinEnhancer ?? 0) - (b.raSkinEnhancer ?? 0); break;
        case 'compositeScore': cmp = (a.compositeScore ?? 0) - (b.compositeScore ?? 0); break;
        case 'level': cmp = (a.level ?? 0) - (b.level ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">経皮吸収促進剤選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          薬物・皮膚・促進剤の3成分系HSPマッチングにより、経皮吸収促進剤を選定します。
          薬物と皮膚の両方にHSP的に近い促進剤が高評価となります。
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
            <label className="block text-sm font-medium text-gray-700 mb-1">皮膚HSP</label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-gray-500">dD</label>
                <input
                  type="number" step="0.1" value={skinHSP.deltaD}
                  onChange={(e) => setSkinHSP({ ...skinHSP, deltaD: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">dP</label>
                <input
                  type="number" step="0.1" value={skinHSP.deltaP}
                  onChange={(e) => setSkinHSP({ ...skinHSP, deltaP: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">dH</label>
                <input
                  type="number" step="0.1" value={skinHSP.deltaH}
                  onChange={(e) => setSkinHSP({ ...skinHSP, deltaH: parseFloat(e.target.value) || 0 })}
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
            {loading ? '評価中...' : '促進剤スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="transdermalEnhancer"
            params={{ drugId: selectedDrug?.id, skinHSP }}
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
              経皮吸収促進剤評価結果: {selectedDrug?.name}
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="促進剤名" field="enhancerName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra(薬物)" field="raDrugEnhancer" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra(皮膚)" field="raSkinEnhancer" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="総合スコア" field="compositeScore" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="適合性" field="level" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.enhancerName ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.raDrugEnhancer?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.raSkinEnhancer?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.compositeScore?.toFixed(3) ?? '-'}</td>
                    <td className="px-3 py-2.5">
                      <TransdermalBadge level={r.level ?? 4} />
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
