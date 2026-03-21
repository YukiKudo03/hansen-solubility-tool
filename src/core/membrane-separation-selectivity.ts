/**
 * NL10-2: 膜分離選択性評価
 *
 * 2つのガス/液体成分間の透過選択性を評価する。
 * selectivity = Ra²(impurity) / Ra²(target)
 * 大きいほどターゲットが選択的に透過する。
 *
 * 参考文献:
 * - Robeson (2008) J. Membr. Sci. 320:390-400
 */

import type { HSPValues } from './types';
import { calculateRa } from './hsp';

/** 膜分離選択性結果 */
export interface SeparationSelectivityResult {
  membraneHSP: HSPValues;
  targetName: string;
  targetHSP: HSPValues;
  targetRa: number;
  targetRa2: number;
  impurityName: string;
  impurityHSP: HSPValues;
  impurityRa: number;
  impurityRa2: number;
  selectivityRatio: number; // Ra²(impurity) / Ra²(target)
  selectivityLevel: SelectivityLevel;
  evaluatedAt: Date;
}

/** 選択性レベル */
export enum SelectivityLevel {
  Excellent = 1, // 非常に高い選択性
  Good = 2,      // 良好な選択性
  Moderate = 3,  // 中程度
  Poor = 4,      // 低い選択性
}

/** 選択性レベル情報 */
export function getSelectivityLevelInfo(level: SelectivityLevel): { label: string; description: string } {
  switch (level) {
    case SelectivityLevel.Excellent: return { label: '非常に高い', description: '優れた分離選択性' };
    case SelectivityLevel.Good: return { label: '良好', description: '良好な分離選択性' };
    case SelectivityLevel.Moderate: return { label: '中程度', description: '中程度の分離選択性' };
    case SelectivityLevel.Poor: return { label: '低い', description: '分離選択性が低い' };
  }
}

/** 選択性比から選択性レベルを分類 */
export function classifySelectivity(ratio: number): SelectivityLevel {
  if (ratio >= 5.0) return SelectivityLevel.Excellent;
  if (ratio >= 2.0) return SelectivityLevel.Good;
  if (ratio >= 1.2) return SelectivityLevel.Moderate;
  return SelectivityLevel.Poor;
}

/**
 * 膜分離選択性を評価する
 *
 * @param membraneHSP - 膜材料のHSP値
 * @param targetHSP - ターゲット成分のHSP値
 * @param targetName - ターゲット成分名
 * @param impurityHSP - 不純物/排除成分のHSP値
 * @param impurityName - 不純物名
 * @returns 選択性評価結果
 */
export function evaluateSeparationSelectivity(
  membraneHSP: HSPValues,
  targetHSP: HSPValues,
  targetName: string,
  impurityHSP: HSPValues,
  impurityName: string,
): SeparationSelectivityResult {
  const targetRa = calculateRa(membraneHSP, targetHSP);
  const impurityRa = calculateRa(membraneHSP, impurityHSP);
  const targetRa2 = targetRa * targetRa;
  const impurityRa2 = impurityRa * impurityRa;

  // selectivity = Ra²(impurity) / Ra²(target)
  // 大きいほどターゲットが選択的に透過する
  const selectivityRatio = targetRa2 > 0 ? impurityRa2 / targetRa2 : Infinity;
  const selectivityLevel = classifySelectivity(selectivityRatio);

  return {
    membraneHSP,
    targetName,
    targetHSP,
    targetRa,
    targetRa2,
    impurityName,
    impurityHSP,
    impurityRa,
    impurityRa2,
    selectivityRatio,
    selectivityLevel,
    evaluatedAt: new Date(),
  };
}
