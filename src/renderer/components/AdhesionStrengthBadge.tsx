import React from 'react';

interface AdhesionStrengthBadgeProps {
  level: number;
}

const BADGE_CONFIG: Record<number, { label: string; bg: string; text: string }> = {
  1: { label: 'Excellent', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: 'Good', bg: 'bg-teal-100', text: 'text-teal-800' },
  3: { label: 'Fair', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: 'Poor', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function AdhesionStrengthBadge({ level }: AdhesionStrengthBadgeProps) {
  const config = BADGE_CONFIG[level] ?? { label: String(level), bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}
    >
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
