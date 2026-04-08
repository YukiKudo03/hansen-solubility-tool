/**
 * 溶媒名バッチマッピングモーダル
 *
 * 自動マッチに失敗した溶媒名を一覧表示し、
 * ユーザーにDBの溶媒をドロップダウンから選択させる
 */
import React, { useState, useEffect } from 'react';
import type { Solvent } from '../../core/types';

interface Props {
  unmatchedNames: string[];
  solvents: Solvent[];
  onConfirm: (mappings: Array<{ rawName: string; solventId: number }>) => void;
  onCancel: () => void;
}

export default function SolventMappingModal({ unmatchedNames, solvents, onConfirm, onCancel }: Props) {
  const [mappings, setMappings] = useState<Record<string, number | null>>({});
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, number | null> = {};
    for (const name of unmatchedNames) {
      initial[name] = null;
    }
    setMappings(initial);
  }, [unmatchedNames]);

  const handleConfirm = () => {
    const resolved = Object.entries(mappings)
      .filter(([, solventId]) => solventId != null)
      .map(([rawName, solventId]) => ({ rawName, solventId: solventId! }));
    onConfirm(resolved);
  };

  const resolvedCount = Object.values(mappings).filter((v) => v != null).length;

  // ESC で閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800">溶媒名マッピング</h3>
          <p className="text-xs text-gray-500 mt-1">
            自動マッチできなかった溶媒名 ({unmatchedNames.length}件) にDBの溶媒を手動で割り当ててください。
            スキップした項目は solvent_id = null でインポートされます。
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {unmatchedNames.map((name) => (
            <div key={name} className="flex items-center gap-3">
              <div className="w-40 text-sm font-medium text-gray-700 truncate" title={name}>
                {name}
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="溶媒を検索..."
                  value={searchTerms[name] ?? ''}
                  onChange={(e) => setSearchTerms((prev) => ({ ...prev, [name]: e.target.value }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1 mb-1"
                />
                <select
                  value={mappings[name] ?? ''}
                  onChange={(e) => {
                    const val = e.target.value ? Number(e.target.value) : null;
                    setMappings((prev) => ({ ...prev, [name]: val }));
                  }}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="">-- スキップ --</option>
                  {solvents
                    .filter((s) => {
                      const term = (searchTerms[name] ?? '').toLowerCase();
                      if (!term) return true;
                      return s.name.toLowerCase().includes(term) ||
                        (s.nameEn?.toLowerCase().includes(term) ?? false) ||
                        (s.casNumber?.includes(term) ?? false);
                    })
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}{s.nameEn ? ` (${s.nameEn})` : ''}{s.casNumber ? ` [${s.casNumber}]` : ''}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {resolvedCount}/{unmatchedNames.length} 件マッピング済み
          </span>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              インポート実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
