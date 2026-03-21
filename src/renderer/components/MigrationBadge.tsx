import React from 'react';
import GenericLevelBadge from './GenericLevelBadge';
import type { BadgeLevelConfig } from './GenericLevelBadge';

const CONFIG: Record<string, BadgeLevelConfig> = {
  Stable: { label: '安定', bg: 'bg-green-100', text: 'text-green-800' },
  Moderate: { label: '中程度', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  High: { label: '高リスク', bg: 'bg-red-100', text: 'text-red-800' },
};

export default function MigrationBadge({ level }: { level: string }) {
  return <GenericLevelBadge level={level} config={CONFIG} />;
}
