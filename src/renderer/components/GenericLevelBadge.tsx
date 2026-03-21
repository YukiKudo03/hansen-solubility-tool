import React from 'react';

export interface BadgeLevelConfig {
  label: string;
  bg: string;
  text: string;
}

interface GenericLevelBadgeProps {
  level: string | number;
  config: Record<string | number, BadgeLevelConfig>;
}

export default function GenericLevelBadge({ level, config }: GenericLevelBadgeProps) {
  const c = config[level] ?? { label: String(level), bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${c.bg} ${c.text}`}
    >
      <span className="font-bold">{c.label}</span>
    </span>
  );
}
