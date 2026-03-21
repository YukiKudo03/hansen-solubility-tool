/**
 * 香料カプセル化適合性
 *
 * 壁材ポリマーと香料のHSP距離 → カプセル化の安定性を予測。
 * RED大 → カプセル化安定（壁材が香料を透過させない）
 * RED小 → カプセル化不安定
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** カプセル化適合性分類 */
export enum EncapsulationLevel {
  Poor = 1,      // 不良（RED < 1.0）— 壁材が香料を透過しやすい
  Good = 2,      // 良好（1.0 ≤ RED < 1.5）
  Excellent = 3, // 優秀（RED ≥ 1.5）— 壁材が香料を強く閉じ込める
}

/** カプセル化閾値 */
export interface EncapsulationThresholds {
  poorMax: number; // default: 1.0
  goodMax: number; // default: 1.5
}

/** 香料入力 */
export interface FragranceInput {
  name: string;
  hsp: HSPValues;
}

/** カプセル化評価結果 */
export interface EncapsulationResult {
  fragranceName: string;
  fragranceHSP: HSPValues;
  ra: number;
  red: number;
  encapsulationLevel: EncapsulationLevel;
}

/** カプセル化レベル表示情報 */
export interface EncapsulationLevelInfo {
  level: EncapsulationLevel;
  label: string;
  description: string;
  color: string;
}

export const DEFAULT_ENCAPSULATION_THRESHOLDS: EncapsulationThresholds = {
  poorMax: 1.0,
  goodMax: 1.5,
};

const ENCAPSULATION_LEVEL_INFO: Record<EncapsulationLevel, EncapsulationLevelInfo> = {
  [EncapsulationLevel.Poor]: { level: EncapsulationLevel.Poor, label: '不良', description: '壁材が香料を透過しやすい', color: 'red' },
  [EncapsulationLevel.Good]: { level: EncapsulationLevel.Good, label: '良好', description: 'カプセル化がある程度安定', color: 'yellow' },
  [EncapsulationLevel.Excellent]: { level: EncapsulationLevel.Excellent, label: '優秀', description: '壁材が香料を強く閉じ込める', color: 'green' },
};

/**
 * RED値からカプセル化適合性を分類
 * 注意: RED大ほど良好（他の多くのパイプラインと逆方向）
 */
export function classifyEncapsulation(red: number, thresholds: EncapsulationThresholds = DEFAULT_ENCAPSULATION_THRESHOLDS): EncapsulationLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.poorMax) return EncapsulationLevel.Poor;
  if (red < thresholds.goodMax) return EncapsulationLevel.Good;
  return EncapsulationLevel.Excellent;
}

export function getEncapsulationLevelInfo(level: EncapsulationLevel): EncapsulationLevelInfo {
  return ENCAPSULATION_LEVEL_INFO[level];
}

/**
 * 香料カプセル化適合性をスクリーニング
 *
 * @param wallMaterialHSP - 壁材のHSP
 * @param wallR0 - 壁材の相互作用半径
 * @param fragrances - 香料リスト
 * @param thresholds - 閾値設定
 * @returns RED降順ソート（カプセル化適合性が高い順）
 */
export function screenFragranceEncapsulation(
  wallMaterialHSP: HSPValues,
  wallR0: number,
  fragrances: FragranceInput[],
  thresholds: EncapsulationThresholds = DEFAULT_ENCAPSULATION_THRESHOLDS
): EncapsulationResult[] {
  const results: EncapsulationResult[] = fragrances.map((fragrance) => {
    const ra = calculateRa(wallMaterialHSP, fragrance.hsp);
    const red = calculateRed(wallMaterialHSP, fragrance.hsp, wallR0);
    const encapsulationLevel = classifyEncapsulation(red, thresholds);
    return { fragranceName: fragrance.name, fragranceHSP: fragrance.hsp, ra, red, encapsulationLevel };
  });
  // RED降順（カプセル化適合性が高い順）
  results.sort((a, b) => b.red - a.red);
  return results;
}
