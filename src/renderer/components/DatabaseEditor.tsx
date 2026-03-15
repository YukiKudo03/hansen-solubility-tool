import React, { useState, useEffect, useCallback } from 'react';
import type { PartsGroup, Solvent } from '../../core/types';

type EditorTab = 'groups' | 'solvents';

export default function DatabaseEditor() {
  const [activeTab, setActiveTab] = useState<EditorTab>('groups');
  const [groups, setGroups] = useState<PartsGroup[]>([]);
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [solventSearch, setSolventSearch] = useState('');

  // --- 部品グループ編集用 ---
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');

  // --- 部品追加用 ---
  const [addingPartToGroup, setAddingPartToGroup] = useState<number | null>(null);
  const [newPartName, setNewPartName] = useState('');
  const [newPartType, setNewPartType] = useState('');
  const [newPartDd, setNewPartDd] = useState('');
  const [newPartDp, setNewPartDp] = useState('');
  const [newPartDh, setNewPartDh] = useState('');
  const [newPartR0, setNewPartR0] = useState('');

  // --- 溶媒追加用 ---
  const [addingSolvent, setAddingSolvent] = useState(false);
  const [newSolventName, setNewSolventName] = useState('');
  const [newSolventNameEn, setNewSolventNameEn] = useState('');
  const [newSolventCas, setNewSolventCas] = useState('');
  const [newSolventDd, setNewSolventDd] = useState('');
  const [newSolventDp, setNewSolventDp] = useState('');
  const [newSolventDh, setNewSolventDh] = useState('');
  const [newSolventMv, setNewSolventMv] = useState('');
  const [newSolventMw, setNewSolventMw] = useState('');

  const loadGroups = useCallback(async () => {
    setGroups(await window.api.getAllGroups());
  }, []);

  const loadSolvents = useCallback(async () => {
    setSolvents(await window.api.searchSolvents(solventSearch));
  }, [solventSearch]);

  useEffect(() => {
    loadGroups();
    loadSolvents();
  }, [loadGroups, loadSolvents]);

  // --- グループ操作 ---
  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    await window.api.createGroup({ name: newGroupName, description: newGroupDesc || undefined });
    setNewGroupName('');
    setNewGroupDesc('');
    await loadGroups();
  };

  const handleDeleteGroup = async (id: number) => {
    if (!confirm('このグループと配下の全部品を削除しますか？')) return;
    await window.api.deleteGroup(id);
    await loadGroups();
  };

  // --- 部品操作 ---
  const handleAddPart = async (groupId: number) => {
    if (!newPartName.trim() || !newPartDd || !newPartDp || !newPartDh || !newPartR0) return;
    await window.api.createPart({
      groupId,
      name: newPartName,
      materialType: newPartType || undefined,
      deltaD: parseFloat(newPartDd),
      deltaP: parseFloat(newPartDp),
      deltaH: parseFloat(newPartDh),
      r0: parseFloat(newPartR0),
    });
    setAddingPartToGroup(null);
    setNewPartName('');
    setNewPartType('');
    setNewPartDd('');
    setNewPartDp('');
    setNewPartDh('');
    setNewPartR0('');
    await loadGroups();
  };

  const handleDeletePart = async (id: number) => {
    if (!confirm('この部品を削除しますか？')) return;
    await window.api.deletePart(id);
    await loadGroups();
  };

  // --- 溶媒操作 ---
  const handleAddSolvent = async () => {
    if (!newSolventName.trim() || !newSolventDd || !newSolventDp || !newSolventDh) return;
    await window.api.createSolvent({
      name: newSolventName,
      nameEn: newSolventNameEn || undefined,
      casNumber: newSolventCas || undefined,
      deltaD: parseFloat(newSolventDd),
      deltaP: parseFloat(newSolventDp),
      deltaH: parseFloat(newSolventDh),
      molarVolume: newSolventMv ? parseFloat(newSolventMv) : undefined,
      molWeight: newSolventMw ? parseFloat(newSolventMw) : undefined,
    });
    setAddingSolvent(false);
    setNewSolventName('');
    setNewSolventNameEn('');
    setNewSolventCas('');
    setNewSolventDd('');
    setNewSolventDp('');
    setNewSolventDh('');
    setNewSolventMv('');
    setNewSolventMw('');
    await loadSolvents();
  };

  const handleDeleteSolvent = async (id: number) => {
    if (!confirm('この溶媒を削除しますか？')) return;
    await window.api.deleteSolvent(id);
    await loadSolvents();
  };

  const inputClass = 'px-2 py-1 border border-gray-300 rounded text-sm w-full';

  return (
    <div className="space-y-4">
      {/* タブ */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'groups' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          部品グループ
        </button>
        <button
          onClick={() => setActiveTab('solvents')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'solvents' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          溶媒
        </button>
      </div>

      {/* 部品グループタブ */}
      {activeTab === 'groups' && (
        <div className="space-y-4">
          {/* 新規グループ追加 */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-semibold mb-2">新規グループ追加</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="グループ名"
                className={inputClass}
              />
              <input
                type="text"
                value={newGroupDesc}
                onChange={(e) => setNewGroupDesc(e.target.value)}
                placeholder="説明（任意）"
                className={inputClass}
              />
              <button
                onClick={handleCreateGroup}
                className="px-4 py-1 bg-blue-600 text-white rounded text-sm whitespace-nowrap hover:bg-blue-700"
              >
                追加
              </button>
            </div>
          </div>

          {/* グループ一覧 */}
          {groups.map((group) => (
            <div key={group.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{group.name}</h3>
                  {group.description && (
                    <p className="text-xs text-gray-500">{group.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAddingPartToGroup(addingPartToGroup === group.id ? null : group.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                  >
                    部品追加
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                  >
                    削除
                  </button>
                </div>
              </div>

              {/* 部品追加フォーム */}
              {addingPartToGroup === group.id && (
                <div className="bg-green-50 p-3 rounded mb-3">
                  <div className="grid grid-cols-6 gap-2 mb-2">
                    <input value={newPartName} onChange={(e) => setNewPartName(e.target.value)} placeholder="部品名" className={inputClass} />
                    <input value={newPartType} onChange={(e) => setNewPartType(e.target.value)} placeholder="材料種別" className={inputClass} />
                    <input value={newPartDd} onChange={(e) => setNewPartDd(e.target.value)} placeholder="δD" type="number" step="0.1" className={inputClass} />
                    <input value={newPartDp} onChange={(e) => setNewPartDp(e.target.value)} placeholder="δP" type="number" step="0.1" className={inputClass} />
                    <input value={newPartDh} onChange={(e) => setNewPartDh(e.target.value)} placeholder="δH" type="number" step="0.1" className={inputClass} />
                    <input value={newPartR0} onChange={(e) => setNewPartR0(e.target.value)} placeholder="R₀" type="number" step="0.1" className={inputClass} />
                  </div>
                  <button onClick={() => handleAddPart(group.id)} className="px-3 py-1 bg-green-600 text-white rounded text-xs">
                    保存
                  </button>
                </div>
              )}

              {/* 部品テーブル */}
              {group.parts.length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b">
                      <th className="text-left py-1">名前</th>
                      <th className="text-left py-1">材料</th>
                      <th className="text-right py-1">δD</th>
                      <th className="text-right py-1">δP</th>
                      <th className="text-right py-1">δH</th>
                      <th className="text-right py-1">R₀</th>
                      <th className="text-right py-1">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.parts.map((part) => (
                      <tr key={part.id} className="border-b border-gray-100">
                        <td className="py-1">{part.name}</td>
                        <td className="py-1 text-gray-500">{part.materialType ?? '-'}</td>
                        <td className="py-1 text-right">{part.hsp.deltaD.toFixed(1)}</td>
                        <td className="py-1 text-right">{part.hsp.deltaP.toFixed(1)}</td>
                        <td className="py-1 text-right">{part.hsp.deltaH.toFixed(1)}</td>
                        <td className="py-1 text-right">{part.r0.toFixed(1)}</td>
                        <td className="py-1 text-right">
                          <button
                            onClick={() => handleDeletePart(part.id)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            削除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {group.parts.length === 0 && (
                <p className="text-xs text-gray-400">部品がありません</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 溶媒タブ */}
      {activeTab === 'solvents' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={solventSearch}
                onChange={(e) => setSolventSearch(e.target.value)}
                placeholder="溶媒を検索..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
              <button
                onClick={() => setAddingSolvent(!addingSolvent)}
                className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
              >
                新規追加
              </button>
            </div>

            {/* 溶媒追加フォーム */}
            {addingSolvent && (
              <div className="bg-green-50 p-4 rounded mb-4">
                <h4 className="text-sm font-semibold mb-2">新規溶媒追加</h4>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  <input value={newSolventName} onChange={(e) => setNewSolventName(e.target.value)} placeholder="日本語名 *" className={inputClass} />
                  <input value={newSolventNameEn} onChange={(e) => setNewSolventNameEn(e.target.value)} placeholder="英語名" className={inputClass} />
                  <input value={newSolventCas} onChange={(e) => setNewSolventCas(e.target.value)} placeholder="CAS番号" className={inputClass} />
                  <div />
                  <input value={newSolventDd} onChange={(e) => setNewSolventDd(e.target.value)} placeholder="δD *" type="number" step="0.1" className={inputClass} />
                  <input value={newSolventDp} onChange={(e) => setNewSolventDp(e.target.value)} placeholder="δP *" type="number" step="0.1" className={inputClass} />
                  <input value={newSolventDh} onChange={(e) => setNewSolventDh(e.target.value)} placeholder="δH *" type="number" step="0.1" className={inputClass} />
                  <input value={newSolventMv} onChange={(e) => setNewSolventMv(e.target.value)} placeholder="モル体積" type="number" step="0.1" className={inputClass} />
                  <input value={newSolventMw} onChange={(e) => setNewSolventMw(e.target.value)} placeholder="分子量" type="number" step="0.01" className={inputClass} />
                </div>
                <button onClick={handleAddSolvent} className="px-3 py-1 bg-green-600 text-white rounded text-sm">
                  保存
                </button>
              </div>
            )}

            {/* 溶媒テーブル */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b">
                    <th className="text-left py-2">名前</th>
                    <th className="text-left py-2">英語名</th>
                    <th className="text-left py-2">CAS</th>
                    <th className="text-right py-2">δD</th>
                    <th className="text-right py-2">δP</th>
                    <th className="text-right py-2">δH</th>
                    <th className="text-right py-2">Vm</th>
                    <th className="text-right py-2">Mw</th>
                    <th className="text-right py-2">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {solvents.map((s) => (
                    <tr key={s.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-1.5">{s.name}</td>
                      <td className="py-1.5 text-gray-500">{s.nameEn ?? '-'}</td>
                      <td className="py-1.5 text-gray-500">{s.casNumber ?? '-'}</td>
                      <td className="py-1.5 text-right">{s.hsp.deltaD.toFixed(1)}</td>
                      <td className="py-1.5 text-right">{s.hsp.deltaP.toFixed(1)}</td>
                      <td className="py-1.5 text-right">{s.hsp.deltaH.toFixed(1)}</td>
                      <td className="py-1.5 text-right">{s.molarVolume?.toFixed(1) ?? '-'}</td>
                      <td className="py-1.5 text-right">{s.molWeight?.toFixed(2) ?? '-'}</td>
                      <td className="py-1.5 text-right">
                        <button
                          onClick={() => handleDeleteSolvent(s.id)}
                          className="text-red-600 hover:text-red-800 text-xs"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">{solvents.length} 件の溶媒</p>
          </div>
        </div>
      )}
    </div>
  );
}
