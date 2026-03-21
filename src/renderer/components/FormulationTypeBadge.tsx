import React from 'react';

interface FormulationTypeBadgeProps {
  level: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Solution: { label: '溶液型', bg: 'bg-green-100', text: 'text-green-800' },
  Suspension: { label: '懸濁型', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  Unstable: { label: '不安定', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function FormulationTypeBadge({ level }: FormulationTypeBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: level, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
