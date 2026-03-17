import React, { useState, useEffect, useRef } from 'react';
import type { Solvent } from '../../core/types';

interface SolventSelectorProps {
  onSelect: (solvent: Solvent) => void;
  selected?: Solvent | null;
}

export default function SolventSelector({ onSelect, selected }: SolventSelectorProps) {
  const [query, setQuery] = useState('');
  const [solvents, setSolvents] = useState<Solvent[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const inputId = 'solvent-search-input';

  useEffect(() => {
    const search = async () => {
      const results = await window.api.searchSolvents(query);
      setSolvents(results);
      setHighlightIndex(-1);
    };
    search();
  }, [query]);

  const handleSelect = (solvent: Solvent) => {
    onSelect(solvent);
    setQuery('');
    setIsOpen(false);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || solvents.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightIndex((prev) => Math.min(prev + 1, solvents.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < solvents.length) {
          handleSelect(solvents[highlightIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setHighlightIndex(-1);
        break;
    }
  };

  // スクロールでハイライト項目を表示
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightIndex] as HTMLElement;
      item?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightIndex]);

  return (
    <div className="relative">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">溶媒を選択</label>
      {selected && (
        <div className="mb-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm flex justify-between items-center">
          <span>
            <span className="font-medium">{selected.name}</span>
            {selected.nameEn && <span className="text-gray-500 ml-2">({selected.nameEn})</span>}
          </span>
          <button
            onClick={() => onSelect(null as unknown as Solvent)}
            className="text-blue-600 hover:text-blue-800 text-xs"
            aria-label="溶媒を変更"
          >
            変更
          </button>
        </div>
      )}
      {!selected && (
        <>
          <input
            id={inputId}
            type="text"
            aria-expanded={isOpen && solvents.length > 0}
            aria-autocomplete="list"
            aria-controls="solvent-listbox"
            aria-activedescendant={highlightIndex >= 0 ? `solvent-option-${solvents[highlightIndex]?.id}` : undefined}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="溶媒名・英語名・CAS番号で検索..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {isOpen && solvents.length > 0 && (
            <ul
              id="solvent-listbox"
              ref={listRef}
              role="listbox"
              aria-label="溶媒候補"
              className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {solvents.map((s, index) => (
                <li
                  key={s.id}
                  id={`solvent-option-${s.id}`}
                  role="option"
                  aria-selected={index === highlightIndex}
                  onClick={() => handleSelect(s)}
                  className={`px-3 py-2 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 ${
                    index === highlightIndex ? 'bg-blue-100' : 'hover:bg-blue-50'
                  }`}
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
