import React, { useState, useMemo } from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useCO2Absorbent } from '../hooks/useCO2Absorbent';
import { useSortableTable } from '../hooks/useSortableTable';

type SortKey = 'absorbent' | 'ra' | 'red' | 'absorptionLevel';

const ABSORPTION_BADGE: Record<string | number, BadgeLevelConfig> = {
  1: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  3: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

interface AbsorbentEntry {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  r0: number;
}

const DEFAULT_ABSORBENTS: AbsorbentEntry[] = [
  { name: 'MEA (モノエタノールアミン)', deltaD: 17.2, deltaP: 10.4, deltaH: 21.3, r0: 12.0 },
  { name: 'MDEA', deltaD: 17.0, deltaP: 8.0, deltaH: 15.0, r0: 10.0 },
  { name: 'PEI (ポリエチレンイミン)', deltaD: 17.5, deltaP: 12.0, deltaH: 18.0, r0: 11.0 },
];

export default function CO2AbsorbentView() {
  const [absorbents, setAbsorbents] = useState<AbsorbentEntry[]>(DEFAULT_ABSORBENTS);
  const [newEntry, setNewEntry] = useState<AbsorbentEntry>({ name: '', deltaD: 0, deltaP: 0, deltaH: 0, r0: 5.0 });

  const { result, loading, error, evaluate } = useCO2Absorbent();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('ra');

  const handleEvaluate = async () => {
    if (absorbents.length === 0) return;
    await evaluate({
      absorbents: absorbents.map(a => ({
        name: a.name,
        hsp: { deltaD: a.deltaD, deltaP: a.deltaP, deltaH: a.deltaH },
        r0: a.r0,
      })),
    });
  };

  const handleAddEntry = () => {
    if (!newEntry.name.trim()) return;
    setAbsorbents([...absorbents, { ...newEntry }]);
    setNewEntry({ name: '', deltaD: 0, deltaP: 0, deltaH: 0, r0: 5.0 });
  };

  const handleRemoveEntry = (idx: number) => {
    setAbsorbents(absorbents.filter((_, i) => i !== idx));
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'absorbent': cmp = (a.absorbent ?? '').localeCompare(b.absorbent ?? '', 'ja'); break;
        case 'ra': cmp = (a.ra ?? 0) - (b.ra ?? 0); break;
        case 'red': cmp = (a.red ?? 0) - (b.red ?? 0); break;
        case 'absorptionLevel': cmp = (a.absorptionLevel ?? 0) - (b.absorptionLevel ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">CO2吸収材選定</h2>
        <p className="text-xs text-gray-500 mb-4">
          CO2のHSPと吸収材のHSP距離でスクリーニングします。
          Ra/REDが小さいほどCO2吸収性能が高いと推定されます。
        </p>

        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">吸収材候補リスト</h3>
          <div className="space-y-1 mb-2">
            {absorbents.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <span className="flex-1">{a.name} (dD={a.deltaD}, dP={a.deltaP}, dH={a.deltaH}, R0={a.r0})</span>
                <button onClick={() => handleRemoveEntry(i)} className="text-red-500 text-xs hover:underline">削除</button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-6 gap-2 items-end">
            <div className="col-span-2">
              <label className="text-xs text-gray-500">名前</label>
              <input type="text" value={newEntry.name} onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
            </div>
            {(['deltaD', 'deltaP', 'deltaH'] as const).map(k => (
              <div key={k}>
                <label className="text-xs text-gray-500">{k === 'deltaD' ? 'dD' : k === 'deltaP' ? 'dP' : 'dH'}</label>
                <input type="number" step="0.1" value={newEntry[k]}
                  onChange={(e) => setNewEntry({ ...newEntry, [k]: parseFloat(e.target.value) || 0 })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500">R0</label>
              <input type="number" step="0.1" value={newEntry.r0}
                onChange={(e) => setNewEntry({ ...newEntry, r0: parseFloat(e.target.value) || 0 })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
            </div>
          </div>
          <button onClick={handleAddEntry} disabled={!newEntry.name.trim()}
            className="mt-2 px-4 py-1.5 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 disabled:opacity-50">
            追加
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={absorbents.length === 0 || loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : 'CO2吸収材スクリーニング'}
          </button>
          <BookmarkButton
            pipeline="co2Absorbent"
            params={{ absorbents }}
            disabled={absorbents.length === 0}
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
            <h3 className="text-sm font-semibold text-gray-800">CO2吸収材スクリーニング結果</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="吸収材名" field="absorbent" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra" field="ra" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="RED" field="red" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="吸収性" field="absorptionLevel" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.absorbent}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.red?.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <GenericLevelBadge level={r.absorptionLevel} config={ABSORPTION_BADGE} />
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
