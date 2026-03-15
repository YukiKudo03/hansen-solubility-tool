import React, { useState, useMemo, useRef } from 'react';
import type { Solvent, MixtureComponent } from '../../core/types';
import { calculateMixture } from '../../core/mixture';

let rowIdCounter = 0;

interface ComponentRow {
  key: number; // stable unique ID
  solvent: Solvent | null;
  volumeRatio: string;
  searchQuery: string;
  searchResults: Solvent[];
  showDropdown: boolean;
}

function createRow(): ComponentRow {
  return { key: ++rowIdCounter, solvent: null, volumeRatio: '1', searchQuery: '', searchResults: [], showDropdown: false };
}

export default function MixtureLab() {
  const [rows, setRows] = useState<ComponentRow[]>([createRow(), createRow()]);
  const [mixtureName, setMixtureName] = useState('');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateRow = (index: number, updates: Partial<ComponentRow>) => {
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...updates } : r)));
  };

  const handleSearch = async (index: number, query: string) => {
    updateRow(index, { searchQuery: query, showDropdown: true });
    const results = query.length > 0
      ? await window.api.searchSolvents(query)
      : await window.api.getAllSolvents();
    updateRow(index, { searchResults: results });
  };

  const handleSelectSolvent = (index: number, solvent: Solvent) => {
    updateRow(index, { solvent, searchQuery: solvent.name, showDropdown: false });
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  // 混合計算（リアルタイム）
  const mixtureResult: MixtureSolventResult | null = useMemo(() => {
    const validComponents: MixtureComponent[] = [];
    for (const row of rows) {
      if (!row.solvent) return null;
      const ratio = parseFloat(row.volumeRatio);
      if (!Number.isFinite(ratio) || ratio <= 0) return null;
      validComponents.push({ solvent: row.solvent, volumeRatio: ratio });
    }
    if (validComponents.length < 1) return null;
    try {
      return calculateMixture(validComponents);
    } catch {
      return null;
    }
  }, [rows]);

  const handleSave = async () => {
    if (!mixtureResult) return;
    const name = mixtureName.trim();
    if (!name) {
      setError('混合溶媒の名前を入力してください');
      return;
    }

    const components = rows
      .filter((r) => r.solvent)
      .map((r) => ({ solventId: r.solvent!.id, volumeRatio: parseFloat(r.volumeRatio) }));

    try {
      setError(null);
      await window.api.createMixtureSolvent({ components, name });
      setSaveMessage(`「${name}」をデータベースに登録しました`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : '登録中にエラーが発生しました');
    }
  };

  const inputClass = 'px-2 py-1 border border-gray-300 rounded text-sm';

  return (
    <div className="space-y-6">
      {/* 成分入力 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">混合溶媒の作成</h2>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={row.key} className="flex gap-3 items-center">
              <span className="text-sm text-gray-500 w-8">#{index + 1}</span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={row.searchQuery}
                  onChange={(e) => handleSearch(index, e.target.value)}
                  onFocus={() => handleSearch(index, row.searchQuery)}
                  onBlur={() => setTimeout(() => updateRow(index, { showDropdown: false }), 200)}
                  placeholder="溶媒を検索..."
                  className={`${inputClass} w-full`}
                />
                {row.showDropdown && row.searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                    {row.searchResults.map((s) => (
                      <button
                        key={s.id}
                        onMouseDown={() => handleSelectSolvent(index, s)}
                        className="w-full text-left px-3 py-1.5 text-sm hover:bg-blue-50 truncate"
                      >
                        {s.name} {s.nameEn ? `(${s.nameEn})` : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <label className="text-sm text-gray-500">体積比:</label>
                <input
                  type="number"
                  value={row.volumeRatio}
                  onChange={(e) => updateRow(index, { volumeRatio: e.target.value })}
                  min="0.01"
                  step="0.1"
                  className={`${inputClass} w-20 text-right`}
                />
              </div>
              <button
                onClick={() => removeRow(index)}
                disabled={rows.length <= 1}
                className="px-2 py-1 text-red-600 hover:text-red-800 text-sm disabled:opacity-30"
              >
                削除
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addRow}
          className="mt-3 px-4 py-1.5 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
        >
          + 溶媒を追加
        </button>
      </div>

      {/* 計算結果 */}
      {mixtureResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">混合予測結果</h2>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3 text-sm mb-4">
            <div className="bg-blue-50 p-3 rounded">
              <span className="text-gray-500">δD:</span>{' '}
              <span className="font-medium">{mixtureResult.hsp.deltaD.toFixed(2)}</span>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <span className="text-gray-500">δP:</span>{' '}
              <span className="font-medium">{mixtureResult.hsp.deltaP.toFixed(2)}</span>
            </div>
            <div className="bg-blue-50 p-3 rounded">
              <span className="text-gray-500">δH:</span>{' '}
              <span className="font-medium">{mixtureResult.hsp.deltaH.toFixed(2)}</span>
            </div>
            {mixtureResult.molarVolume != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">Vm:</span>{' '}
                <span className="font-medium">{mixtureResult.molarVolume.toFixed(1)}</span>
              </div>
            )}
            {mixtureResult.molWeight != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">Mw:</span>{' '}
                <span className="font-medium">{mixtureResult.molWeight.toFixed(2)}</span>
              </div>
            )}
            {mixtureResult.boilingPoint != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">沸点:</span>{' '}
                <span className="font-medium">{mixtureResult.boilingPoint.toFixed(1)} °C</span>
              </div>
            )}
            {mixtureResult.viscosity != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">粘度:</span>{' '}
                <span className="font-medium">{mixtureResult.viscosity.toFixed(2)} mPa·s</span>
              </div>
            )}
            {mixtureResult.specificGravity != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">比重:</span>{' '}
                <span className="font-medium">{mixtureResult.specificGravity.toFixed(3)}</span>
              </div>
            )}
            {mixtureResult.surfaceTension != null && (
              <div className="bg-gray-50 p-3 rounded">
                <span className="text-gray-500">表面張力:</span>{' '}
                <span className="font-medium">{mixtureResult.surfaceTension.toFixed(1)} mN/m</span>
              </div>
            )}
          </div>

          {/* 組成情報 */}
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-600 mb-4">
            {mixtureResult.compositionNote}
          </div>

          {/* DB登録 */}
          <div className="flex gap-3 items-center">
            <input
              type="text"
              value={mixtureName}
              onChange={(e) => setMixtureName(e.target.value)}
              placeholder="混合溶媒の名前（例: トルエン/エタノール 3:1）"
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 transition-colors"
            >
              データベースに登録
            </button>
          </div>
        </div>
      )}

      {/* メッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">{error}</div>
      )}
      {saveMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm">{saveMessage}</div>
      )}
    </div>
  );
}
