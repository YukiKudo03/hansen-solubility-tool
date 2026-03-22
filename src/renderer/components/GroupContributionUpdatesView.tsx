/**
 * 族寄与法(拡張) — カテゴリ分類された基グループから対話的にHSPを推算
 */
import React, { useState, useEffect, useMemo } from 'react';
import BookmarkButton from './BookmarkButton';

interface ExtendedGroupDef {
  groupId: string;
  name: string;
  nameEn: string;
  category: 'hydrocarbon' | 'oxygen' | 'nitrogen' | 'halogen' | 'sulfur' | 'ring' | 'other';
}

interface ExtendedResult {
  hsp: { deltaD: number; deltaP: number; deltaH: number };
  method: string;
  confidence: string;
  warnings: string[];
  inputGroups: { groupId: string; name: string; count: number }[];
  evaluatedAt: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  hydrocarbon: '炭化水素',
  oxygen: '酸素含有',
  nitrogen: '窒素含有',
  halogen: 'ハロゲン',
  sulfur: '硫黄含有',
  ring: '環構造',
  other: 'その他',
};

const CATEGORY_COLORS: Record<string, string> = {
  hydrocarbon: 'bg-gray-100 text-gray-800',
  oxygen: 'bg-blue-100 text-blue-800',
  nitrogen: 'bg-purple-100 text-purple-800',
  halogen: 'bg-orange-100 text-orange-800',
  sulfur: 'bg-yellow-100 text-yellow-800',
  ring: 'bg-green-100 text-green-800',
  other: 'bg-pink-100 text-pink-800',
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high: 'text-green-700',
  medium: 'text-yellow-700',
  low: 'text-red-700',
};

export default function GroupContributionUpdatesView() {
  const [firstOrderGroups, setFirstOrderGroups] = useState<ExtendedGroupDef[]>([]);
  const [secondOrderGroups, setSecondOrderGroups] = useState<ExtendedGroupDef[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ExtendedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [showSecondOrder, setShowSecondOrder] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // グループ定義の取得
  useEffect(() => {
    const load = async () => {
      setGroupsLoading(true);
      try {
        const [first, second] = await Promise.all([
          (window as any).api.getExtendedFirstOrderGroups(),
          (window as any).api.getExtendedSecondOrderGroups(),
        ]);
        setFirstOrderGroups(first);
        setSecondOrderGroups(second);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'グループ定義の読み込みに失敗しました');
      } finally {
        setGroupsLoading(false);
      }
    };
    load();
  }, []);

  const allGroups = useMemo(
    () => [...firstOrderGroups, ...secondOrderGroups],
    [firstOrderGroups, secondOrderGroups],
  );

  // カテゴリ一覧
  const categories = useMemo(() => {
    const cats = new Set<string>();
    firstOrderGroups.forEach((g) => cats.add(g.category));
    return Array.from(cats);
  }, [firstOrderGroups]);

  // フィルタ適用
  const filteredFirstOrder = useMemo(() => {
    let list = firstOrderGroups;
    if (categoryFilter) {
      list = list.filter((g) => g.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((g) =>
        g.name.toLowerCase().includes(q) || g.nameEn.toLowerCase().includes(q) || g.groupId.toLowerCase().includes(q),
      );
    }
    return list;
  }, [firstOrderGroups, categoryFilter, searchQuery]);

  const filteredSecondOrder = useMemo(() => {
    let list = secondOrderGroups;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((g) =>
        g.name.toLowerCase().includes(q) || g.nameEn.toLowerCase().includes(q) || g.groupId.toLowerCase().includes(q),
      );
    }
    return list;
  }, [secondOrderGroups, searchQuery]);

  const selectedGroups = useMemo(() => {
    return Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([id, count]) => {
        const group = allGroups.find((g) => g.groupId === id);
        const isFirst = firstOrderGroups.some((g) => g.groupId === id);
        return { id, name: group?.name ?? `Group ${id}`, count, order: isFirst ? 1 : 2 };
      })
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'ja'));
  }, [counts, allGroups, firstOrderGroups]);

  const hasFirstOrder = selectedGroups.some((g) => g.order === 1);

  const handleIncrement = (id: string) => {
    setCounts((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
    setResult(null);
  };

  const handleDecrement = (id: string) => {
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
      const firstOrderInput = Object.entries(counts)
        .filter(([id, count]) => count > 0 && firstOrderGroups.some((g) => g.groupId === id))
        .map(([id, count]) => ({ groupId: id, count }));
      const secondOrderInput = Object.entries(counts)
        .filter(([id, count]) => count > 0 && secondOrderGroups.some((g) => g.groupId === id))
        .map(([id, count]) => ({ groupId: id, count }));

      const res = await (window as any).api.estimateHSPExtended({
        firstOrderGroups: firstOrderInput,
        secondOrderGroups: secondOrderInput.length > 0 ? secondOrderInput : undefined,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'HSP推定中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const renderGroupTable = (groupList: ExtendedGroupDef[], title: string, showCategory: boolean) => (
    <div>
      {title && <h4 className="text-xs font-medium text-gray-600 mb-2">{title}</h4>}
      <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">グループ名</th>
              {showCategory && (
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">カテゴリ</th>
              )}
              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 w-32">個数</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {groupList.map((g) => {
              const count = counts[g.groupId] ?? 0;
              return (
                <tr key={g.groupId} className={count > 0 ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                  <td className="px-3 py-1.5 text-sm text-gray-700" title={g.nameEn}>
                    {g.name}
                  </td>
                  {showCategory && (
                    <td className="px-3 py-1.5">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_COLORS[g.category] ?? ''}`}>
                        {CATEGORY_LABELS[g.category] ?? g.category}
                      </span>
                    </td>
                  )}
                  <td className="px-3 py-1.5 text-center">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => handleDecrement(g.groupId)}
                        disabled={count <= 0}
                        className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{count}</span>
                      <button
                        onClick={() => handleIncrement(g.groupId)}
                        className="w-6 h-6 flex items-center justify-center rounded bg-blue-100 text-blue-700 hover:bg-blue-200 text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {groupList.length === 0 && (
              <tr>
                <td colSpan={showCategory ? 3 : 2} className="px-3 py-4 text-center text-sm text-gray-400">
                  該当するグループが見つかりません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">族寄与法(拡張)</h2>
        <p className="text-xs text-gray-500 mb-4">
          Stefanis-Panayiotou法の拡張版。カテゴリ分類された基グループから対話的にHSPを推算します。カテゴリフィルタと検索で目的のグループを素早く選択できます。
        </p>

        {groupsLoading ? (
          <p className="text-sm text-gray-400">グループ定義を読み込み中...</p>
        ) : (
          <div className="space-y-4">
            {/* 検索とフィルタ */}
            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="グループ名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm w-64"
              />
              <div className="flex flex-wrap gap-1">
                <button
                  onClick={() => setCategoryFilter(null)}
                  className={`px-2 py-1 rounded text-xs font-medium transition-colors ${categoryFilter === null ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  全て
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      categoryFilter === cat ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                    } ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-600'}`}
                  >
                    {CATEGORY_LABELS[cat] ?? cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 第1次グループ */}
            {renderGroupTable(
              filteredFirstOrder,
              `第1次グループ (${filteredFirstOrder.length}/${firstOrderGroups.length}種)`,
              true,
            )}

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
                    {renderGroupTable(filteredSecondOrder, '', false)}
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
            {loading ? '推定中...' : 'HSP推定(拡張)'}
          </button>
          <BookmarkButton
            pipeline="groupContributionUpdates"
            params={{
              firstOrderGroups: Object.entries(counts)
                .filter(([id, count]) => count > 0 && firstOrderGroups.some((g) => g.groupId === id))
                .map(([id, count]) => ({ groupId: id, count })),
              secondOrderGroups: Object.entries(counts)
                .filter(([id, count]) => count > 0 && secondOrderGroups.some((g) => g.groupId === id))
                .map(([id, count]) => ({ groupId: id, count })),
            }}
            disabled={!hasFirstOrder}
          />
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
              <div className="text-2xl font-bold text-gray-800">{result.hsp.deltaD.toFixed(2)}</div>
              <div className="text-xs text-gray-500">deltaD (MPa1/2)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.hsp.deltaP.toFixed(2)}</div>
              <div className="text-xs text-gray-500">deltaP (MPa1/2)</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-800">{result.hsp.deltaH.toFixed(2)}</div>
              <div className="text-xs text-gray-500">deltaH (MPa1/2)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold ${CONFIDENCE_COLOR[result.confidence] ?? 'text-gray-800'}`}>
                {CONFIDENCE_LABEL[result.confidence] ?? result.confidence}
              </div>
              <div className="text-xs text-gray-500">信頼度</div>
            </div>
          </div>

          {/* 使用グループ */}
          {result.inputGroups.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg mb-4">
              <h4 className="text-xs font-medium text-gray-600 mb-2">使用グループ ({result.method})</h4>
              <div className="flex flex-wrap gap-2">
                {result.inputGroups.map((g, i) => (
                  <span key={i} className="inline-block px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {g.name} x{g.count}
                  </span>
                ))}
              </div>
            </div>
          )}

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
