import React from 'react';

interface SmoothingBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Dissolves: { label: '溶解(過剰)', bg: 'bg-red-100', text: 'text-red-800' },
  Good: { label: '良好', bg: 'bg-green-100', text: 'text-green-800' },
  Mild: { label: '軽微', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  NoEffect: { label: '効果なし', bg: 'bg-gray-100', text: 'text-gray-800' },
};

export default function SmoothingBadge({ level }: SmoothingBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
