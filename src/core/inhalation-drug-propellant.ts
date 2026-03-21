/**
 * 吸入薬プロペラント適合性評価
 *
 * RED値に基づいて、薬物のプロペラント（噴射剤）中での製剤形態を評価する。
 * RED < 0.8: Solution（溶液型 — 薬物が完全に溶解）
 * 0.8 <= RED < 1.2: Suspension（懸濁型 — 微粒子分散）
 * RED >= 1.2: Unstable（不安定 — 凝集・沈降リスク）
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 製剤形態レベル */
export enum FormulationType {
  Solution = 'Solution',
  Suspension = 'Suspension',
  Unstable = 'Unstable',
}

/** 製剤形態閾値 */
export interface FormulationThresholds {
  solutionMax: number;    // default: 0.8
  suspensionMax: number;  // default: 1.2
}

/** デフォルト閾値 */
export const DEFAULT_FORMULATION_THRESHOLDS: FormulationThresholds = {
  solutionMax: 0.8,
  suspensionMax: 1.2,
};

/** 製剤形態レベル情報 */
export interface FormulationLevelInfo {
  level: FormulationType;
  label: string;
  description: string;
  color: string;
}

const FORMULATION_LEVEL_INFO: Record<FormulationType, FormulationLevelInfo> = {
  [FormulationType.Solution]: {
    level: FormulationType.Solution,
    label: '溶液型',
    description: '薬物がプロペラントに完全溶解',
    color: 'green',
  },
  [FormulationType.Suspension]: {
    level: FormulationType.Suspension,
    label: '懸濁型',
    description: '微粒子として分散（MDI懸濁製剤）',
    color: 'yellow',
  },
  [FormulationType.Unstable]: {
    level: FormulationType.Unstable,
    label: '不安定',
    description: '凝集・沈降リスクが高い',
    color: 'red',
  },
};

/**
 * RED値から製剤形態を判定する
 */
export function classifyFormulation(
  red: number,
  thresholds: FormulationThresholds = DEFAULT_FORMULATION_THRESHOLDS,
): FormulationType {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.solutionMax) return FormulationType.Solution;
  if (red < thresholds.suspensionMax) return FormulationType.Suspension;
  return FormulationType.Unstable;
}

/**
 * 製剤形態レベルの表示情報を取得する
 */
export function getFormulationLevelInfo(level: FormulationType): FormulationLevelInfo {
  return FORMULATION_LEVEL_INFO[level];
}

/** 吸入薬適合性評価結果 */
export interface InhalationCompatibilityResult {
  drugHSP: HSPValues;
  propellantHSP: HSPValues;
  ra: number;
  red: number;
  formulation: FormulationType;
  evaluatedAt: Date;
}

/**
 * 薬物のプロペラント中での製剤形態を評価する
 *
 * @param drugHSP - 薬物のHSP値
 * @param propellantHSP - プロペラントのHSP値
 * @param propellantR0 - プロペラントの相互作用半径
 * @param thresholds - 製剤形態閾値（省略時デフォルト）
 * @returns 適合性評価結果
 */
export function evaluateInhalationCompatibility(
  drugHSP: HSPValues,
  propellantHSP: HSPValues,
  propellantR0: number,
  thresholds: FormulationThresholds = DEFAULT_FORMULATION_THRESHOLDS,
): InhalationCompatibilityResult {
  const ra = calculateRa(drugHSP, propellantHSP);
  const red = calculateRed(drugHSP, propellantHSP, propellantR0);
  const formulation = classifyFormulation(red, thresholds);

  return {
    drugHSP,
    propellantHSP,
    ra,
    red,
    formulation,
    evaluatedAt: new Date(),
  };
}
