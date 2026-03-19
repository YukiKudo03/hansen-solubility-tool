import { describe, it, expect } from 'vitest';
import { buildProjection2DData } from '../../src/core/projection-2d';
import type { Solvent, Part } from '../../src/core/types';

function makeSolvent(id: number): Solvent {
  return {
    id, name: `S${id}`, nameEn: null, casNumber: null,
    hsp: { deltaD: 18, deltaP: 10, deltaH: 12 },
    molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null,
    specificGravity: null, surfaceTension: null, notes: null,
  };
}

function makePart(id: number): Part {
  return {
    id, groupId: 1, name: `P${id}`, materialType: null,
    hsp: { deltaD: 20, deltaP: 5, deltaH: 8 }, r0: 5, notes: null,
  };
}

describe('buildProjection2DData', () => {
  it('3つの射影を返す', () => {
    const data = buildProjection2DData([makeSolvent(1)], [makePart(1)]);
    expect(data.projections).toHaveLength(3);
  });

  it('各射影の plane ラベルが正しい', () => {
    const data = buildProjection2DData([], []);
    const planes = data.projections.map((p) => p.plane);
    expect(planes).toContain('dD-dP');
    expect(planes).toContain('dP-dH');
    expect(planes).toContain('dD-dH');
  });

  it('データ配列の長さが入力に一致', () => {
    const solvents = [makeSolvent(1), makeSolvent(2)];
    const parts = [makePart(1)];
    const data = buildProjection2DData(solvents, parts);
    for (const proj of data.projections) {
      expect(proj.solvents.names).toHaveLength(2);
      expect(proj.solvents.x).toHaveLength(2);
      expect(proj.solvents.y).toHaveLength(2);
      expect(proj.parts.names).toHaveLength(1);
      expect(proj.parts.x).toHaveLength(1);
      expect(proj.parts.y).toHaveLength(1);
      expect(proj.parts.r0).toHaveLength(1);
    }
  });

  it('xLabel と yLabel が設定されている', () => {
    const data = buildProjection2DData([], []);
    for (const proj of data.projections) {
      expect(proj.xLabel).toBeTruthy();
      expect(proj.yLabel).toBeTruthy();
    }
  });

  it('空の入力でもエラーにならない', () => {
    const data = buildProjection2DData([], []);
    expect(data.projections).toHaveLength(3);
  });
});
