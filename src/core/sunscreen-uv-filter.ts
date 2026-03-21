/**
 * 日焼け止めUVフィルター適合性評価
 *
 * RED値に基づいて、UVフィルター（紫外線吸収剤）のビヒクル（基剤）中での溶解性を評価する。
 * RED < 0.7: Excellent（優秀な溶解性、SPF確保に最適）
 * 0.7 <= RED < 1.0: Good（良好、実用可能）
 * RED >= 1.0: Poor（結晶析出リスクあり）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** UVフィルター溶解性レベル */
export enum SolubilityLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Poor = 'Poor',
}

/** 溶解性閾値 */
export interface SolubilityThresholds {
  excellentMax: number;  // default: 0.7
  goodMax: number;       // default: 1.0
}

/** デフォルト閾値 */
export const DEFAULT_SOLUBILITY_THRESHOLDS: SolubilityThresholds = {
  excellentMax: 0.7,
  goodMax: 1.0,
};

/** 溶解性レベル情報 */
export interface SolubilityLevelInfo {
  level: SolubilityLevel;
  label: string;
  description: string;
  color: string;
}

const SOLUBILITY_LEVEL_INFO: Record<SolubilityLevel, SolubilityLevelInfo> = {
  [SolubilityLevel.Excellent]: {
    level: SolubilityLevel.Excellent,
    label: '優秀',
    description: 'SPF確保に最適な溶解性',
    color: 'green',
  },
  [SolubilityLevel.Good]: {
    level: SolubilityLevel.Good,
    label: '良好',
    description: '実用可能な溶解性',
    color: 'yellow',
  },
  [SolubilityLevel.Poor]: {
    level: SolubilityLevel.Poor,
    label: '不良',
    description: '結晶析出リスクあり',
    color: 'red',
  },
};

/**
 * RED値からUVフィルター溶解性レベルを判定する
 */
export function classifySolubility(
  red: number,
  thresholds: SolubilityThresholds = DEFAULT_SOLUBILITY_THRESHOLDS,
): SolubilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return SolubilityLevel.Excellent;
  if (red < thresholds.goodMax) return SolubilityLevel.Good;
  return SolubilityLevel.Poor;
}

/**
 * 溶解性レベルの表示情報を取得する
 */
export function getSolubilityLevelInfo(level: SolubilityLevel): SolubilityLevelInfo {
  return SOLUBILITY_LEVEL_INFO[level];
}

/** UVフィルタースクリーニング個別結果 */
export interface UVFilterResult {
  uvFilter: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  solubility: SolubilityLevel;
}

/**
 * ビヒクル（基剤）に対するUVフィルター群の溶解性をスクリーニングする
 *
 * @param vehicleHSP - ビヒクルのHSP値
 * @param vehicleR0 - ビヒクルの相互作用半径
 * @param uvFilters - UVフィルターリスト
 * @param thresholds - 溶解性閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenUVFilterCompatibility(
  vehicleHSP: HSPValues,
  vehicleR0: number,
  uvFilters: Array<{ name: string; hsp: HSPValues }>,
  thresholds: SolubilityThresholds = DEFAULT_SOLUBILITY_THRESHOLDS,
): UVFilterResult[] {
  const results: UVFilterResult[] = uvFilters.map((uvFilter) => {
    const ra = calculateRa(vehicleHSP, uvFilter.hsp);
    const red = calculateRed(vehicleHSP, uvFilter.hsp, vehicleR0);
    const solubility = classifySolubility(red, thresholds);
    return { uvFilter: { name: uvFilter.name, hsp: uvFilter.hsp }, ra, red, solubility };
  });

  // RED昇順ソート（溶解しやすい→析出リスクの順）
  results.sort((a, b) => a.red - b.red);
  return results;
}
