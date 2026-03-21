import React from 'react';

interface FilmQualityBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Good: { label: '良好', bg: 'bg-green-100', text: 'text-green-800' },
  Moderate: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Poor: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function FilmQualityBadge({ level }: FilmQualityBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
