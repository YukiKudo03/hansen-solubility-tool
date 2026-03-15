import { describe, it, expect } from 'vitest';
import { classifyDrugSolubility, DEFAULT_DRUG_SOLUBILITY_THRESHOLDS, getDrugSolubilityLevelInfo, screenDrugSolvents } from '../../src/core/drug-solubility';
import { DrugSolubilityLevel } from '../../src/core/types';
import type { Drug, Solvent } from '../../src/core/types';

function makeDrug(id: number, deltaD: number, deltaP: number, deltaH: number, r0: number): Drug {
  return { id, name: `Drug${id}`, nameEn: null, casNumber: null, hsp: { deltaD, deltaP, deltaH }, r0, molWeight: null, logP: null, therapeuticCategory: null, notes: null };
}

function makeSolvent(id: number, name: string, deltaD: number, deltaP: number, deltaH: number): Solvent {
  return { id, name, nameEn: null, casNumber: null, hsp: { deltaD, deltaP, deltaH }, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null };
}

describe('classifyDrugSolubility', () => {
  it('RED < 0.5 → Excellent', () => { expect(classifyDrugSolubility(0.3)).toBe(DrugSolubilityLevel.Excellent); });
  it('RED = 0.0 → Excellent', () => { expect(classifyDrugSolubility(0.0)).toBe(DrugSolubilityLevel.Excellent); });
  it('RED = 0.5 → Good (境界)', () => { expect(classifyDrugSolubility(0.5)).toBe(DrugSolubilityLevel.Good); });
  it('RED = 0.8 → Partial (境界)', () => { expect(classifyDrugSolubility(0.8)).toBe(DrugSolubilityLevel.Partial); });
  it('RED = 1.0 → Poor (境界)', () => { expect(classifyDrugSolubility(1.0)).toBe(DrugSolubilityLevel.Poor); });
  it('RED = 1.5 → Insoluble (境界)', () => { expect(classifyDrugSolubility(1.5)).toBe(DrugSolubilityLevel.Insoluble); });
  it('RED = 3.0 → Insoluble', () => { expect(classifyDrugSolubility(3.0)).toBe(DrugSolubilityLevel.Insoluble); });
  it('負のRED値でエラー', () => { expect(() => classifyDrugSolubility(-0.1)).toThrow(); });
  it('カスタム閾値が適用される', () => {
    const custom = { excellentMax: 0.3, goodMax: 0.6, partialMax: 0.9, poorMax: 1.2 };
    expect(classifyDrugSolubility(0.25, custom)).toBe(DrugSolubilityLevel.Excellent);
    expect(classifyDrugSolubility(0.35, custom)).toBe(DrugSolubilityLevel.Good);
    expect(classifyDrugSolubility(0.65, custom)).toBe(DrugSolubilityLevel.Partial);
    expect(classifyDrugSolubility(0.95, custom)).toBe(DrugSolubilityLevel.Poor);
    expect(classifyDrugSolubility(1.25, custom)).toBe(DrugSolubilityLevel.Insoluble);
  });
});

describe('DEFAULT_DRUG_SOLUBILITY_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_DRUG_SOLUBILITY_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.partialMax);
    expect(t.partialMax).toBeLessThan(t.poorMax);
  });
});

describe('getDrugSolubilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [DrugSolubilityLevel.Excellent, DrugSolubilityLevel.Good, DrugSolubilityLevel.Partial, DrugSolubilityLevel.Poor, DrugSolubilityLevel.Insoluble];
    for (const level of levels) {
      const info = getDrugSolubilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenDrugSolvents', () => {
  const drug = makeDrug(1, 17.0, 10.0, 8.0, 5.0);
  const solvents = [
    makeSolvent(1, 'Close', 17.1, 10.1, 8.1),
    makeSolvent(2, 'Medium', 15.0, 5.0, 4.0),
    makeSolvent(3, 'Far', 25.0, 1.0, 1.0),
  ];

  it('結果がRED昇順にソートされる', () => {
    const result = screenDrugSolvents(drug, solvents);
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].red).toBeGreaterThanOrEqual(result.results[i - 1].red);
    }
  });

  it('全溶媒が結果に含まれる', () => {
    const result = screenDrugSolvents(drug, solvents);
    expect(result.results.length).toBe(3);
  });

  it('結果にdrugが正しく設定される', () => {
    const result = screenDrugSolvents(drug, solvents);
    expect(result.drug.id).toBe(1);
  });

  it('evaluatedAtが設定される', () => {
    const before = new Date();
    const result = screenDrugSolvents(drug, solvents);
    expect(result.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });
});
