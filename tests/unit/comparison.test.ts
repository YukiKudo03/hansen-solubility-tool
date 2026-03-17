import { describe, it, expect } from 'vitest';
import { buildComparisonMatrix, calculateComparisonStats } from '../../src/core/comparison';
import type { Part, Solvent } from '../../src/core/types';

const makePart = (overrides: Partial<Part> = {}): Part => ({
  id: 1, groupId: 1, name: 'PS', materialType: 'PS',
  hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, r0: 5.3, notes: null,
  ...overrides,
});

const makeSolvent = (overrides: Partial<Solvent> = {}): Solvent => ({
  id: 1, name: 'トルエン', nameEn: 'Toluene', casNumber: '108-88-3',
  hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: 106.2, molWeight: 92.14,
  boilingPoint: 110.6, viscosity: 0.56, specificGravity: 0.867, surfaceTension: 28.4, notes: null,
  ...overrides,
});

describe('buildComparisonMatrix', () => {
  it('1材料 × 1溶媒で1行の結果を返す', () => {
    const parts = [makePart()];
    const solvents = [makeSolvent()];
    const rows = buildComparisonMatrix(parts, solvents);

    expect(rows).toHaveLength(1);
    expect(rows[0].partName).toBe('PS');
    expect(rows[0].solventName).toBe('トルエン');
    expect(rows[0].ra).toBeGreaterThan(0);
    expect(rows[0].red).toBeGreaterThan(0);
  });

  it('2材料 × 3溶媒で6行の結果を返す', () => {
    const parts = [makePart({ id: 1, name: 'PS' }), makePart({ id: 2, name: 'PE' })];
    const solvents = [
      makeSolvent({ id: 1, name: 'トルエン' }),
      makeSolvent({ id: 2, name: 'アセトン' }),
      makeSolvent({ id: 3, name: 'NMP' }),
    ];
    const rows = buildComparisonMatrix(parts, solvents);
    expect(rows).toHaveLength(6);
  });

  it('空の材料リストで空配列を返す', () => {
    const rows = buildComparisonMatrix([], [makeSolvent()]);
    expect(rows).toEqual([]);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const rows = buildComparisonMatrix([makePart()], []);
    expect(rows).toEqual([]);
  });

  it('各行にRa, RED, riskLevelが含まれる', () => {
    const rows = buildComparisonMatrix([makePart()], [makeSolvent()]);
    expect(rows[0]).toHaveProperty('ra');
    expect(rows[0]).toHaveProperty('red');
    expect(rows[0]).toHaveProperty('riskLevel');
  });
});

describe('calculateComparisonStats', () => {
  it('行数・最小RED・最大RED・平均REDを計算', () => {
    const parts = [makePart({ id: 1 }), makePart({ id: 2 })];
    const solvents = [makeSolvent({ id: 1 }), makeSolvent({ id: 2 })];
    const rows = buildComparisonMatrix(parts, solvents);
    const stats = calculateComparisonStats(rows);

    expect(stats.totalRows).toBe(4);
    expect(stats.minRed).toBeGreaterThanOrEqual(0);
    expect(stats.maxRed).toBeGreaterThanOrEqual(stats.minRed);
    expect(stats.avgRed).toBeGreaterThanOrEqual(stats.minRed);
    expect(stats.avgRed).toBeLessThanOrEqual(stats.maxRed);
  });

  it('空配列でゼロ統計を返す', () => {
    const stats = calculateComparisonStats([]);
    expect(stats.totalRows).toBe(0);
    expect(stats.minRed).toBe(0);
    expect(stats.maxRed).toBe(0);
    expect(stats.avgRed).toBe(0);
  });
});
