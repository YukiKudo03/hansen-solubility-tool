/**
 * フレーバースカルピング予測
 *
 * 包装材ポリマーが食品中のアロマ成分を吸収する現象を予測。
 * RED小 → スカルピングリスク高（ポリマーがアロマを吸収）
 * RED大 → スカルピングリスク低
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** スカルピングリスク分類 */
export enum ScalpingLevel {
  HighScalping = 1,     // 高リスク（RED < 0.8）
  ModerateScalping = 2, // 中程度（0.8 ≤ RED < 1.2）
  LowScalping = 3,      // 低リスク（RED ≥ 1.2）
}

/** スカルピング閾値 */
export interface ScalpingThresholds {
  highScalpingMax: number;     // default: 0.8
  moderateScalpingMax: number; // default: 1.2
}

/** フレーバー入力 */
export interface FlavorInput {
  name: string;
  hsp: HSPValues;
}

/** スカルピング評価結果 */
export interface ScalpingResult {
  flavorName: string;
  flavorHSP: HSPValues;
  ra: number;
  red: number;
  scalpingLevel: ScalpingLevel;
}

/** スカルピングレベル表示情報 */
export interface ScalpingLevelInfo {
  level: ScalpingLevel;
  label: string;
  description: string;
  color: string;
}

export const DEFAULT_SCALPING_THRESHOLDS: ScalpingThresholds = {
  highScalpingMax: 0.8,
  moderateScalpingMax: 1.2,
};

const SCALPING_LEVEL_INFO: Record<ScalpingLevel, ScalpingLevelInfo> = {
  [ScalpingLevel.HighScalping]: { level: ScalpingLevel.HighScalping, label: '高スカルピング', description: 'ポリマーがアロマを強く吸収する', color: 'red' },
  [ScalpingLevel.ModerateScalping]: { level: ScalpingLevel.ModerateScalping, label: '中程度', description: '条件次第でスカルピング発生', color: 'yellow' },
  [ScalpingLevel.LowScalping]: { level: ScalpingLevel.LowScalping, label: '低スカルピング', description: 'スカルピングリスクが低い', color: 'green' },
};

/**
 * RED値からスカルピングリスクを分類
 */
export function classifyScalping(red: number, thresholds: ScalpingThresholds = DEFAULT_SCALPING_THRESHOLDS): ScalpingLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.highScalpingMax) return ScalpingLevel.HighScalping;
  if (red < thresholds.moderateScalpingMax) return ScalpingLevel.ModerateScalping;
  return ScalpingLevel.LowScalping;
}

export function getScalpingLevelInfo(level: ScalpingLevel): ScalpingLevelInfo {
  return SCALPING_LEVEL_INFO[level];
}

/**
 * フレーバースカルピングをスクリーニング
 *
 * @param packagingHSP - 包装材のHSP
 * @param packagingR0 - 包装材の相互作用半径
 * @param flavors - フレーバー（アロマ成分）リスト
 * @param thresholds - 閾値設定
 * @returns RED昇順ソート（スカルピングリスクが高い順）
 */
export function screenFlavorScalping(
  packagingHSP: HSPValues,
  packagingR0: number,
  flavors: FlavorInput[],
  thresholds: ScalpingThresholds = DEFAULT_SCALPING_THRESHOLDS
): ScalpingResult[] {
  const results: ScalpingResult[] = flavors.map((flavor) => {
    const ra = calculateRa(packagingHSP, flavor.hsp);
    const red = calculateRed(packagingHSP, flavor.hsp, packagingR0);
    const scalpingLevel = classifyScalping(red, thresholds);
    return { flavorName: flavor.name, flavorHSP: flavor.hsp, ra, red, scalpingLevel };
  });
  results.sort((a, b) => a.red - b.red);
  return results;
}
