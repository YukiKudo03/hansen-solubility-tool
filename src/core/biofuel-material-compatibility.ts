/**
 * バイオ燃料材料適合性評価
 *
 * RED小 → 膨潤/劣化リスク高, RED大 → 安全
 * chemical-resistance と同じ「RED大=良好」方向。
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 適合性レベル (1=危険, 5=安全) */
export enum BiofuelCompatibilityLevel {
  Dangerous = 1,  // RED < 0.5 — 膨潤/溶解リスク高
  Warning = 2,    // 0.5 ≤ RED < 0.8
  Caution = 3,    // 0.8 ≤ RED < 1.2
  Good = 4,       // 1.2 ≤ RED < 2.0
  Safe = 5,       // RED ≥ 2.0
}

export interface BiofuelCompatibilityThresholds {
  dangerousMax: number; // default: 0.5
  warningMax: number;   // default: 0.8
  cautionMax: number;   // default: 1.2
  goodMax: number;      // default: 2.0
}

export const DEFAULT_BIOFUEL_THRESHOLDS: BiofuelCompatibilityThresholds = {
  dangerousMax: 0.5,
  warningMax: 0.8,
  cautionMax: 1.2,
  goodMax: 2.0,
};

export interface MaterialInput {
  name: string;
  hsp: HSPValues;
}

export interface BiofuelCompatibilityResult {
  materialName: string;
  materialHSP: HSPValues;
  ra: number;
  red: number;
  level: BiofuelCompatibilityLevel;
}

export interface BiofuelCompatibilityLevelInfo {
  level: BiofuelCompatibilityLevel;
  label: string;
  description: string;
  color: string;
}

const LEVEL_INFO: Record<BiofuelCompatibilityLevel, BiofuelCompatibilityLevelInfo> = {
  [BiofuelCompatibilityLevel.Dangerous]: { level: BiofuelCompatibilityLevel.Dangerous, label: '危険', description: '膨潤/溶解リスクが高い', color: 'red' },
  [BiofuelCompatibilityLevel.Warning]: { level: BiofuelCompatibilityLevel.Warning, label: '要警戒', description: '劣化の可能性あり', color: 'orange' },
  [BiofuelCompatibilityLevel.Caution]: { level: BiofuelCompatibilityLevel.Caution, label: '要注意', description: '長期使用に注意', color: 'yellow' },
  [BiofuelCompatibilityLevel.Good]: { level: BiofuelCompatibilityLevel.Good, label: '良好', description: '長期使用に耐える', color: 'teal' },
  [BiofuelCompatibilityLevel.Safe]: { level: BiofuelCompatibilityLevel.Safe, label: '安全', description: '優れた耐性', color: 'green' },
};

export function getBiofuelCompatibilityLevelInfo(level: BiofuelCompatibilityLevel): BiofuelCompatibilityLevelInfo {
  return LEVEL_INFO[level];
}

export function classifyBiofuelCompatibility(
  red: number,
  thresholds: BiofuelCompatibilityThresholds = DEFAULT_BIOFUEL_THRESHOLDS,
): BiofuelCompatibilityLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.dangerousMax) return BiofuelCompatibilityLevel.Dangerous;
  if (red < thresholds.warningMax) return BiofuelCompatibilityLevel.Warning;
  if (red < thresholds.cautionMax) return BiofuelCompatibilityLevel.Caution;
  if (red < thresholds.goodMax) return BiofuelCompatibilityLevel.Good;
  return BiofuelCompatibilityLevel.Safe;
}

/**
 * バイオ燃料に対する材料適合性スクリーニング
 *
 * @param fuelBlendHSP - 燃料ブレンドのHSP
 * @param fuelR0 - 燃料の相互作用半径
 * @param materials - 候補材料リスト
 * @returns RED降順ソート（安全な順）
 */
export function screenBiofuelCompatibility(
  fuelBlendHSP: HSPValues,
  fuelR0: number,
  materials: MaterialInput[],
  thresholds: BiofuelCompatibilityThresholds = DEFAULT_BIOFUEL_THRESHOLDS,
): BiofuelCompatibilityResult[] {
  const results: BiofuelCompatibilityResult[] = materials.map((m) => {
    const ra = calculateRa(fuelBlendHSP, m.hsp);
    const red = calculateRed(fuelBlendHSP, m.hsp, fuelR0);
    const level = classifyBiofuelCompatibility(red, thresholds);
    return { materialName: m.name, materialHSP: m.hsp, ra, red, level };
  });
  // RED降順（安全な順）
  results.sort((a, b) => b.red - a.red);
  return results;
}
