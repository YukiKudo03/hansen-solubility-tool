/**
 * 洗浄剤配合設計
 *
 * RED値に基づいて、汚れ（soil）に対する洗浄溶媒の効果を評価する。
 * RED < 0.6: Excellent（洗浄効果高）
 * 0.6 <= RED < 1.0: Good（良好）
 * 1.0 <= RED < 1.5: Moderate（中程度）
 * RED >= 1.5: Poor（効果なし）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 洗浄効果レベル */
export enum CleaningLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Moderate = 'Moderate',
  Poor = 'Poor',
}

/** 洗浄効果閾値 */
export interface CleaningThresholds {
  excellentMax: number;  // default: 0.6
  goodMax: number;       // default: 1.0
  moderateMax: number;   // default: 1.5
}

/** デフォルト閾値 */
export const DEFAULT_CLEANING_THRESHOLDS: CleaningThresholds = {
  excellentMax: 0.6,
  goodMax: 1.0,
  moderateMax: 1.5,
};

/** 洗浄効果レベル情報 */
export interface CleaningLevelInfo {
  level: CleaningLevel;
  label: string;
  description: string;
  color: string;
}

const CLEANING_LEVEL_INFO: Record<CleaningLevel, CleaningLevelInfo> = {
  [CleaningLevel.Excellent]: {
    level: CleaningLevel.Excellent,
    label: '優秀',
    description: '非常に高い洗浄効果',
    color: 'green',
  },
  [CleaningLevel.Good]: {
    level: CleaningLevel.Good,
    label: '良好',
    description: '十分な洗浄効果',
    color: 'blue',
  },
  [CleaningLevel.Moderate]: {
    level: CleaningLevel.Moderate,
    label: '中程度',
    description: '部分的な洗浄効果',
    color: 'yellow',
  },
  [CleaningLevel.Poor]: {
    level: CleaningLevel.Poor,
    label: '不良',
    description: '洗浄効果が期待できない',
    color: 'red',
  },
};

/**
 * RED値から洗浄効果レベルを判定する
 */
export function classifyCleaning(
  red: number,
  thresholds: CleaningThresholds = DEFAULT_CLEANING_THRESHOLDS,
): CleaningLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return CleaningLevel.Excellent;
  if (red < thresholds.goodMax) return CleaningLevel.Good;
  if (red < thresholds.moderateMax) return CleaningLevel.Moderate;
  return CleaningLevel.Poor;
}

/**
 * 洗浄効果レベルの表示情報を取得する
 */
export function getCleaningLevelInfo(level: CleaningLevel): CleaningLevelInfo {
  return CLEANING_LEVEL_INFO[level];
}

/** 洗浄溶媒スクリーニング個別結果 */
export interface CleaningScreeningResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  cleaningLevel: CleaningLevel;
}

/**
 * 汚れ（soil）に対する洗浄溶媒をスクリーニングする
 *
 * @param soilHSP - 汚れのHSP値
 * @param soilR0 - 汚れの相互作用半径
 * @param solvents - 候補洗浄溶媒リスト
 * @param thresholds - 洗浄効果閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenCleaningSolvents(
  soilHSP: HSPValues,
  soilR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: CleaningThresholds = DEFAULT_CLEANING_THRESHOLDS,
): CleaningScreeningResult[] {
  const results: CleaningScreeningResult[] = solvents.map((solvent) => {
    const ra = calculateRa(soilHSP, solvent.hsp);
    const red = calculateRed(soilHSP, solvent.hsp, soilR0);
    const cleaningLevel = classifyCleaning(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, cleaningLevel };
  });

  // RED昇順ソート（洗浄効果高い順）
  results.sort((a, b) => a.red - b.red);
  return results;
}
