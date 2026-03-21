import { describe, it, expect } from 'vitest';
import {
  classifyMigration,
  screenAdditiveMigration,
  getMigrationLevelInfo,
  DEFAULT_MIGRATION_THRESHOLDS,
  MigrationLevel,
} from '../../src/core/polymer-additive-migration';
import type { AdditiveInput } from '../../src/core/polymer-additive-migration';
import type { HSPValues } from '../../src/core/types';

describe('classifyMigration', () => {
  it('RED < 0.8 → Stable', () => {
    expect(classifyMigration(0.5)).toBe(MigrationLevel.Stable);
  });
  it('RED = 0.0 → Stable', () => {
    expect(classifyMigration(0.0)).toBe(MigrationLevel.Stable);
  });
  it('RED = 0.8 → ModerateMigration (境界)', () => {
    expect(classifyMigration(0.8)).toBe(MigrationLevel.ModerateMigration);
  });
  it('RED = 1.0 → ModerateMigration', () => {
    expect(classifyMigration(1.0)).toBe(MigrationLevel.ModerateMigration);
  });
  it('RED = 1.2 → HighMigration (境界)', () => {
    expect(classifyMigration(1.2)).toBe(MigrationLevel.HighMigration);
  });
  it('RED = 2.0 → HighMigration', () => {
    expect(classifyMigration(2.0)).toBe(MigrationLevel.HighMigration);
  });
  it('負のRED値でエラー', () => {
    expect(() => classifyMigration(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { stableMax: 0.5, moderateMigrationMax: 1.0 };
    expect(classifyMigration(0.3, custom)).toBe(MigrationLevel.Stable);
    expect(classifyMigration(0.7, custom)).toBe(MigrationLevel.ModerateMigration);
    expect(classifyMigration(1.5, custom)).toBe(MigrationLevel.HighMigration);
  });
});

describe('DEFAULT_MIGRATION_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_MIGRATION_THRESHOLDS;
    expect(t.stableMax).toBeLessThan(t.moderateMigrationMax);
  });
});

describe('getMigrationLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [MigrationLevel.Stable, MigrationLevel.ModerateMigration, MigrationLevel.HighMigration];
    for (const level of levels) {
      const info = getMigrationLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenAdditiveMigration', () => {
  // PVC: dD=18.2, dP=7.5, dH=8.3, R0=8.0 (可塑剤評価用の大きめR0)
  const pvcHSP: HSPValues = { deltaD: 18.2, deltaP: 7.5, deltaH: 8.3 };
  const pvcR0 = 8.0;

  // DEHP (可塑剤): dD=16.6, dP=7.0, dH=3.1 → PVCに近い→Stable
  // Ra = sqrt(4*(1.6)^2 + (0.5)^2 + (5.2)^2) ≈ 6.13, RED ≈ 0.77 < 0.8
  const dehp: AdditiveInput = { name: 'DEHP', hsp: { deltaD: 16.6, deltaP: 7.0, deltaH: 3.1 } };
  // 某難燃剤 (HSPが遠い): dD=20.0, dP=15.0, dH=18.0 → PVCから遠い→HighMigration
  const flameRetardant: AdditiveInput = { name: 'FlameRetardant-X', hsp: { deltaD: 20.0, deltaP: 15.0, deltaH: 18.0 } };

  it('PVC + DEHP → Stable (可塑剤がポリマー中に留まる)', () => {
    const results = screenAdditiveMigration(pvcHSP, pvcR0, [dehp]);
    expect(results).toHaveLength(1);
    expect(results[0].migrationLevel).toBe(MigrationLevel.Stable);
    expect(results[0].red).toBeLessThan(0.8);
  });

  it('PVC + 難燃剤 → HighMigration (移行リスク高)', () => {
    const results = screenAdditiveMigration(pvcHSP, pvcR0, [flameRetardant]);
    expect(results).toHaveLength(1);
    expect(results[0].migrationLevel).toBe(MigrationLevel.HighMigration);
    expect(results[0].red).toBeGreaterThanOrEqual(1.2);
  });

  it('結果がRED昇順にソートされる', () => {
    const results = screenAdditiveMigration(pvcHSP, pvcR0, [flameRetardant, dehp]);
    expect(results).toHaveLength(2);
    expect(results[0].red).toBeLessThanOrEqual(results[1].red);
    expect(results[0].additiveName).toBe('DEHP');
  });

  it('空のリストで空結果', () => {
    const results = screenAdditiveMigration(pvcHSP, pvcR0, []);
    expect(results).toHaveLength(0);
  });

  it('Ra値が正しく計算される', () => {
    const results = screenAdditiveMigration(pvcHSP, pvcR0, [dehp]);
    expect(results[0].ra).toBeGreaterThan(0);
  });
});
