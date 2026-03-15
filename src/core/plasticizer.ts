/**
 * 可塑剤選定の分類・スクリーニングロジック
 * RED小=相溶性良好
 */
import { PlasticizerCompatibilityLevel } from './types';
import type { Part, Solvent, PlasticizerCompatibilityThresholds, PlasticizerScreeningResult, PlasticizerEvaluationResult } from './types';
import { calculateRa, calculateRed } from './hsp';

export const DEFAULT_PLASTICIZER_THRESHOLDS: PlasticizerCompatibilityThresholds = {
  excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
};

export interface PlasticizerCompatibilityLevelInfo {
  level: PlasticizerCompatibilityLevel;
  label: string;
  description: string;
  color: string;
}

const PLASTICIZER_LEVEL_INFO: Record<PlasticizerCompatibilityLevel, PlasticizerCompatibilityLevelInfo> = {
  [PlasticizerCompatibilityLevel.Excellent]: { level: PlasticizerCompatibilityLevel.Excellent, label: '優秀', description: '非常に高い相溶性', color: 'green' },
  [PlasticizerCompatibilityLevel.Good]: { level: PlasticizerCompatibilityLevel.Good, label: '良好', description: '良好な相溶性', color: 'teal' },
  [PlasticizerCompatibilityLevel.Fair]: { level: PlasticizerCompatibilityLevel.Fair, label: '可能', description: '条件次第で使用可', color: 'yellow' },
  [PlasticizerCompatibilityLevel.Poor]: { level: PlasticizerCompatibilityLevel.Poor, label: '不良', description: '相溶性が低い', color: 'orange' },
  [PlasticizerCompatibilityLevel.Incompatible]: { level: PlasticizerCompatibilityLevel.Incompatible, label: '不相溶', description: '相溶しない', color: 'red' },
};

export function classifyPlasticizerCompatibility(red: number, thresholds: PlasticizerCompatibilityThresholds = DEFAULT_PLASTICIZER_THRESHOLDS): PlasticizerCompatibilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return PlasticizerCompatibilityLevel.Excellent;
  if (red < thresholds.goodMax) return PlasticizerCompatibilityLevel.Good;
  if (red < thresholds.fairMax) return PlasticizerCompatibilityLevel.Fair;
  if (red < thresholds.poorMax) return PlasticizerCompatibilityLevel.Poor;
  return PlasticizerCompatibilityLevel.Incompatible;
}

export function getPlasticizerCompatibilityLevelInfo(level: PlasticizerCompatibilityLevel): PlasticizerCompatibilityLevelInfo {
  return PLASTICIZER_LEVEL_INFO[level];
}

export function screenPlasticizers(part: Part, solvents: Solvent[], thresholds: PlasticizerCompatibilityThresholds = DEFAULT_PLASTICIZER_THRESHOLDS): PlasticizerEvaluationResult {
  const results: PlasticizerScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(part.hsp, solvent.hsp);
    const red = calculateRed(part.hsp, solvent.hsp, part.r0);
    const compatibility = classifyPlasticizerCompatibility(red, thresholds);
    return { part, solvent, ra, red, compatibility };
  });
  results.sort((a, b) => a.red - b.red);
  return { part, results, evaluatedAt: new Date(), thresholdsUsed: thresholds };
}
