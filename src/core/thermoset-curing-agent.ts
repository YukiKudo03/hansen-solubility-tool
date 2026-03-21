/**
 * 熱硬化性樹脂硬化剤選定
 *
 * RED値（Ra/R0）が小さい硬化剤 → 樹脂との混合均一性が高い → 良い硬化剤候補
 *
 * CuringCompatibility: Excellent / Good / Moderate / Poor
 *
 * 参考文献:
 * - Hansen (2007) "Hansen Solubility Parameters: A User's Handbook" 2nd ed.
 * - Redelius (2004) Progress in Organic Coatings 51:77
 */

import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 硬化剤情報 */
export interface CuringAgent {
  name: string;
  hsp: HSPValues;
}

/** 硬化剤適合性レベル */
export type CuringCompatibility = 'Excellent' | 'Good' | 'Moderate' | 'Poor';

/** 硬化剤適合性情報 */
export interface CuringCompatibilityInfo {
  level: CuringCompatibility;
  label: string;
  description: string;
}

const CURING_COMPATIBILITY_INFO: Record<CuringCompatibility, CuringCompatibilityInfo> = {
  Excellent: {
    level: 'Excellent',
    label: '最適',
    description: '混合均一性が高く、優れた硬化特性が期待できる',
  },
  Good: {
    level: 'Good',
    label: '良好',
    description: '良好な混合均一性が得られる',
  },
  Moderate: {
    level: 'Moderate',
    label: '中程度',
    description: '混合時にやや不均一になる可能性がある',
  },
  Poor: {
    level: 'Poor',
    label: '不良',
    description: '混合が困難で均一な硬化が期待できない',
  },
};

/** 硬化剤スクリーニング結果（個別） */
export interface CuringAgentResult {
  agent: CuringAgent;
  ra: number;
  red: number;
  compatibility: CuringCompatibility;
}

/**
 * 硬化剤適合性情報を取得する
 */
export function getCuringCompatibilityInfo(level: CuringCompatibility): CuringCompatibilityInfo {
  return CURING_COMPATIBILITY_INFO[level];
}

/**
 * RED値から硬化剤適合性を判定する
 */
function classifyCuringCompatibility(red: number): CuringCompatibility {
  if (red <= 0.5) return 'Excellent';
  if (red <= 0.8) return 'Good';
  if (red <= 1.0) return 'Moderate';
  return 'Poor';
}

/**
 * 硬化剤候補をスクリーニングする
 *
 * @param resinHSP - 樹脂のHSP [MPa^0.5]
 * @param resinR0 - 樹脂の相互作用半径
 * @param agents - 硬化剤候補リスト
 * @returns 硬化剤スクリーニング結果（RED昇順）
 */
export function screenCuringAgents(
  resinHSP: HSPValues,
  resinR0: number,
  agents: CuringAgent[],
): CuringAgentResult[] {
  if (resinR0 <= 0) throw new Error('Interaction radius (R0) must be positive');
  if (agents.length === 0) throw new Error('At least one curing agent is required');

  const results: CuringAgentResult[] = agents.map((agent) => {
    const ra = calculateRa(resinHSP, agent.hsp);
    const red = calculateRed(resinHSP, agent.hsp, resinR0);
    const compatibility = classifyCuringCompatibility(red);

    return {
      agent,
      ra,
      red,
      compatibility,
    };
  });

  // RED昇順でソート（最適な候補が先頭）
  results.sort((a, b) => a.red - b.red);

  return results;
}
