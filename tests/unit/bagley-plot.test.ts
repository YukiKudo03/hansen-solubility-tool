import { describe, it, expect } from 'vitest';
import { calculateBagleyCoordinates, buildBagleyPlotData } from '../../src/core/bagley-plot';
import type { Solvent } from '../../src/core/types';

describe('calculateBagleyCoordinates', () => {
  it('deltaV = sqrt(deltaD^2 + deltaP^2)', () => {
    const coords = calculateBagleyCoordinates({ deltaD: 3, deltaP: 4, deltaH: 7 });
    expect(coords.deltaV).toBeCloseTo(5, 10);
    expect(coords.deltaH).toBe(7);
  });

  it('deltaP=0 の場合 deltaV=deltaD', () => {
    const coords = calculateBagleyCoordinates({ deltaD: 18, deltaP: 0, deltaH: 5 });
    expect(coords.deltaV).toBeCloseTo(18, 10);
  });

  it('deltaD=0 の場合 deltaV=deltaP', () => {
    const coords = calculateBagleyCoordinates({ deltaD: 0, deltaP: 10, deltaH: 5 });
    expect(coords.deltaV).toBeCloseTo(10, 10);
  });
});

describe('buildBagleyPlotData', () => {
  it('正しい構造を返す', () => {
    const solvents: Solvent[] = [{
      id: 1, name: 'test', nameEn: null, casNumber: null,
      hsp: { deltaD: 18, deltaP: 10, deltaH: 12 },
      molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null,
      specificGravity: null, surfaceTension: null, notes: null,
    }];
    const data = buildBagleyPlotData(solvents, []);
    expect(data.solvents.names).toHaveLength(1);
    expect(data.solvents.deltaV).toHaveLength(1);
    expect(data.solvents.deltaH).toHaveLength(1);
    expect(data.parts.names).toHaveLength(0);
  });

  it('溶媒の deltaV が正しく計算される', () => {
    const solvents: Solvent[] = [{
      id: 1, name: 'test', nameEn: null, casNumber: null,
      hsp: { deltaD: 3, deltaP: 4, deltaH: 7 },
      molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null,
      specificGravity: null, surfaceTension: null, notes: null,
    }];
    const data = buildBagleyPlotData(solvents);
    expect(data.solvents.deltaV[0]).toBeCloseTo(5, 10);
    expect(data.solvents.deltaH[0]).toBe(7);
  });
});
