/**
 * 添加剤移行予測 — ポリマーと添加剤間のRED値に基づく移行リスク評価
 *
 * RED値が小さい = 相溶性高い = 添加剤がポリマー内に留まりやすい = Stable
 * RED値が大きい = 相溶性低い = 添加剤が移行しやすい = High
 */
import { calculateRa, calculateRed } from './hsp';
import type { Part, Solvent, HSPValues } from './types';

/** 移行リスクレベル */
export enum MigrationLevel {
  Stable = 'Stable',     // 安定（移行しにくい）
  Moderate = 'Moderate',  // 中程度の移行リスク
  High = 'High',          // 高い移行リスク
}

/** 移行リスク閾値 (RED値ベース) */
export interface MigrationThresholds {
  stableMax: number;   // default: 0.8 — RED ≤ stableMax → Stable
  moderateMax: number; // default: 1.2 — RED ≤ moderateMax → Moderate, else High
}

export const DEFAULT_MIGRATION_THRESHOLDS: MigrationThresholds = {
  stableMax: 0.8,
  moderateMax: 1.2,
};

/** 移行リスク分類 */
export function classifyMigration(red: number, thresholds: MigrationThresholds): MigrationLevel {
  if (red <= thresholds.stableMax) return MigrationLevel.Stable;
  if (red <= thresholds.moderateMax) return MigrationLevel.Moderate;
  return MigrationLevel.High;
}

/** 個別スクリーニング結果 */
export interface AdditiveMigrationResult {
  additive: Solvent;
  polymer: Part;
  ra: number;
  red: number;
  migrationLevel: MigrationLevel;
}

/** 全体スクリーニング結果 */
export interface AdditiveMigrationEvaluationResult {
  polymer: Part;
  results: AdditiveMigrationResult[];
  evaluatedAt: Date;
  thresholdsUsed: MigrationThresholds;
}

/** 全添加剤（溶媒テーブル利用）をスクリーニング */
export function screenAdditiveMigration(
  polymer: Part,
  additives: Solvent[],
  thresholds: MigrationThresholds,
): AdditiveMigrationEvaluationResult {
  const results: AdditiveMigrationResult[] = additives.map((additive) => {
    const ra = calculateRa(polymer.hsp, additive.hsp);
    const red = calculateRed(polymer.hsp, additive.hsp, polymer.r0);
    const migrationLevel = classifyMigration(red, thresholds);
    return { additive, polymer, ra, red, migrationLevel };
  });

  // RED昇順（安定な順）
  results.sort((a, b) => a.red - b.red);

  return {
    polymer,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}

/** レベル情報取得 */
export function getMigrationLevelInfo(level: MigrationLevel): { label: string; description: string } {
  switch (level) {
    case MigrationLevel.Stable: return { label: 'Stable', description: '安定（移行しにくい）' };
    case MigrationLevel.Moderate: return { label: 'Moderate', description: '中程度の移行リスク' };
    case MigrationLevel.High: return { label: 'High', description: '高い移行リスク' };
  }
}
