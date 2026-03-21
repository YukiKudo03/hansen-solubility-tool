import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';
import { useCopolymerHspEstimation } from '../hooks/useCopolymerHspEstimation';

interface MonomerEntry {
  name: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  fraction: number;
}

const emptyMonomer = (): MonomerEntry => ({ name: '', deltaD: 0, deltaP: 0, deltaH: 0, fraction: 0 });

export default function CopolymerHspEstimationView() {
  const [monomers, setMonomers] = useState<MonomerEntry[]>([emptyMonomer(), emptyMonomer()]);
  const { result, loading, error, estimate, clear } = useCopolymerHspEstimation();

  const updateMonomer = (index: number, field: keyof MonomerEntry, value: string | number) => {
    setMonomers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    clear();
  };

  const addMonomer = () => {
    setMonomers((prev) => [...prev, emptyMonomer()]);
  };

  const removeMonomer = (index: number) => {
    if (monomers.length <= 2) return;
    setMonomers((prev) => prev.filter((_, i) => i !== index));
    clear();
  };

  const totalFraction = monomers.reduce((sum, m) => sum + (Number(m.fraction) || 0), 0);
  const canEstimate = monomers.length >= 2
    && monomers.every((m) => m.name.trim().length > 0)
    && Math.abs(totalFraction - 1.0) <= 0.01
    && !loading;

  const handleEstimate = async () => {
    await estimate({
      monomers: monomers.map((m) => ({
        name: m.name,
        deltaD: Number(m.deltaD),
        deltaP: Number(m.deltaP),
        deltaH: Number(m.deltaH),
        fraction: Number(m.fraction),
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">コポリマーHSP推定</h2>
        <p className="text-xs text-gray-500 mb-4">
          各モノマーのHSPと分率（モル分率または体積分率）を入力し、線形混合則でコポリマーのHSPを推定します。
          分率の合計が1.0になるように設定してください。
        </p>

        <div className="space-y-3 mb-4">
          {monomers.map((m, i) => (
            <div key={i} className="grid grid-cols-6 gap-2 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">モノマー名</label>
                <input
                  type="text"
                  value={m.name}
                  onChange={(e) => updateMonomer(i, 'name', e.target.value)}
                  placeholder={`モノマー${i + 1}`}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dD</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={m.deltaD}
                  onChange={(e) => updateMonomer(i, 'deltaD', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dP</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={m.deltaP}
                  onChange={(e) => updateMonomer(i, 'deltaP', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">dH</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={m.deltaH}
                  onChange={(e) => updateMonomer(i, 'deltaH', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">分率</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  max={1}
                  value={m.fraction}
                  onChange={(e) => updateMonomer(i, 'fraction', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <button
                  onClick={() => removeMonomer(i)}
                  disabled={monomers.length <= 2}
                  className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={addMonomer}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            + モノマー追加
          </button>
          <span className={`text-sm ${Math.abs(totalFraction - 1.0) <= 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            分率合計: {totalFraction.toFixed(3)} {Math.abs(totalFraction - 1.0) > 0.01 && '(1.0にしてください)'}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEstimate}
            disabled={!canEstimate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '推定中...' : 'HSP推定'}
          </button>
          <BookmarkButton
            pipeline="copolymerHspEstimation"
            params={{ monomers }}
            disabled={!canEstimate}
          />
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">コポリマーHSP推定結果</h3>
          </div>
          <div className="p-6">
            {/* Monomer table */}
            <table className="min-w-full divide-y divide-gray-200 mb-6">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">モノマー</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">dD</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">dP</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">dH</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">分率</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.monomers?.map((m: any, i: number) => (
                  <tr key={i}>
                    <td className="px-3 py-2 text-sm font-medium text-gray-900">{m.name}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{m.deltaD?.toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{m.deltaP?.toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{m.deltaH?.toFixed(2)}</td>
                    <td className="px-3 py-2 text-sm text-gray-500">{m.fraction?.toFixed(3)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Estimated HSP */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">推定コポリマーHSP (MPa^1/2)</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-blue-600">dD</div>
                  <div className="text-lg font-bold text-blue-900">{result.estimatedHSP?.deltaD?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">dP</div>
                  <div className="text-lg font-bold text-blue-900">{result.estimatedHSP?.deltaP?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">dH</div>
                  <div className="text-lg font-bold text-blue-900">{result.estimatedHSP?.deltaH?.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
