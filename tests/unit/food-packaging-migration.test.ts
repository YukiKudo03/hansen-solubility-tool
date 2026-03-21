import { describe, it, expect } from 'vitest';
import {
  classifyPackagingMigration,
  screenPackagingMigration,
  getPackagingMigrationLevelInfo,
  DEFAULT_PACKAGING_MIGRATION_THRESHOLDS,
  PackagingMigrationLevel,
} from '../../src/core/food-packaging-migration';
import type { MigrantInput } from '../../src/core/food-packaging-migration';
import type { HSPValues } from '../../src/core/types';

describe('classifyPackagingMigration', () => {
  it('RED < 0.8 → HighRisk', () => {
    expect(classifyPackagingMigration(0.5)).toBe(PackagingMigrationLevel.HighRisk);
  });
  it('RED = 0.0 → HighRisk', () => {
    expect(classifyPackagingMigration(0.0)).toBe(PackagingMigrationLevel.HighRisk);
  });
  it('RED = 0.8 → ModerateRisk (境界)', () => {
    expect(classifyPackagingMigration(0.8)).toBe(PackagingMigrationLevel.ModerateRisk);
  });
  it('RED = 1.0 → ModerateRisk', () => {
    expect(classifyPackagingMigration(1.0)).toBe(PackagingMigrationLevel.ModerateRisk);
  });
  it('RED = 1.2 → LowRisk (境界)', () => {
    expect(classifyPackagingMigration(1.2)).toBe(PackagingMigrationLevel.LowRisk);
  });
  it('RED = 2.0 → LowRisk', () => {
    expect(classifyPackagingMigration(2.0)).toBe(PackagingMigrationLevel.LowRisk);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifyPackagingMigration(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { highRiskMax: 0.5, moderateRiskMax: 1.0 };
    expect(classifyPackagingMigration(0.3, custom)).toBe(PackagingMigrationLevel.HighRisk);
    expect(classifyPackagingMigration(0.7, custom)).toBe(PackagingMigrationLevel.ModerateRisk);
    expect(classifyPackagingMigration(1.5, custom)).toBe(PackagingMigrationLevel.LowRisk);
  });
});

describe('DEFAULT_PACKAGING_MIGRATION_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_PACKAGING_MIGRATION_THRESHOLDS;
    expect(t.highRiskMax).toBeLessThan(t.moderateRiskMax);
  });
});

describe('getPackagingMigrationLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [PackagingMigrationLevel.HighRisk, PackagingMigrationLevel.ModerateRisk, PackagingMigrationLevel.LowRisk];
    for (const level of levels) {
      const info = getPackagingMigrationLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenPackagingMigration', () => {
  // PET: dD=19.5, dP=3.5, dH=8.6, R0=5.0 (文献値)
  const petHSP: HSPValues = { deltaD: 19.5, deltaP: 3.5, deltaH: 8.6 };
  const petR0 = 5.0;

  // Acetaldehyde: dD=14.5, dP=8.0, dH=11.3 → PETから遠い→LowRisk
  const acetaldehyde: MigrantInput = { name: 'Acetaldehyde', hsp: { deltaD: 14.5, deltaP: 8.0, deltaH: 11.3 } };
  // Ethylene glycol (monomer): dD=17.0, dP=11.0, dH=26.0 → PETから遠い→LowRisk
  const ethyleneGlycol: MigrantInput = { name: 'Ethylene Glycol', hsp: { deltaD: 17.0, deltaP: 11.0, deltaH: 26.0 } };
  // 近いHSPの物質: dD=19.0, dP=3.0, dH=8.0 → PETに近い→HighRisk
  const closeMigrant: MigrantInput = { name: 'CloseMigrant', hsp: { deltaD: 19.0, deltaP: 3.0, deltaH: 8.0 } };

  it('PET vs Acetaldehyde → LowRisk (HSP距離が大きい)', () => {
    const results = screenPackagingMigration(petHSP, petR0, [acetaldehyde]);
    expect(results).toHaveLength(1);
    expect(results[0].migrationLevel).toBe(PackagingMigrationLevel.LowRisk);
    expect(results[0].red).toBeGreaterThanOrEqual(1.2);
  });

  it('PET vs 近いHSP物質 → HighRisk', () => {
    const results = screenPackagingMigration(petHSP, petR0, [closeMigrant]);
    expect(results).toHaveLength(1);
    expect(results[0].migrationLevel).toBe(PackagingMigrationLevel.HighRisk);
    expect(results[0].red).toBeLessThan(0.8);
  });

  it('結果がRED昇順にソートされる', () => {
    const results = screenPackagingMigration(petHSP, petR0, [acetaldehyde, closeMigrant, ethyleneGlycol]);
    expect(results.length).toBe(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].red).toBeGreaterThanOrEqual(results[i - 1].red);
    }
  });

  it('空のリストで空結果', () => {
    const results = screenPackagingMigration(petHSP, petR0, []);
    expect(results).toHaveLength(0);
  });

  it('Ra値が正しく計算される', () => {
    const results = screenPackagingMigration(petHSP, petR0, [acetaldehyde]);
    expect(results[0].ra).toBeGreaterThan(0);
  });
});
