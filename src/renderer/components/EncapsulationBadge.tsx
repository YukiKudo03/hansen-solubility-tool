import React from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';

const CONFIG: Record<string | number, BadgeLevelConfig> = {
  3: { label: '優秀', bg: 'bg-green-100', text: 'text-green-800' },
  2: { label: '良好', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  1: { label: '不良', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function EncapsulationBadge({ level }: { level: number }) {
  return <GenericLevelBadge level={level} config={CONFIG} />;
}
