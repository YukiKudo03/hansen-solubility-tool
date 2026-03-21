import React from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';

const CONFIG: Record<string | number, BadgeLevelConfig> = {
  1: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: '良好', bg: 'bg-teal-100', text: 'text-teal-800' },
  3: { label: '可能', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  4: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function TransdermalBadge({ level }: { level: number }) {
  return <GenericLevelBadge level={level} config={CONFIG} />;
}
