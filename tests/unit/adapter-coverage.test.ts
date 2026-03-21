/**
 * アダプタモジュールのカバレッジテスト
 * additive-migration.ts と flavor-scalping.ts のPart/Solventラッパーを検証
 */
import { describe, it, expect } from 'vitest';
import {
  screenAdditiveMigration,
  classifyMigration,
  getMigrationLevelInfo,
  MigrationLevel,
  DEFAULT_MIGRATION_THRESHOLDS,
} from '../../src/core/additive-migration';
import type { Part, Solvent } from '../../src/core/types';

// flavor-scalping adapter
import {
  screenFlavorScalping,
  classifyScalping,
  getScalpingLevelInfo,
  DEFAULT_SCALPING_THRESHOLDS,
} from '../../src/core/flavor-scalping';

const mockPart: Part = {
  id: 1, groupId: 1, name: 'PVC', casNumber: null,
  hsp: { deltaD: 19.2, deltaP: 7.9, deltaH: 3.4 },
  r0: 8.0, notes: null, createdAt: '',
};

const mockSolvents: Solvent[] = [
  {
    id: 1, name: 'DEHP', nameEn: null, casNumber: null,
    hsp: { deltaD: 18.2, deltaP: 7.4, deltaH: 3.1 },
    molarVolume: 390, molWeight: 390, boilingPoint: 386,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  },
  {
    id: 2, name: 'Toluene', nameEn: null, casNumber: null,
    hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
    molarVolume: 106.8, molWeight: 92, boilingPoint: 111,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  },
];

describe('additive-migration adapter', () => {
  it('classifyMigration delegates correctly', () => {
    const level = classifyMigration(0.5, DEFAULT_MIGRATION_THRESHOLDS);
    expect(level).toBeDefined();
  });

  it('getMigrationLevelInfo returns info', () => {
    const info = getMigrationLevelInfo(MigrationLevel.Stable);
    expect(info).toBeDefined();
    expect(info.label).toBeDefined();
  });

  it('screenAdditiveMigration returns evaluation result', () => {
    const result = screenAdditiveMigration(mockPart, mockSolvents, DEFAULT_MIGRATION_THRESHOLDS);
    expect(result.polymer).toBe(mockPart);
    expect(result.results.length).toBe(2);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
    expect(result.thresholdsUsed).toBe(DEFAULT_MIGRATION_THRESHOLDS);
  });

  it('result items have correct structure', () => {
    const result = screenAdditiveMigration(mockPart, mockSolvents, DEFAULT_MIGRATION_THRESHOLDS);
    const first = result.results[0];
    expect(first.additive).toBeDefined();
    expect(first.polymer).toBe(mockPart);
    expect(first.ra).toBeGreaterThan(0);
    expect(first.red).toBeGreaterThan(0);
    expect(first.migrationLevel).toBeDefined();
  });
});

describe('flavor-scalping adapter', () => {
  it('classifyScalping delegates correctly', () => {
    const level = classifyScalping(0.5, DEFAULT_SCALPING_THRESHOLDS);
    expect(level).toBeDefined();
  });

  it('getScalpingLevelInfo returns info', () => {
    const info = getScalpingLevelInfo(1); // HighScalping
    expect(info).toBeDefined();
  });

  it('screenFlavorScalping returns evaluation result', () => {
    const packaging = mockPart; // reuse as packaging material
    const result = screenFlavorScalping(packaging, mockSolvents, DEFAULT_SCALPING_THRESHOLDS);
    expect(result.packaging).toBe(packaging);
    expect(result.results.length).toBe(2);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
    expect(result.thresholdsUsed).toBe(DEFAULT_SCALPING_THRESHOLDS);
  });

  it('result items have correct structure', () => {
    const result = screenFlavorScalping(mockPart, mockSolvents, DEFAULT_SCALPING_THRESHOLDS);
    const first = result.results[0];
    expect(first.aroma).toBeDefined();
    expect(first.packaging).toBe(mockPart);
    expect(first.ra).toBeGreaterThan(0);
    expect(first.red).toBeGreaterThan(0);
    expect(first.scalpingLevel).toBeDefined();
  });
});
