/**
 * 添加剤移行予測 — polymer-additive-migration のアダプタ
 *
 * Part/Solvent ベースのインターフェースを提供し、内部で polymer-additive-migration に委譲する。
 */
import {
  classifyMigration as _classifyMigration,
  getMigrationLevelInfo as _getMigrationLevelInfo,
  screenAdditiveMigration as _screenAdditiveMigration,
  MigrationLevel,
  DEFAULT_MIGRATION_THRESHOLDS,
} from './polymer-additive-migration';
import type { MigrationThresholds, MigrationLevelInfo } from './polymer-additive-migration';
import type { Part, Solvent } from './types';

export { MigrationLevel, DEFAULT_MIGRATION_THRESHOLDS };
export type { MigrationThresholds };

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

/** 移行リスク分類 (委譲) */
export function classifyMigration(red: number, thresholds: MigrationThresholds): MigrationLevel {
  return _classifyMigration(red, thresholds);
}

/** レベル情報取得 (委譲) */
export function getMigrationLevelInfo(level: MigrationLevel): MigrationLevelInfo {
  return _getMigrationLevelInfo(level);
}

/** 全添加剤（溶媒テーブル利用）をスクリーニング — Part/Solvent ラッパー */
export function screenAdditiveMigration(
  polymer: Part,
  additives: Solvent[],
  thresholds: MigrationThresholds,
): AdditiveMigrationEvaluationResult {
  const inputs = additives.map((s) => ({ name: s.name, hsp: s.hsp }));
  const coreResults = _screenAdditiveMigration(polymer.hsp, polymer.r0, inputs, thresholds);

  const results: AdditiveMigrationResult[] = coreResults.map((cr, i) => ({
    additive: additives.find((a) => a.name === cr.additiveName)!,
    polymer,
    ra: cr.ra,
    red: cr.red,
    migrationLevel: cr.migrationLevel,
  }));

  return {
    polymer,
    results,
    evaluatedAt: new Date(),
    thresholdsUsed: thresholds,
  };
}
