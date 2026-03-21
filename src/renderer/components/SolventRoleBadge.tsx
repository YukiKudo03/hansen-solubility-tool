import React from 'react';

interface SolventRoleBadgeProps {
  role: string;
}

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  ProcessingSolvent: { label: '良溶媒', bg: 'bg-green-100', text: 'text-green-800' },
  Intermediate: { label: '中間', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  AntiSolvent: { label: 'アンチソルベント', bg: 'bg-blue-100', text: 'text-blue-800' },
};

export default function SolventRoleBadge({ role }: SolventRoleBadgeProps) {
  const config = BADGE_CONFIG[role] ?? { label: role, bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-md3-sm text-md3-label-md ${config.bg} ${config.text}`}>
      <span className="font-bold">{config.label}</span>
    </span>
  );
}
