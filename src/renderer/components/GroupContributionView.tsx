/**
 * 族寄与法 — 構造基から HSP を推定 (Stefanis-Panayiotou法)
 */
import React, { useState, useEffect, useMemo } from 'react';

interface GroupDefinition {
  id: number;
  name: string;
  description?: string;
  order: 1 | 2;
}

interface GroupInput {
  groupId: number;
  count: number;
}

interface EstimationResult {
  deltaD: number;
  deltaP: number;
  deltaH: number;
  confidence: number;
  warnings: string[];
}

export default function GroupContributionView() {
  const [groups, setGroups] = useState<GroupDefinition[]>([]);
  const [counts, setCounts] = useState<Record<number, number>>({});
  const [result, setResult] = useState<EstimationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showSecondOrder, setShowSecondOrder] = useState(false);

  // グループ定義の取得
  useEffect(() => {
    const load = async () => {
      setGroupsLoading(true);
      try {
        const res = await window.api.invoke('groupContribution:getGroups');
        setGroups(res as GroupDefinition[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'グループ定義の読み込みに失敗しました');
      } finally {
        setGroupsLoading(false);
      }
    };
    load();
  }, []);

  const firstOrderGroups = useMemo(() => groups.filter((g) => g.order === 1), [groups]);
  const secondOrderGroups = useMemo(() => groups.filter((g) => g.order === 2), [groups]);

  const selectedGroups = useMemo(() => {
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([idStr, count]) => {
        const id = Number(idStr);
        const group = groups.find((g) => g.id === id);
        return { id, name: group?.name ?? `Group ${id}`, count, order: group?.order ?? 1 };
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ja'));
  }, [counts, groups]);

  const hasFirstOrder = selectedGroups.some((g) => g.order === 1);

  const handleIncrement = (id: number) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setResult(null);
  };

  const handleDecrement = (id: number) => {
    setCounts((prev) => {
      const current = prev[id] ?? 0;
      if (current <= 0) return prev;
      const next = { ...prev };
      if (current === 1) {
        delete next[id];
      } else {
        next[id] = current - 1;
      }
      return next;
    });
    setResult(null);
  };

  const handleClearAll = () => {
    setCounts({});
    setResult(null);
  };

  const handleEstimate = async () => {
    setLoading(true);
    setError(null);
    try {
      const input: GroupInput[] = Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([idStr, count]) => ({ groupId: Number(idStr), count }));
      const res = await window.api.invoke('groupContribution:estimate', input);
      setResult(res as EstimationResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'HSP推定中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const renderGroupTable = (groupList: GroupDefinition[], title: string) => (
    <div>
      <h4 className="text-xs font-medium text-gray-600 mb-2">{title}</h4>
      <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">グループ名</th>
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-32">個数</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {groupList.map((g) => {
              const count = counts[g.id] ?? 0;
              return (
                <tr key={g.id} className={count > 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-3 py-1.5 text-sm text-gray-700">
                    {g.name}
                    {g.description && (
                      <span className="text-xs text-gray-400 ml-1">({g.description})</span>
                    )}
                  </td>
                  <td className="px-3 py-1.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleDecrement(g.id)}
                        disabled={count <= 0}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{count}</span>
                      <button
                        onClick={() => handleIncrement(g.id)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const confidenceColor = (c: number) => {
    if (c >= 0.8) return 'text-green-700';
    if (c >= 0.5) return 'text-yellow-700';
    return 'text-red-700';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">族寄与法によるHSP推定</h2>
        <p className="text-xs text-gray-500 mb-4">
          Stefanis-Panayiotou法に基づき、構造基(官能基)の組み合わせからHSPを推定します。第1次グループを選択し、必要に応じて第2次補正グループを追加してください。
        </p>

        {groupsLoading ? (
          <p className="text-sm text-gray-400">グループ定義を読み込み中...</p>
        ) : (
          <div className="space-y-4">
            {/* 第1次グループ */}
            {renderGroupTable(firstOrderGroups, `第1次グループ (${firstOrderGroups.length}種)`)}

            {/* 第2次グループ (折りたたみ) */}
            {secondOrderGroups.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSecondOrder(!showSecondOrder)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs">{showSecondOrder ? '\u25BC' : '\u25B6'}</span>
                  第2次補正グループ ({secondOrderGroups.length}種)
                </button>
                {showSecondOrder && (
                  <div className="mt-2">
                    {renderGroupTable(secondOrderGroups, '')}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 選択中のグループサマリー */}
        {selectedGroups.length > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-medium text-gray-600">選択中のグループ</h4>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
              >
                全解除
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedGroups.map((g) => (
                <span
                  key={g.id}
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                    g.order === 1 ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {g.name} x{g.count}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 実行ボタン */}
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleEstimate}
            disabled={!hasFirstOrder || loading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '推定中...' : 'HSP推定'}
          </button>
        </div>
      </div>

      {/* エラー表示 */}
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* 結果表示 */}
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">推定結果</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.deltaD.toFixed(2)}</div>
              <div className="text-xs text-gray-500">δD (MPa½)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.deltaP.toFixed(2)}</div>
              <div className="text-xs text-gray-500">δP (MPa½)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.deltaH.toFixed(2)}</div>
              <div className="text-xs text-gray-500">δH (MPa½)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${confidenceColor(result.confidence)}`}>
                {(result.confidence * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">信頼度</div>
            </div>
          </div>

          {/* 警告 */}
          {result.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 text-sm">
              <div className="font-medium mb-1">注意事項</div>
              <ul className="list-disc list-inside space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
