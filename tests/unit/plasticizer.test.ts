import { describe, it, expect } from 'vitest';
import { classifyPlasticizerCompatibility, DEFAULT_PLASTICIZER_THRESHOLDS, getPlasticizerCompatibilityLevelInfo, screenPlasticizers } from '../../src/core/plasticizer';
import { PlasticizerCompatibilityLevel } from '../../src/core/types';
import type { Part, Solvent } from '../../src/core/types';

function makePart(id: number, deltaD: number, deltaP: number, deltaH: number, r0: number): Part {
  return { id, groupId: 1, name: `Part${id}`, materialType: null, hsp: { deltaD, deltaP, deltaH }, r0, notes: null };
}

function makeSolvent(id: number, name: string, deltaD: number, deltaP: number, deltaH: number): Solvent {
  return { id, name, nameEn: null, casNumber: null, hsp: { deltaD, deltaP, deltaH }, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null };
}

describe('classifyPlasticizerCompatibility', () => {
  it('RED < 0.5 → Excellent', () => { expect(classifyPlasticizerCompatibility(0.3)).toBe(PlasticizerCompatibilityLevel.Excellent); });
  it('RED = 0.0 → Excellent', () => { expect(classifyPlasticizerCompatibility(0.0)).toBe(PlasticizerCompatibilityLevel.Excellent); });
  it('RED = 0.5 → Good (境界)', () => { expect(classifyPlasticizerCompatibility(0.5)).toBe(PlasticizerCompatibilityLevel.Good); });
  it('RED = 0.7 → Good', () => { expect(classifyPlasticizerCompatibility(0.7)).toBe(PlasticizerCompatibilityLevel.Good); });
  it('RED = 0.8 → Fair (境界)', () => { expect(classifyPlasticizerCompatibility(0.8)).toBe(PlasticizerCompatibilityLevel.Fair); });
  it('RED = 0.9 → Fair', () => { expect(classifyPlasticizerCompatibility(0.9)).toBe(PlasticizerCompatibilityLevel.Fair); });
  it('RED = 1.0 → Poor (境界)', () => { expect(classifyPlasticizerCompatibility(1.0)).toBe(PlasticizerCompatibilityLevel.Poor); });
  it('RED = 1.2 → Poor', () => { expect(classifyPlasticizerCompatibility(1.2)).toBe(PlasticizerCompatibilityLevel.Poor); });
  it('RED = 1.5 → Incompatible (境界)', () => { expect(classifyPlasticizerCompatibility(1.5)).toBe(PlasticizerCompatibilityLevel.Incompatible); });
  it('RED = 2.0 → Incompatible', () => { expect(classifyPlasticizerCompatibility(2.0)).toBe(PlasticizerCompatibilityLevel.Incompatible); });
  it('負のRED値でエラー', () => { expect(() => classifyPlasticizerCompatibility(-0.1)).toThrow(); });
  it('カスタム閾値が適用される', () => {
    const custom = { excellentMax: 0.3, goodMax: 0.6, fairMax: 0.9, poorMax: 1.2 };
    expect(classifyPlasticizerCompatibility(0.2, custom)).toBe(PlasticizerCompatibilityLevel.Excellent);
    expect(classifyPlasticizerCompatibility(0.4, custom)).toBe(PlasticizerCompatibilityLevel.Good);
    expect(classifyPlasticizerCompatibility(0.7, custom)).toBe(PlasticizerCompatibilityLevel.Fair);
    expect(classifyPlasticizerCompatibility(1.0, custom)).toBe(PlasticizerCompatibilityLevel.Poor);
    expect(classifyPlasticizerCompatibility(1.5, custom)).toBe(PlasticizerCompatibilityLevel.Incompatible);
  });
});

describe('DEFAULT_PLASTICIZER_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_PLASTICIZER_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.fairMax);
    expect(t.fairMax).toBeLessThan(t.poorMax);
  });
});

describe('getPlasticizerCompatibilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [PlasticizerCompatibilityLevel.Excellent, PlasticizerCompatibilityLevel.Good, PlasticizerCompatibilityLevel.Fair, PlasticizerCompatibilityLevel.Poor, PlasticizerCompatibilityLevel.Incompatible];
    for (const level of levels) {
      const info = getPlasticizerCompatibilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenPlasticizers', () => {
  const part = makePart(1, 17.0, 10.0, 8.0, 5.0);
  const solvents = [
    makeSolvent(1, 'Close', 17.1, 10.1, 8.1),
    makeSolvent(2, 'Medium', 15.0, 5.0, 4.0),
    makeSolvent(3, 'Far', 25.0, 1.0, 1.0),
  ];

  it('結果がRED昇順にソートされる', () => {
    const result = screenPlasticizers(part, solvents);
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].red).toBeGreaterThanOrEqual(result.results[i - 1].red);
    }
  });

  it('全溶媒が結果に含まれる', () => {
    const result = screenPlasticizers(part, solvents);
    expect(result.results.length).toBe(3);
  });

  it('結果にpartが正しく設定される', () => {
    const result = screenPlasticizers(part, solvents);
    expect(result.part.id).toBe(1);
  });

  it('evaluatedAtが設定される', () => {
    const before = new Date();
    const result = screenPlasticizers(part, solvents);
    expect(result.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
