/**
 * 経皮吸収促進剤選定
 *
 * 薬物-皮膚-促進剤の3成分系HSPマッチング。
 * 良い促進剤: 薬物と皮膚の両方にHSP的に近い（両方のRa²が小さい）。
 * スコア = √(Ra²(drug-enhancer) + Ra²(skin-enhancer)) で評価。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 促進剤適合性分類 */
export enum TransdermalEnhancerLevel {
  Excellent = 1, // 優秀（スコア < 5.0）
  Good = 2,      // 良好（5.0 ≤ スコア < 10.0）
  Fair = 3,      // 可能（10.0 ≤ スコア < 15.0）
  Poor = 4,      // 不良（スコア ≥ 15.0）
}

/** 促進剤選定閾値 */
export interface TransdermalThresholds {
  excellentMax: number; // default: 5.0
  goodMax: number;      // default: 10.0
  fairMax: number;      // default: 15.0
}

/** 促進剤入力 */
export interface EnhancerInput {
  name: string;
  hsp: HSPValues;
}

/** 経皮吸収促進剤評価結果 */
export interface TransdermalResult {
  enhancerName: string;
  enhancerHSP: HSPValues;
  raDrugEnhancer: number;
  raSkinEnhancer: number;
  compositeScore: number; // √(Ra²_drug-enhancer + Ra²_skin-enhancer)
  level: TransdermalEnhancerLevel;
}

/** 促進剤レベル表示情報 */
export interface TransdermalLevelInfo {
  level: TransdermalEnhancerLevel;
  label: string;
  description: string;
  color: string;
}

export const DEFAULT_TRANSDERMAL_THRESHOLDS: TransdermalThresholds = {
  excellentMax: 5.0,
  goodMax: 10.0,
  fairMax: 15.0,
};

const TRANSDERMAL_LEVEL_INFO: Record<TransdermalEnhancerLevel, TransdermalLevelInfo> = {
  [TransdermalEnhancerLevel.Excellent]: { level: TransdermalEnhancerLevel.Excellent, label: '優秀', description: '薬物と皮膚の両方に高い親和性', color: 'green' },
  [TransdermalEnhancerLevel.Good]: { level: TransdermalEnhancerLevel.Good, label: '良好', description: '良好な促進効果が期待できる', color: 'teal' },
  [TransdermalEnhancerLevel.Fair]: { level: TransdermalEnhancerLevel.Fair, label: '可能', description: '条件次第で使用可能', color: 'yellow' },
  [TransdermalEnhancerLevel.Poor]: { level: TransdermalEnhancerLevel.Poor, label: '不良', description: '促進効果が期待できない', color: 'red' },
};

/**
 * compositeScoreから促進剤適合性を分類
 */
export function classifyTransdermalEnhancer(
  compositeScore: number,
  thresholds: TransdermalThresholds = DEFAULT_TRANSDERMAL_THRESHOLDS
): TransdermalEnhancerLevel {
  if (compositeScore < 0) throw new Error('compositeScoreは非負でなければなりません');
  if (compositeScore < thresholds.excellentMax) return TransdermalEnhancerLevel.Excellent;
  if (compositeScore < thresholds.goodMax) return TransdermalEnhancerLevel.Good;
  if (compositeScore < thresholds.fairMax) return TransdermalEnhancerLevel.Fair;
  return TransdermalEnhancerLevel.Poor;
}

export function getTransdermalLevelInfo(level: TransdermalEnhancerLevel): TransdermalLevelInfo {
  return TRANSDERMAL_LEVEL_INFO[level];
}

/**
 * 経皮吸収促進剤をスクリーニング
 *
 * @param drugHSP - 薬物のHSP
 * @param skinHSP - 皮膚のHSP
 * @param enhancers - 促進剤候補リスト
 * @param thresholds - 閾値設定
 * @returns compositeScore昇順ソート（適合性が高い順）
 */
export function screenTransdermalEnhancers(
  drugHSP: HSPValues,
  skinHSP: HSPValues,
  enhancers: EnhancerInput[],
  thresholds: TransdermalThresholds = DEFAULT_TRANSDERMAL_THRESHOLDS
): TransdermalResult[] {
  const results: TransdermalResult[] = enhancers.map((enhancer) => {
    const raDrugEnhancer = calculateRa(drugHSP, enhancer.hsp);
    const raSkinEnhancer = calculateRa(skinHSP, enhancer.hsp);
    const compositeScore = Math.sqrt(
      raDrugEnhancer * raDrugEnhancer + raSkinEnhancer * raSkinEnhancer
    );
    const level = classifyTransdermalEnhancer(compositeScore, thresholds);
    return { enhancerName: enhancer.name, enhancerHSP: enhancer.hsp, raDrugEnhancer, raSkinEnhancer, compositeScore, level };
  });
  results.sort((a, b) => a.compositeScore - b.compositeScore);
  return results;
}
