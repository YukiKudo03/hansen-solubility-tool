import React from 'react';

interface ExtractionLevelBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Excellent: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  Good: { label: '良好', bg: 'bg-blue-100', text: 'text-blue-800' },
  Low: { label: '低効率', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function ExtractionLevelBadge({ level }: ExtractionLevelBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
