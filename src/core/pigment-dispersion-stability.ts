/**
 * 顔料分散安定性評価
 *
 * RED値に基づいて、顔料のビヒクル（バインダー樹脂）中での分散安定性を評価する。
 * RED < 0.8: Stable（安定分散）
 * 0.8 <= RED < 1.2: Moderate（中程度）
 * RED >= 1.2: Unstable（不安定）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 分散安定性レベル */
export enum StabilityLevel {
  Stable = 'Stable',
  Moderate = 'Moderate',
  Unstable = 'Unstable',
}

/** 分散安定性閾値 */
export interface StabilityThresholds {
  stableMax: number;    // default: 0.8
  moderateMax: number;  // default: 1.2
}

/** デフォルト閾値 */
export const DEFAULT_STABILITY_THRESHOLDS: StabilityThresholds = {
  stableMax: 0.8,
  moderateMax: 1.2,
};

/** 安定性レベル情報 */
export interface StabilityLevelInfo {
  level: StabilityLevel;
  label: string;
  description: string;
  color: string;
}

const STABILITY_LEVEL_INFO: Record<StabilityLevel, StabilityLevelInfo> = {
  [StabilityLevel.Stable]: {
    level: StabilityLevel.Stable,
    label: '安定',
    description: '安定した分散が期待できる',
    color: 'green',
  },
  [StabilityLevel.Moderate]: {
    level: StabilityLevel.Moderate,
    label: '中程度',
    description: '条件により安定性が変動する',
    color: 'yellow',
  },
  [StabilityLevel.Unstable]: {
    level: StabilityLevel.Unstable,
    label: '不安定',
    description: '凝集・沈降の可能性が高い',
    color: 'red',
  },
};

/**
 * RED値から分散安定性レベルを判定する
 */
export function classifyStability(
  red: number,
  thresholds: StabilityThresholds = DEFAULT_STABILITY_THRESHOLDS,
): StabilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.stableMax) return StabilityLevel.Stable;
  if (red < thresholds.moderateMax) return StabilityLevel.Moderate;
  return StabilityLevel.Unstable;
}

/**
 * 安定性レベルの表示情報を取得する
 */
export function getStabilityLevelInfo(level: StabilityLevel): StabilityLevelInfo {
  return STABILITY_LEVEL_INFO[level];
}

/** 顔料分散スクリーニング個別結果 */
export interface PigmentDispersionResult {
  vehicle: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  stability: StabilityLevel;
}

/**
 * 顔料に対するビヒクル群の分散安定性をスクリーニングする
 *
 * @param pigmentHSP - 顔料のHSP値
 * @param r0 - 顔料の相互作用半径
 * @param vehicles - ビヒクル（バインダー樹脂）リスト
 * @param thresholds - 安定性閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenPigmentDispersion(
  pigmentHSP: HSPValues,
  r0: number,
  vehicles: Array<{ name: string; hsp: HSPValues }>,
  thresholds: StabilityThresholds = DEFAULT_STABILITY_THRESHOLDS,
): PigmentDispersionResult[] {
  const results: PigmentDispersionResult[] = vehicles.map((vehicle) => {
    const ra = calculateRa(pigmentHSP, vehicle.hsp);
    const red = calculateRed(pigmentHSP, vehicle.hsp, r0);
    const stability = classifyStability(red, thresholds);
    return { vehicle: { name: vehicle.name, hsp: vehicle.hsp }, ra, red, stability };
  });

  // RED昇順ソート（安定→不安定の順）
  results.sort((a, b) => a.red - b.red);
  return results;
}
