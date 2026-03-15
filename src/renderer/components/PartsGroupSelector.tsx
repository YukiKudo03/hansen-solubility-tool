import React, { useState, useEffect } from 'react';
import type { PartsGroup } from '../../core/types';

interface PartsGroupSelectorProps {
  onSelect: (group: PartsGroup) => void;
  selected?: PartsGroup | null;
}

export default function PartsGroupSelector({ onSelect, selected }: PartsGroupSelectorProps) {
  const [groups, setGroups] = useState<PartsGroup[]>([]);

  useEffect(() => {
    const load = async () => {
      const result = await window.api.getAllGroups();
      setGroups(result);
    };
    load();
  }, []);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">部品グループを選択</label>
      <select
        value={selected?.id ?? ''}
        onChange={(e) => {
          const group = groups.find((g) => g.id === Number(e.target.value));
          if (group) onSelect(group);
        }}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
      >
        <option value="">-- 選択してください --</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name} ({g.parts.length}部品)
          </option>
        ))}
      </select>
      {selected && (
        <div className="mt-2 text-xs text-gray-500">
          {selected.description && <p className="mb-1">{selected.description}</p>}
          <p>含まれる部品: {selected.parts.map((p) => p.name).join(', ')}</p>
        </div>
      )}
    </div>
  );
}
