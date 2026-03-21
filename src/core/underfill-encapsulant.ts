/**
 * アンダーフィル/封止材適合性評価
 *
 * 封止材と2つの界面（チップ表面、基板表面）間のWaを計算し、
 * 弱い方がボトルネック（structural-adhesive-joint類似）。
 */
import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';
import { calculateRa } from './hsp';

/** 封止材適合性レベル */
export enum UnderfillLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Fair = 'Fair',
  Poor = 'Poor',
}

/** 封止材適合性結果 */
export interface UnderfillCompatibilityResult {
  encapsulantHSP: HSPValues;
  chipSurfaceHSP: HSPValues;
  substrateHSP: HSPValues;
  waChip: number;       // 封止材-チップ間 Wa
  waSubstrate: number;  // 封止材-基板間 Wa
  raChip: number;
  raSubstrate: number;
  minWa: number;
  bottleneck: 'chip' | 'substrate';
  level: UnderfillLevel;
  evaluatedAt: Date;
}

/** レベル表示情報 */
export interface UnderfillLevelInfo {
  level: UnderfillLevel;
  label: string;
  description: string;
  color: string;
}

const LEVEL_INFO: Record<UnderfillLevel, UnderfillLevelInfo> = {
  [UnderfillLevel.Excellent]: { level: UnderfillLevel.Excellent, label: '優秀', description: '両界面とも優秀な密着性', color: 'green' },
  [UnderfillLevel.Good]: { level: UnderfillLevel.Good, label: '良好', description: '良好な密着性', color: 'teal' },
  [UnderfillLevel.Fair]: { level: UnderfillLevel.Fair, label: '可能', description: '条件次第で使用可', color: 'yellow' },
  [UnderfillLevel.Poor]: { level: UnderfillLevel.Poor, label: '不良', description: '密着性不足', color: 'red' },
};

export function getUnderfillLevelInfo(level: UnderfillLevel): UnderfillLevelInfo {
  return LEVEL_INFO[level];
}

function classifyUnderfill(minWa: number): UnderfillLevel {
  if (minWa > 80) return UnderfillLevel.Excellent;
  if (minWa > 60) return UnderfillLevel.Good;
  if (minWa > 40) return UnderfillLevel.Fair;
  return UnderfillLevel.Poor;
}

/**
 * アンダーフィル/封止材適合性を評価する
 */
export function evaluateUnderfillCompatibility(
  encapsulantHSP: HSPValues,
  chipSurfaceHSP: HSPValues,
  substrateHSP: HSPValues,
): UnderfillCompatibilityResult {
  const waChip = calculateWorkOfAdhesionFromHSP(encapsulantHSP, chipSurfaceHSP);
  const waSubstrate = calculateWorkOfAdhesionFromHSP(encapsulantHSP, substrateHSP);
  const raChip = calculateRa(encapsulantHSP, chipSurfaceHSP);
  const raSubstrate = calculateRa(encapsulantHSP, substrateHSP);

  const minWa = Math.min(waChip, waSubstrate);
  const bottleneck: 'chip' | 'substrate' = waChip <= waSubstrate ? 'chip' : 'substrate';
  const level = classifyUnderfill(minWa);

  return {
    encapsulantHSP,
    chipSurfaceHSP,
    substrateHSP,
    waChip,
    waSubstrate,
    raChip,
    raSubstrate,
    minWa,
    bottleneck,
    level,
    evaluatedAt: new Date(),
  };
}
