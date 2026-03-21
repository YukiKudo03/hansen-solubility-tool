/**
 * ポリマー添加剤移行/ブルーミング予測
 *
 * 添加剤（安定剤、難燃剤等）とポリマーのHSP距離から移行速度・ブルーミング傾向を予測。
 * Ra²が小さい → 添加剤がポリマー中に留まる(低移行)
 * Ra²が大きい → 移行/ブルーミングしやすい
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 移行リスク分類 */
export enum MigrationLevel {
  Stable = 1,            // 安定（RED < 0.8）
  ModerateMigration = 2, // 中程度の移行リスク（0.8 ≤ RED < 1.2）
  HighMigration = 3,     // 高移行リスク（RED ≥ 1.2）
}

/** 移行リスク閾値 */
export interface MigrationThresholds {
  stableMax: number;           // default: 0.8
  moderateMigrationMax: number; // default: 1.2
}

/** 添加剤入力 */
export interface AdditiveInput {
  name: string;
  hsp: HSPValues;
}

/** 移行リスク評価結果 */
export interface MigrationResult {
  additiveName: string;
  additiveHSP: HSPValues;
  ra: number;
  red: number;
  migrationLevel: MigrationLevel;
}

/** 移行レベル表示情報 */
export interface MigrationLevelInfo {
  level: MigrationLevel;
  label: string;
  description: string;
  color: string;
}

export const DEFAULT_MIGRATION_THRESHOLDS: MigrationThresholds = {
  stableMax: 0.8,
  moderateMigrationMax: 1.2,
};

const MIGRATION_LEVEL_INFO: Record<MigrationLevel, MigrationLevelInfo> = {
  [MigrationLevel.Stable]: { level: MigrationLevel.Stable, label: '安定', description: '添加剤がポリマー中に留まる', color: 'green' },
  [MigrationLevel.ModerateMigration]: { level: MigrationLevel.ModerateMigration, label: '中程度移行', description: '条件次第で移行の可能性あり', color: 'yellow' },
  [MigrationLevel.HighMigration]: { level: MigrationLevel.HighMigration, label: '高移行', description: 'ブルーミング・移行のリスクが高い', color: 'red' },
};

/**
 * RED値から移行リスクを分類
 */
export function classifyMigration(red: number, thresholds: MigrationThresholds = DEFAULT_MIGRATION_THRESHOLDS): MigrationLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.stableMax) return MigrationLevel.Stable;
  if (red < thresholds.moderateMigrationMax) return MigrationLevel.ModerateMigration;
  return MigrationLevel.HighMigration;
}

export function getMigrationLevelInfo(level: MigrationLevel): MigrationLevelInfo {
  return MIGRATION_LEVEL_INFO[level];
}

/**
 * 添加剤の移行リスクをスクリーニング
 *
 * @param polymerHSP - ポリマーのHSP
 * @param polymerR0 - ポリマーの相互作用半径
 * @param additives - 添加剤リスト
 * @param thresholds - 閾値設定
 * @returns RED昇順ソートされた移行リスク評価結果
 */
export function screenAdditiveMigration(
  polymerHSP: HSPValues,
  polymerR0: number,
  additives: AdditiveInput[],
  thresholds: MigrationThresholds = DEFAULT_MIGRATION_THRESHOLDS
): MigrationResult[] {
  const results: MigrationResult[] = additives.map((additive) => {
    const ra = calculateRa(polymerHSP, additive.hsp);
    const red = calculateRed(polymerHSP, additive.hsp, polymerR0);
    const migrationLevel = classifyMigration(red, thresholds);
    return { additiveName: additive.name, additiveHSP: additive.hsp, ra, red, migrationLevel };
  });
  results.sort((a, b) => a.red - b.red);
  return results;
}
