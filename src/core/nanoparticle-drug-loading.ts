/**
 * ナノ粒子薬物ローディング評価
 *
 * ナノ粒子キャリア（例: PLGA）に対する薬物のローディング適合性をHSP距離で評価。
 * RED < 0.7: High（高ローディング）
 * 0.7 <= RED < 1.0: Medium（中程度）
 * RED >= 1.0: Low（低ローディング）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 薬物ローディングレベル */
export enum LoadingLevel {
  High = 'High',
  Medium = 'Medium',
  Low = 'Low',
}

/** ローディング閾値 */
export interface LoadingThresholds {
  highMax: number;    // default: 0.7
  mediumMax: number;  // default: 1.0
}

/** デフォルト閾値 */
export const DEFAULT_LOADING_THRESHOLDS: LoadingThresholds = {
  highMax: 0.7,
  mediumMax: 1.0,
};

/** ローディングレベル情報 */
export interface LoadingLevelInfo {
  level: LoadingLevel;
  label: string;
  description: string;
  color: string;
}

const LOADING_LEVEL_INFO: Record<LoadingLevel, LoadingLevelInfo> = {
  [LoadingLevel.High]: {
    level: LoadingLevel.High,
    label: '高',
    description: '高い薬物搭載効率が期待できる',
    color: 'green',
  },
  [LoadingLevel.Medium]: {
    level: LoadingLevel.Medium,
    label: '中',
    description: '中程度の薬物搭載効率',
    color: 'yellow',
  },
  [LoadingLevel.Low]: {
    level: LoadingLevel.Low,
    label: '低',
    description: '薬物搭載効率が低い',
    color: 'red',
  },
};

/**
 * RED値から薬物ローディングレベルを判定する
 */
export function classifyLoading(
  red: number,
  thresholds: LoadingThresholds = DEFAULT_LOADING_THRESHOLDS,
): LoadingLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.highMax) return LoadingLevel.High;
  if (red < thresholds.mediumMax) return LoadingLevel.Medium;
  return LoadingLevel.Low;
}

/**
 * ローディングレベルの表示情報を取得する
 */
export function getLoadingLevelInfo(level: LoadingLevel): LoadingLevelInfo {
  return LOADING_LEVEL_INFO[level];
}

/** 薬物ローディングスクリーニング個別結果 */
export interface DrugLoadingResult {
  drug: { name: string; hsp: HSPValues };
  ra: number;
  red: number;
  loadingLevel: LoadingLevel;
}

/**
 * キャリアに対する薬物群のローディング適合性をスクリーニングする
 *
 * @param carrierHSP - キャリアのHSP値
 * @param carrierR0 - キャリアの相互作用半径
 * @param drugs - 薬物リスト
 * @param thresholds - ローディング閾値（省略時デフォルト）
 * @returns スクリーニング結果（RED昇順ソート済み）
 */
export function screenDrugLoading(
  carrierHSP: HSPValues,
  carrierR0: number,
  drugs: Array<{ name: string; hsp: HSPValues }>,
  thresholds: LoadingThresholds = DEFAULT_LOADING_THRESHOLDS,
): DrugLoadingResult[] {
  const results: DrugLoadingResult[] = drugs.map((drug) => {
    const ra = calculateRa(carrierHSP, drug.hsp);
    const red = calculateRed(carrierHSP, drug.hsp, carrierR0);
    const loadingLevel = classifyLoading(red, thresholds);
    return { drug: { name: drug.name, hsp: drug.hsp }, ra, red, loadingLevel };
  });

  // RED昇順ソート
  results.sort((a, b) => a.red - b.red);
  return results;
}
