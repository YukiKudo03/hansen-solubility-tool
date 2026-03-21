/**
 * 食品包装材溶出リスク予測
 *
 * 包装材からの物質（モノマー、添加剤）の食品への移行リスクを予測。
 * RED小 → 移行リスク高（包装材中の物質が食品に溶出しやすい）
 * RED大 → 移行リスク低
 */
import type { HSPValues } from './types';
import { calculateRa, calculateRed } from './hsp';

/** 包装材移行リスク分類 */
export enum PackagingMigrationLevel {
  HighRisk = 1,     // 高リスク（RED < 0.8）
  ModerateRisk = 2, // 中程度（0.8 ≤ RED < 1.2）
  LowRisk = 3,      // 低リスク（RED ≥ 1.2）
}

/** 包装材移行閾値 */
export interface PackagingMigrationThresholds {
  highRiskMax: number;     // default: 0.8
  moderateRiskMax: number; // default: 1.2
}

/** 移行物質入力 */
export interface MigrantInput {
  name: string;
  hsp: HSPValues;
}

/** 包装材移行評価結果 */
export interface PackagingMigrationResult {
  migrantName: string;
  migrantHSP: HSPValues;
  ra: number;
  red: number;
  migrationLevel: PackagingMigrationLevel;
}

/** 移行レベル表示情報 */
export interface PackagingMigrationLevelInfo {
  level: PackagingMigrationLevel;
  label: string;
  description: string;
  color: string;
}

export const DEFAULT_PACKAGING_MIGRATION_THRESHOLDS: PackagingMigrationThresholds = {
  highRiskMax: 0.8,
  moderateRiskMax: 1.2,
};

const PACKAGING_MIGRATION_LEVEL_INFO: Record<PackagingMigrationLevel, PackagingMigrationLevelInfo> = {
  [PackagingMigrationLevel.HighRisk]: { level: PackagingMigrationLevel.HighRisk, label: '高リスク', description: '溶出リスクが高い', color: 'red' },
  [PackagingMigrationLevel.ModerateRisk]: { level: PackagingMigrationLevel.ModerateRisk, label: '中程度', description: '条件次第で溶出の可能性あり', color: 'yellow' },
  [PackagingMigrationLevel.LowRisk]: { level: PackagingMigrationLevel.LowRisk, label: '低リスク', description: '溶出リスクが低い', color: 'green' },
};

/**
 * RED値から包装材移行リスクを分類
 */
export function classifyPackagingMigration(red: number, thresholds: PackagingMigrationThresholds = DEFAULT_PACKAGING_MIGRATION_THRESHOLDS): PackagingMigrationLevel {
  if (red < 0) throw new Error('RED値は非負でなければなりません');
  if (red < thresholds.highRiskMax) return PackagingMigrationLevel.HighRisk;
  if (red < thresholds.moderateRiskMax) return PackagingMigrationLevel.ModerateRisk;
  return PackagingMigrationLevel.LowRisk;
}

export function getPackagingMigrationLevelInfo(level: PackagingMigrationLevel): PackagingMigrationLevelInfo {
  return PACKAGING_MIGRATION_LEVEL_INFO[level];
}

/**
 * 包装材からの移行リスクをスクリーニング
 *
 * @param packagingHSP - 包装材のHSP
 * @param packagingR0 - 包装材の相互作用半径
 * @param migrants - 移行物質リスト
 * @param thresholds - 閾値設定
 * @returns RED昇順ソート（移行リスクが高い順）
 */
export function screenPackagingMigration(
  packagingHSP: HSPValues,
  packagingR0: number,
  migrants: MigrantInput[],
  thresholds: PackagingMigrationThresholds = DEFAULT_PACKAGING_MIGRATION_THRESHOLDS
): PackagingMigrationResult[] {
  const results: PackagingMigrationResult[] = migrants.map((migrant) => {
    const ra = calculateRa(packagingHSP, migrant.hsp);
    const red = calculateRed(packagingHSP, migrant.hsp, packagingR0);
    const migrationLevel = classifyPackagingMigration(red, thresholds);
    return { migrantName: migrant.name, migrantHSP: migrant.hsp, ra, red, migrationLevel };
  });
  results.sort((a, b) => a.red - b.red);
  return results;
}
