/**
 * リポソーム膜透過性予測
 *
 * 薬物と脂質二重膜のHSP距離 → 受動膜透過の推定。
 * RED小 → 透過性高（脂質膜に分配しやすい）
 * RED大 → 透過性低
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 膜透過性分類 */
export enum PermeabilityLevel {
  HighPermeability = 1, // 高透過性（RED < 0.8）
  Moderate = 2,         // 中程度（0.8 ≤ RED < 1.2）
  LowPermeability = 3,  // 低透過性（RED ≥ 1.2）
}

/** 膜透過性閾値 */
export interface PermeabilityThresholds {
  highPermeabilityMax: number; // default: 0.8
  moderateMax: number;         // default: 1.2
}

/** 膜透過性評価結果 */
export interface PermeabilityResult {
  drugHSP: HSPValues;
  lipidHSP: HSPValues;
  ra: number;
  red: number;
  permeabilityLevel: PermeabilityLevel;
}

/** 膜透過性レベル表示情報 */
export interface PermeabilityLevelInfo {
  level: PermeabilityLevel;
  label: string;
  description: string;
  color: string;
}

export const DEFAULT_PERMEABILITY_THRESHOLDS: PermeabilityThresholds = {
  highPermeabilityMax: 0.8,
  moderateMax: 1.2,
};

const PERMEABILITY_LEVEL_INFO: Record<PermeabilityLevel, PermeabilityLevelInfo> = {
  [PermeabilityLevel.HighPermeability]: { level: PermeabilityLevel.HighPermeability, label: '高透過性', description: '脂質膜に分配しやすい', color: 'green' },
  [PermeabilityLevel.Moderate]: { level: PermeabilityLevel.Moderate, label: '中程度', description: '条件次第で透過可能', color: 'yellow' },
  [PermeabilityLevel.LowPermeability]: { level: PermeabilityLevel.LowPermeability, label: '低透過性', description: '脂質膜を透過しにくい', color: 'red' },
};

/**
 * RED値から膜透過性を分類
 */
export function classifyPermeability(red: number, thresholds: PermeabilityThresholds = DEFAULT_PERMEABILITY_THRESHOLDS): PermeabilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.highPermeabilityMax) return PermeabilityLevel.HighPermeability;
  if (red < thresholds.moderateMax) return PermeabilityLevel.Moderate;
  return PermeabilityLevel.LowPermeability;
}

export function getPermeabilityLevelInfo(level: PermeabilityLevel): PermeabilityLevelInfo {
  return PERMEABILITY_LEVEL_INFO[level];
}

/**
 * リポソーム膜透過性を評価
 *
 * @param drugHSP - 薬物のHSP
 * @param lipidBilayerHSP - 脂質二重膜のHSP
 * @param lipidR0 - 脂質膜の相互作用半径
 * @param thresholds - 閾値設定
 * @returns 膜透過性評価結果
 */
export function evaluateLiposomePermeability(
  drugHSP: HSPValues,
  lipidBilayerHSP: HSPValues,
  lipidR0: number,
  thresholds: PermeabilityThresholds = DEFAULT_PERMEABILITY_THRESHOLDS
): PermeabilityResult {
  const ra = calculateRa(drugHSP, lipidBilayerHSP);
  const red = calculateRed(drugHSP, lipidBilayerHSP, lipidR0);
  const permeabilityLevel = classifyPermeability(red, thresholds);
  return { drugHSP, lipidHSP: lipidBilayerHSP, ra, red, permeabilityLevel };
}

/** 薬物入力（バッチ評価用） */
export interface DrugPermeabilityInput {
  name: string;
  hsp: HSPValues;
}

/** バッチ膜透過性評価結果 */
export interface DrugPermeabilityResult {
  drugName: string;
  drugHSP: HSPValues;
  lipidHSP: HSPValues;
  ra: number;
  red: number;
  permeabilityLevel: PermeabilityLevel;
}

/**
 * 複数薬物のリポソーム膜透過性をバッチ評価
 *
 * @param drugs - 薬物リスト
 * @param lipidBilayerHSP - 脂質二重膜のHSP
 * @param lipidR0 - 脂質膜の相互作用半径
 * @param thresholds - 閾値設定
 * @returns RED昇順ソート（透過性が高い順）
 */
export function screenDrugPermeability(
  drugs: DrugPermeabilityInput[],
  lipidBilayerHSP: HSPValues,
  lipidR0: number,
  thresholds: PermeabilityThresholds = DEFAULT_PERMEABILITY_THRESHOLDS
): DrugPermeabilityResult[] {
  const results: DrugPermeabilityResult[] = drugs.map((drug) => {
    const ra = calculateRa(drug.hsp, lipidBilayerHSP);
    const red = calculateRed(drug.hsp, lipidBilayerHSP, lipidR0);
    const permeabilityLevel = classifyPermeability(red, thresholds);
    return { drugName: drug.name, drugHSP: drug.hsp, lipidHSP: lipidBilayerHSP, ra, red, permeabilityLevel };
  });
  results.sort((a, b) => a.red - b.red);
  return results;
}
