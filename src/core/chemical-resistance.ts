/**
 * 塗膜耐薬品性の分類ロジック
 * RED小=耐性なし, RED大=耐性良好（他の分類と解釈方向が逆）
 */
import { ChemicalResistanceLevel } from './types';
import type { ChemicalResistanceThresholds } from './types';

export const DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS: ChemicalResistanceThresholds = {
  noResistanceMax: 0.5,
  poorMax: 0.8,
  moderateMax: 1.2,
  goodMax: 2.0,
};

export interface ChemicalResistanceLevelInfo {
  level: ChemicalResistanceLevel;
  label: string;
  description: string;
  color: string;
}

const CHEMICAL_RESISTANCE_LEVEL_INFO: Record<ChemicalResistanceLevel, ChemicalResistanceLevelInfo> = {
  [ChemicalResistanceLevel.NoResistance]: { level: ChemicalResistanceLevel.NoResistance, label: '耐性なし', description: '塗膜が溶解・剥離する', color: 'red' },
  [ChemicalResistanceLevel.Poor]: { level: ChemicalResistanceLevel.Poor, label: '低耐性', description: '短期間で劣化する', color: 'orange' },
  [ChemicalResistanceLevel.Moderate]: { level: ChemicalResistanceLevel.Moderate, label: '中程度', description: '条件次第で使用可', color: 'yellow' },
  [ChemicalResistanceLevel.Good]: { level: ChemicalResistanceLevel.Good, label: '良好', description: '長期使用に耐える', color: 'teal' },
  [ChemicalResistanceLevel.Excellent]: { level: ChemicalResistanceLevel.Excellent, label: '優秀', description: '優れた耐薬品性', color: 'green' },
};

export function classifyChemicalResistance(red: number, thresholds: ChemicalResistanceThresholds = DEFAULT_CHEMICAL_RESISTANCE_THRESHOLDS): ChemicalResistanceLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.noResistanceMax) return ChemicalResistanceLevel.NoResistance;
  if (red < thresholds.poorMax) return ChemicalResistanceLevel.Poor;
  if (red < thresholds.moderateMax) return ChemicalResistanceLevel.Moderate;
  if (red < thresholds.goodMax) return ChemicalResistanceLevel.Good;
  return ChemicalResistanceLevel.Excellent;
}

export function getChemicalResistanceLevelInfo(level: ChemicalResistanceLevel): ChemicalResistanceLevelInfo {
  return CHEMICAL_RESISTANCE_LEVEL_INFO[level];
}
