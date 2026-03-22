/**
 * 表面HSP決定法 — 複数の試験液体の接触角データからOwens-Wendt法+HSP変換で表面のHSP値を逆算
 */
import React, { useState } from 'react';
import BookmarkButton from './BookmarkButton';
import { useSurfaceHSPDetermination } from '../hooks/useSurfaceHSPDetermination';

interface TestLiquidEntry {
  liquidName: string;
  deltaD: number;
  deltaP: number;
  deltaH: number;
  contactAngleDeg: number;
}

const emptyEntry = (): TestLiquidEntry => ({
  liquidName: '',
  deltaD: 0,
  deltaP: 0,
  deltaH: 0,
  contactAngleDeg: 0,
});

export default function SurfaceHSPDeterminationView() {
  const [testLiquids, setTestLiquids] = useState<TestLiquidEntry[]>([
    emptyEntry(),
    emptyEntry(),
    emptyEntry(),
  ]);

  const { result, loading, error, estimate, clear } = useSurfaceHSPDetermination();

  const updateEntry = (index: number, field: keyof TestLiquidEntry, value: string | number) => {
    setTestLiquids((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    clear();
  };

  const addEntry = () => {
    setTestLiquids((prev) => [...prev, emptyEntry()]);
  };

  const removeEntry = (index: number) => {
    if (testLiquids.length <= 3) return;
    setTestLiquids((prev) => prev.filter((_, i) => i !== index));
    clear();
  };

  const canEstimate =
    testLiquids.length >= 3 &&
    testLiquids.every((e) => e.liquidName.trim().length > 0 && e.contactAngleDeg >= 0 && e.contactAngleDeg <= 180) &&
    !loading;

  const handleEstimate = async () => {
    await estimate({
      testData: testLiquids.map((e) => ({
        liquidName: e.liquidName,
        liquidHSP: {
          deltaD: Number(e.deltaD),
          deltaP: Number(e.deltaP),
          deltaH: Number(e.deltaH),
        },
        contactAngleDeg: Number(e.contactAngleDeg),
      })),
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">表面HSP決定法</h2>
        <p className="text-xs text-gray-500 mb-4">
          複数の試験液体の接触角データからOwens-Wendt法+HSP変換で表面のHSP値を逆算します。
          最低3種類の液体データを入力してください。
        </p>

        {/* 試験液体入力 */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600">
            <div>液体名</div>
            <div>dD</div>
            <div>dP</div>
            <div>dH</div>
            <div>接触角 [deg]</div>
            <div></div>
          </div>
          {testLiquids.map((entry, i) => (
            <div key={i} className="grid grid-cols-7 gap-2 items-end">
              <div>
                <input
                  type="text"
                  value={entry.liquidName}
                  onChange={(e) => updateEntry(i, 'liquidName', e.target.value)}
                  placeholder={`液体${i + 1}`}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={entry.deltaD}
                  onChange={(e) => updateEntry(i, 'deltaD', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={entry.deltaP}
                  onChange={(e) => updateEntry(i, 'deltaP', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  value={entry.deltaH}
                  onChange={(e) => updateEntry(i, 'deltaH', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={180}
                  value={entry.contactAngleDeg}
                  onChange={(e) => updateEntry(i, 'contactAngleDeg', Number(e.target.value))}
                  className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <button
                  onClick={() => removeEntry(i)}
                  disabled={testLiquids.length <= 3}
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
            onClick={addEntry}
            className="px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            + 液体追加
          </button>
          <span className="text-sm text-gray-500">
            {testLiquids.length}種類の液体データ
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEstimate}
            disabled={!canEstimate}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '推定中...' : '表面HSP推定'}
          </button>
          <BookmarkButton
            pipeline="surfaceHspDetermination"
            params={{ testLiquids }}
            disabled={!canEstimate}
          />
        </div>
      </div>

      {/* エラー */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">表面HSP推定結果</h3>
          </div>
          <div className="p-6 space-y-4">
            {/* 推定HSP */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">推定表面HSP (MPa^1/2)</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xs text-blue-600">dD</div>
                  <div className="text-lg font-bold text-blue-900">{result.surfaceHSP?.deltaD?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">dP</div>
                  <div className="text-lg font-bold text-blue-900">{result.surfaceHSP?.deltaP?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-blue-600">dH</div>
                  <div className="text-lg font-bold text-blue-900">{result.surfaceHSP?.deltaH?.toFixed(2)}</div>
                </div>
              </div>
            </div>

            {/* 表面エネルギー */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">表面エネルギー成分 (mN/m)</h4>
              <div className="grid grid-cols-4 gap-4 text-center text-sm">
                <div>
                  <div className="text-xs text-gray-500">gammaD</div>
                  <div className="font-medium">{result.surfaceEnergy?.gammaD?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">gammaP</div>
                  <div className="font-medium">{result.surfaceEnergy?.gammaP?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">gammaH</div>
                  <div className="font-medium">{result.surfaceEnergy?.gammaH?.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">gammaTotal</div>
                  <div className="font-medium">{result.surfaceEnergy?.gammaTotal?.toFixed(2)}</div>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-400">
              データ点数: {result.numDataPoints} / フィッティング残差: {result.residualError?.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
