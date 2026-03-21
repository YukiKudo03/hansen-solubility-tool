import React from 'react';

interface MiscibilityBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  miscible: { label: '相溶', bg: 'bg-green-100', text: 'text-green-800' },
  partial: { label: '部分相溶', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  immiscible: { label: '非相溶', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function MiscibilityBadge({ level }: MiscibilityBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
