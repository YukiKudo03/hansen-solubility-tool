import { describe, it, expect } from 'vitest';
import { calculateTeasCoordinates, buildTeasPlotData } from '../../src/core/teas-plot';
import type { Solvent, Part } from '../../src/core/types';

describe('calculateTeasCoordinates', () => {
  it('分率の合計が1になる', () => {
    const coords = calculateTeasCoordinates({ deltaD: 18, deltaP: 10, deltaH: 12 });
    expect(coords.fd + coords.fp + coords.fh).toBeCloseTo(1, 10);
  });

  it('各分率が0以上1以下', () => {
    const coords = calculateTeasCoordinates({ deltaD: 18, deltaP: 10, deltaH: 12 });
    expect(coords.fd).toBeGreaterThanOrEqual(0);
    expect(coords.fd).toBeLessThanOrEqual(1);
    expect(coords.fp).toBeGreaterThanOrEqual(0);
    expect(coords.fp).toBeLessThanOrEqual(1);
    expect(coords.fh).toBeGreaterThanOrEqual(0);
    expect(coords.fh).toBeLessThanOrEqual(1);
  });

  it('全成分が0の場合エラー', () => {
    expect(() => calculateTeasCoordinates({ deltaD: 0, deltaP: 0, deltaH: 0 })).toThrow();
  });

  it('δD のみの場合 fd=1', () => {
    const coords = calculateTeasCoordinates({ deltaD: 18, deltaP: 0, deltaH: 0 });
    expect(coords.fd).toBeCloseTo(1);
    expect(coords.fp).toBeCloseTo(0);
    expect(coords.fh).toBeCloseTo(0);
  });
});

describe('buildTeasPlotData', () => {
  it('正しい構造を返す', () => {
    const solvents: Solvent[] = [{
      id: 1, name: 'test', nameEn: null, casNumber: null,
      hsp: { deltaD: 18, deltaP: 10, deltaH: 12 },
      molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null,
      specificGravity: null, surfaceTension: null, notes: null,
    }];
    const data = buildTeasPlotData(solvents, []);
    expect(data.solvents.names).toHaveLength(1);
    expect(data.solvents.fd).toHaveLength(1);
    expect(data.solvents.fp).toHaveLength(1);
    expect(data.solvents.fh).toHaveLength(1);
    expect(data.solvents.x).toHaveLength(1);
    expect(data.solvents.y).toHaveLength(1);
    expect(data.parts.names).toHaveLength(0);
  });

  it('部品データも含まれる', () => {
    const parts: Part[] = [{
      id: 1, groupId: 1, name: 'part1', materialType: null,
      hsp: { deltaD: 20, deltaP: 5, deltaH: 8 }, r0: 5, notes: null,
    }];
    const data = buildTeasPlotData([], parts);
    expect(data.parts.names).toHaveLength(1);
    expect(data.parts.fd).toHaveLength(1);
  });

  it.todo('大量データ時のページネーション対応');
});
