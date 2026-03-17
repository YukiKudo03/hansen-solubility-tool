import { describe, it, expect } from 'vitest';
import {
  buildScatterData,
  buildSphereData,
  redToColor,
} from '../../src/core/hsp-visualization';
import type { Part, Solvent } from '../../src/core/types';

const makePart = (overrides: Partial<Part> = {}): Part => ({
  id: 1, groupId: 1, name: 'PS', materialType: 'PS',
  hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 }, r0: 5.3, notes: null,
  ...overrides,
});

const makeSolvent = (overrides: Partial<Solvent> = {}): Solvent => ({
  id: 1, name: 'トルエン', nameEn: 'Toluene', casNumber: null,
  hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: null, molWeight: null,
  boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  ...overrides,
});

describe('buildScatterData', () => {
  it('溶媒リストから散布点データを生成', () => {
    const solvents = [makeSolvent({ id: 1 }), makeSolvent({ id: 2, name: 'アセトン' })];
    const data = buildScatterData(solvents);

    expect(data.x).toHaveLength(2);
    expect(data.y).toHaveLength(2);
    expect(data.z).toHaveLength(2);
    expect(data.names).toHaveLength(2);
    expect(data.x[0]).toBe(18.0); // deltaD
    expect(data.y[0]).toBe(1.4);  // deltaP
    expect(data.z[0]).toBe(2.0);  // deltaH
  });

  it('空の溶媒リストで空データを返す', () => {
    const data = buildScatterData([]);
    expect(data.x).toEqual([]);
    expect(data.y).toEqual([]);
    expect(data.z).toEqual([]);
    expect(data.names).toEqual([]);
  });
});

describe('buildSphereData', () => {
  it('部品からHSP球の頂点データを生成', () => {
    const part = makePart();
    const data = buildSphereData(part);

    expect(data.center).toEqual({ x: 18.5, y: 4.5, z: 2.9 });
    expect(data.r0).toBe(5.3);
    // 球面の頂点が生成される
    expect(data.vertices.x.length).toBeGreaterThan(0);
    expect(data.vertices.y.length).toBe(data.vertices.x.length);
    expect(data.vertices.z.length).toBe(data.vertices.x.length);
  });

  it('R₀=0の部品でも空でないデータを返す', () => {
    const part = makePart({ r0: 0.001 });
    const data = buildSphereData(part);
    expect(data.vertices.x.length).toBeGreaterThan(0);
  });
});

describe('redToColor', () => {
  it('RED=0で緑系の色を返す', () => {
    const color = redToColor(0);
    expect(color).toMatch(/^rgb/);
  });

  it('RED=2で赤系の色を返す', () => {
    const color = redToColor(2);
    expect(color).toMatch(/^rgb/);
  });

  it('RED=1で黄色系の色を返す', () => {
    const color = redToColor(1);
    expect(color).toMatch(/^rgb/);
  });

  it('負のREDでも例外なし', () => {
    expect(() => redToColor(-1)).not.toThrow();
  });

  it('NaN/InfinityのREDでもフォールバック色を返す', () => {
    expect(redToColor(NaN)).toMatch(/^rgb/);
    expect(redToColor(Infinity)).toMatch(/^rgb/);
  });
});
