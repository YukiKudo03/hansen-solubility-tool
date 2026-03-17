import React, { useState } from 'react';
import type { BookmarkPipeline, BookmarkParams } from '../../core/types';
import { serializeBookmarkParams } from '../../core/bookmark';

interface BookmarkButtonProps {
  pipeline: BookmarkPipeline;
  params: BookmarkParams;
  disabled?: boolean;
}

export default function BookmarkButton({ pipeline, params, disabled }: BookmarkButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await window.api.createBookmark({
        name: name.trim(),
        pipeline,
        paramsJson: serializeBookmarkParams(params),
      });
      setIsOpen(false);
      setName('');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    setName('');
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="ブックマークに保存"
      >
        ☆ 保存
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-1 right-0 bg-white border border-gray-300 rounded-lg shadow-lg p-4 w-72">
          <label htmlFor="bookmark-name" className="block text-sm font-medium text-gray-700 mb-1">
            ブックマーク名
          </label>
          <input
            id="bookmark-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
            placeholder="ブックマーク名を入力..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 mb-3"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim() || saving}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
