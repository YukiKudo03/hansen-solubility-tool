/**
 * 薬物送達キャリア選定ロジック
 * Drug × Part(carrier) のスクリーニング。r0はキャリア（HSP球の所有者）のものを使用。
 */
import { CarrierCompatibilityLevel } from './types';
import type { Drug, Part, CarrierCompatibilityThresholds, CarrierScreeningResult, CarrierEvaluationResult } from './types';
import { calculateRa, calculateRed } from './hsp';

export const DEFAULT_CARRIER_THRESHOLDS: CarrierCompatibilityThresholds = {
  excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5,
};

export interface CarrierCompatibilityLevelInfo {
  level: CarrierCompatibilityLevel;
  label: string;
  description: string;
  color: string;
}

const CARRIER_LEVEL_INFO: Record<CarrierCompatibilityLevel, CarrierCompatibilityLevelInfo> = {
  [CarrierCompatibilityLevel.Excellent]: { level: CarrierCompatibilityLevel.Excellent, label: '優秀', description: '非常に高い適合性（高カプセル化効率）', color: 'green' },
  [CarrierCompatibilityLevel.Good]: { level: CarrierCompatibilityLevel.Good, label: '良好', description: '良好な適合性', color: 'teal' },
  [CarrierCompatibilityLevel.Fair]: { level: CarrierCompatibilityLevel.Fair, label: '可能', description: '条件次第で使用可', color: 'yellow' },
  [CarrierCompatibilityLevel.Poor]: { level: CarrierCompatibilityLevel.Poor, label: '不良', description: '適合性が低い', color: 'orange' },
  [CarrierCompatibilityLevel.Incompatible]: { level: CarrierCompatibilityLevel.Incompatible, label: '不適', description: 'キャリアとして不適', color: 'red' },
};

export function classifyCarrierCompatibility(red: number, thresholds: CarrierCompatibilityThresholds = DEFAULT_CARRIER_THRESHOLDS): CarrierCompatibilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return CarrierCompatibilityLevel.Excellent;
  if (red < thresholds.goodMax) return CarrierCompatibilityLevel.Good;
  if (red < thresholds.fairMax) return CarrierCompatibilityLevel.Fair;
  if (red < thresholds.poorMax) return CarrierCompatibilityLevel.Poor;
  return CarrierCompatibilityLevel.Incompatible;
}

export function getCarrierCompatibilityLevelInfo(level: CarrierCompatibilityLevel): CarrierCompatibilityLevelInfo {
  return CARRIER_LEVEL_INFO[level];
}

export function screenCarriers(drug: Drug, carriers: Part[], thresholds: CarrierCompatibilityThresholds = DEFAULT_CARRIER_THRESHOLDS): CarrierEvaluationResult {
  const results: CarrierScreeningResult[] = carriers.map((carrier) => {
    const ra = calculateRa(drug.hsp, carrier.hsp);
    // IMPORTANT: r0 belongs to carrier (HSP sphere owner), NOT drug
    const red = calculateRed(drug.hsp, carrier.hsp, carrier.r0);
    const compatibility = classifyCarrierCompatibility(red, thresholds);
    return { drug, carrier, ra, red, compatibility };
  });
  results.sort((a, b) => a.red - b.red);
  return { drug, results, evaluatedAt: new Date(), thresholdsUsed: thresholds };
}
