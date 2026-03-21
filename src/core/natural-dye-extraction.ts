/**
 * 天然色素抽出最適化
 *
 * RED値に基づいて、天然色素の溶媒抽出効率を評価する。
 * RED < 0.7: Excellent（高抽出効率）
 * 0.7 <= RED < 1.0: Good（良好）
 * RED >= 1.0: Low（低抽出効率）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 抽出効率レベル */
export enum ExtractionLevel {
  Excellent = 'Excellent',
  Good = 'Good',
  Low = 'Low',
}

/** 抽出効率閾値 */
export interface ExtractionThresholds {
  excellentMax: number;  // default: 0.7
  goodMax: number;       // default: 1.0
}

/** デフォルト閾値 */
export const DEFAULT_EXTRACTION_THRESHOLDS: ExtractionThresholds = {
  excellentMax: 0.7,
  goodMax: 1.0,
};

/** 抽出効率レベル情報 */
export interface ExtractionLevelInfo {
  level: ExtractionLevel;
  label: string;
  description: string;
  color: string;
}

const EXTRACTION_LEVEL_INFO: Record<ExtractionLevel, ExtractionLevelInfo> = {
  [ExtractionLevel.Excellent]: {
    level: ExtractionLevel.Excellent,
    label: '優秀',
    description: '高い抽出効率が期待できる',
    color: 'green',
  },
  [ExtractionLevel.Good]: {
    level: ExtractionLevel.Good,
    label: '良好',
    description: '十分な抽出効率',
    color: 'blue',
  },
  [ExtractionLevel.Low]: {
    level: ExtractionLevel.Low,
    label: '低効率',
    description: '抽出効率が低い',
    color: 'red',
  },
};

/**
 * RED値から抽出効率レベルを判定する
 */
export function classifyExtraction(
  red: number,
  thresholds: ExtractionThresholds = DEFAULT_EXTRACTION_THRESHOLDS,
): ExtractionLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.excellentMax) return ExtractionLevel.Excellent;
  if (red < thresholds.goodMax) return ExtractionLevel.Good;
  return ExtractionLevel.Low;
}

/**
 * 抽出効率レベルの表示情報を取得する
 */
export function getExtractionLevelInfo(level: ExtractionLevel): ExtractionLevelInfo {
  return EXTRACTION_LEVEL_INFO[level];
}

/** 色素抽出スクリーニング個別結果 */
export interface DyeExtractionResult {
  solvent: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  extractionLevel: ExtractionLevel;
}

/**
 * 天然色素に対する抽出溶媒をスクリーニングする
 *
 * @param dyeHSP - 天然色素のHSP値
 * @param dyeR0 - 天然色素の相互作用半径
 * @param solvents - 候補溶媒リスト
 * @param thresholds - 抽出効率閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenDyeExtractionSolvents(
  dyeHSP: HSPValues,
  dyeR0: number,
  solvents: Array<{ name: string; hsp: HSPValues }>,
  thresholds: ExtractionThresholds = DEFAULT_EXTRACTION_THRESHOLDS,
): DyeExtractionResult[] {
  const results: DyeExtractionResult[] = solvents.map((solvent) => {
    const ra = calculateRa(dyeHSP, solvent.hsp);
    const red = calculateRed(dyeHSP, solvent.hsp, dyeR0);
    const extractionLevel = classifyExtraction(red, thresholds);
    return { solvent: { name: solvent.name, hsp: solvent.hsp }, ra, red, extractionLevel };
  });

  results.sort((a, b) => a.red - b.red);
  return results;
}
