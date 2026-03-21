import React, { useState, useMemo } from 'react';
import GasPermeabilityBadge from './GasPermeabilityBadge';
import SortTableHeader from './SortTableHeader';
import BookmarkButton from './BookmarkButton';
import { useGasPermeability } from '../hooks/useGasPermeability';
import { useSortableTable } from '../hooks/useSortableTable';
import { classifyGasPermeability } from '../../core/polymer-membrane-gas-permeability';

type SortKey = 'gasName' | 'ra2' | 'relativePermeability' | 'selectivity';

const AVAILABLE_GASES = ['CO2', 'O2', 'N2', 'CH4', 'H2', 'He', 'Ar', 'H2O'];

export default function GasPermeabilityView() {
  const [polymerHSP, setPolymerHSP] = useState({ deltaD: 15.9, deltaP: 0.0, deltaH: 4.7 });
  const [selectedGases, setSelectedGases] = useState<string[]>(['CO2', 'O2', 'N2']);
  const [referenceGas, setReferenceGas] = useState('N2');

  const { result, loading, error, evaluate } = useGasPermeability();
  const { sortKey, sortDir, toggleSort } = useSortableTable<SortKey>('ra2');

  const handleEvaluate = async () => {
    if (selectedGases.length === 0) return;
    await evaluate({ polymerHSP, gasNames: selectedGases, referenceGas });
  };

  const handleToggleGas = (gas: string) => {
    setSelectedGases(prev =>
      prev.includes(gas) ? prev.filter(g => g !== gas) : [...prev, gas]
    );
  };

  const sortedResults = useMemo(() => {
    if (!result?.results) return [];
    const items = [...result.results];
    items.sort((a: any, b: any) => {
      let cmp = 0;
      switch (sortKey) {
        case 'gasName': cmp = (a.gasName ?? '').localeCompare(b.gasName ?? ''); break;
        case 'ra2': cmp = (a.ra2 ?? 0) - (b.ra2 ?? 0); break;
        case 'relativePermeability': cmp = (a.relativePermeability ?? 0) - (b.relativePermeability ?? 0); break;
        case 'selectivity': cmp = (a.selectivity ?? 0) - (b.selectivity ?? 0); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [result, sortKey, sortDir]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">ポリマー膜ガス透過性評価</h2>
        <p className="text-xs text-gray-500 mb-4">
          ポリマー膜のHSPとガスのHSP距離(Ra2)に基づき、ガス透過性の相対的な優劣を評価します。
          Ra2が小さいほど透過性が高いと推定されます。
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ポリマー膜 HSP</label>
            <div className="grid grid-cols-3 gap-2">
              {(['deltaD', 'deltaP', 'deltaH'] as const).map(key => (
                <div key={key}>
                  <label className="text-xs text-gray-500">{key === 'deltaD' ? 'dD' : key === 'deltaP' ? 'dP' : 'dH'}</label>
                  <input
                    type="number" step="0.1" value={polymerHSP[key]}
                    onChange={(e) => setPolymerHSP({ ...polymerHSP, [key]: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">評価ガス選択</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GASES.map(gas => (
                <label key={gas} className="inline-flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedGases.includes(gas)}
                    onChange={() => handleToggleGas(gas)}
                    className="rounded"
                  />
                  {gas}
                </label>
              ))}
            </div>
            <div className="mt-2">
              <label className="text-xs text-gray-500 mr-2">基準ガス:</label>
              <select
                value={referenceGas}
                onChange={(e) => setReferenceGas(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                {AVAILABLE_GASES.map(gas => (
                  <option key={gas} value={gas}>{gas}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEvaluate}
            disabled={selectedGases.length === 0 || loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '評価中...' : 'ガス透過性評価'}
          </button>
          <BookmarkButton
            pipeline="gasPermeability"
            params={{ polymerHSP, gasNames: selectedGases, referenceGas }}
            disabled={selectedGases.length === 0}
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
              ガス透過性評価結果 (基準: {result?.referenceGas})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <SortTableHeader label="ガス名" field="gasName" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="Ra2" field="ra2" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="相対透過性" field="relativePermeability" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <SortTableHeader label="選択性" field="selectivity" sortKey={sortKey} sortDir={sortDir} onToggle={toggleSort} />
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">レベル</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedResults.map((r: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2.5 text-sm font-medium text-gray-900">{r.gasName}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.ra2?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.relativePermeability === Infinity ? 'Inf' : r.relativePermeability?.toFixed(3)}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-500">{r.selectivity === Infinity ? 'Inf' : r.selectivity?.toFixed(3)}</td>
                    <td className="px-3 py-2.5">
                      <GasPermeabilityBadge level={classifyGasPermeability(r.ra2 ?? 0)} />
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
