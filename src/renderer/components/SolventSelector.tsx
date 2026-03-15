import React, { useState, useEffect } from 'react';
import type { Solvent } from '../../core/types';

interface SolventSelectorProps {
  onSelect: (solvent: Solvent) => void;
  selected?: Solvent | null;
}

export default function SolventSelector({ onSelect, selected }: SolventSelectorProps) {
  const [query, setQuery] = useState('');
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const search = async () => {
      const results = await window.api.searchSolvents(query);
      setSolvents(results);
    };
    search();
  }, [query]);

  const handleSelect = (solvent: Solvent) => {
    onSelect(solvent);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">溶媒を選択</label>
      {selected && (
        <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm flex justify-between items-center">
          <span>
            <span className="font-medium">{selected.name}</span>
            {selected.nameEn && <span className="text-gray-500 ml-2">({selected.nameEn})</span>}
          </span>
          <button
            onClick={() => onSelect(null as unknown as Solvent)}
            className="text-blue-600 hover:text-blue-800 text-xs"
          >
            変更
          </button>
        </div>
      )}
      {!selected && (
        <>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="溶媒名・英語名・CAS番号で検索..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {isOpen && solvents.length > 0 && (
            <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {solvents.map((s) => (
                <li
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className="px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium">{s.name}</div>
                  <div className="text-gray-500 text-xs">
                    {s.nameEn && <span>{s.nameEn} </span>}
                    {s.casNumber && <span>CAS: {s.casNumber} </span>}
                    <span>δD={s.hsp.deltaD} δP={s.hsp.deltaP} δH={s.hsp.deltaH}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
