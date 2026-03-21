/**
 * 印刷電子デバイスインク濡れ性評価
 *
 * Work of Adhesion + Contact Angle の複合評価で、
 * インク-基材間の濡れ性を判定する。
 *
 * WettingLevel:
 * - Excellent: Wa >= 80 かつ θ < 30°
 * - Good:      Wa >= 60 かつ θ < 60°
 * - Moderate:  Wa >= 40 かつ θ < 90°
 * - Poor:      それ以外
 */
import type { HSPValues } from './types';
import { calculateWorkOfAdhesionFromHSP } from './work-of-adhesion';
import { calculateContactAngle } from './contact-angle';
import { calculateRa } from './hsp';

/** 濡れ性レベル */
export enum WettingLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Moderate = 'Moderate',
  Poor = 'Poor',
}

/** 濡れ性評価結果 */
export interface PrintedElectronicsWettingResult {
  inkHSP: HSPValues;
  substrateHSP: HSPValues;
  wa: number;           // 接着仕事 [mJ/m²]
  contactAngle: number; // 接触角 [°]
  ra: number;           // HSP距離
  wettingLevel: WettingLevel;
  evaluatedAt: Date;
}

/** 濡れ性レベル表示情報 */
export interface WettingLevelInfo {
  level: WettingLevel;
  label: string;
  description: string;
  color: string;
}

const WETTING_LEVEL_INFO: Record<WettingLevel, WettingLevelInfo> = {
  [WettingLevel.Excellent]: { level: WettingLevel.Excellent, label: '優秀', description: '高い濡れ性と密着性', color: 'green' },
  [WettingLevel.Good]: { level: WettingLevel.Good, label: '良好', description: '良好な濡れ性', color: 'teal' },
  [WettingLevel.Moderate]: { level: WettingLevel.Moderate, label: '中程度', description: '条件次第で使用可', color: 'yellow' },
  [WettingLevel.Poor]: { level: WettingLevel.Poor, label: '不良', description: '濡れ性不足', color: 'red' },
};

export function getWettingLevelInfo(level: WettingLevel): WettingLevelInfo {
  return WETTING_LEVEL_INFO[level];
}

/**
 * 濡れ性レベルを分類する
 */
export function classifyWetting(wa: number, contactAngle: number): WettingLevel {
  if (wa >= 80 && contactAngle < 30) return WettingLevel.Excellent;
  if (wa >= 60 && contactAngle < 60) return WettingLevel.Good;
  if (wa >= 40 && contactAngle < 90) return WettingLevel.Moderate;
  return WettingLevel.Poor;
}

/**
 * 印刷電子デバイスインク濡れ性を評価する
 */
export function evaluatePrintedElectronicsWetting(
  inkHSP: HSPValues,
  substrateHSP: HSPValues,
): PrintedElectronicsWettingResult {
  const wa = calculateWorkOfAdhesionFromHSP(inkHSP, substrateHSP);
  const contactAngle = calculateContactAngle(substrateHSP, inkHSP);
  const ra = calculateRa(inkHSP, substrateHSP);
  const wettingLevel = classifyWetting(wa, contactAngle);

  return {
    inkHSP,
    substrateHSP,
    wa,
    contactAngle,
    ra,
    wettingLevel,
    evaluatedAt: new Date(),
  };
}
