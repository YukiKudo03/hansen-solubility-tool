import { describe, it, expect } from 'vitest';
import { classifyCarrierCompatibility, DEFAULT_CARRIER_THRESHOLDS, getCarrierCompatibilityLevelInfo, screenCarriers } from '../../src/core/carrier-selection';
import { CarrierCompatibilityLevel } from '../../src/core/types';
import type { Drug, Part } from '../../src/core/types';

function makeDrug(id: number, deltaD: number, deltaP: number, deltaH: number, r0: number): Drug {
  return { id, name: `Drug${id}`, nameEn: null, casNumber: null, hsp: { deltaD, deltaP, deltaH }, r0, molWeight: null, logP: null, therapeuticCategory: null, notes: null };
}

function makeCarrier(id: number, name: string, deltaD: number, deltaP: number, deltaH: number, r0: number): Part {
  return { id, groupId: 1, name, materialType: null, hsp: { deltaD, deltaP, deltaH }, r0, notes: null };
}

describe('classifyCarrierCompatibility', () => {
  it('RED < 0.5 → Excellent', () => { expect(classifyCarrierCompatibility(0.3)).toBe(CarrierCompatibilityLevel.Excellent); });
  it('RED = 0.0 → Excellent', () => { expect(classifyCarrierCompatibility(0.0)).toBe(CarrierCompatibilityLevel.Excellent); });
  it('RED = 0.5 → Good (境界)', () => { expect(classifyCarrierCompatibility(0.5)).toBe(CarrierCompatibilityLevel.Good); });
  it('RED = 0.7 → Good', () => { expect(classifyCarrierCompatibility(0.7)).toBe(CarrierCompatibilityLevel.Good); });
  it('RED = 0.8 → Fair (境界)', () => { expect(classifyCarrierCompatibility(0.8)).toBe(CarrierCompatibilityLevel.Fair); });
  it('RED = 0.9 → Fair', () => { expect(classifyCarrierCompatibility(0.9)).toBe(CarrierCompatibilityLevel.Fair); });
  it('RED = 1.0 → Poor (境界)', () => { expect(classifyCarrierCompatibility(1.0)).toBe(CarrierCompatibilityLevel.Poor); });
  it('RED = 1.2 → Poor', () => { expect(classifyCarrierCompatibility(1.2)).toBe(CarrierCompatibilityLevel.Poor); });
  it('RED = 1.5 → Incompatible (境界)', () => { expect(classifyCarrierCompatibility(1.5)).toBe(CarrierCompatibilityLevel.Incompatible); });
  it('RED = 2.0 → Incompatible', () => { expect(classifyCarrierCompatibility(2.0)).toBe(CarrierCompatibilityLevel.Incompatible); });
  it('負のRED値でエラー', () => { expect(() => classifyCarrierCompatibility(-0.1)).toThrow(); });
  it('カスタム閾値が適用される', () => {
    const custom = { excellentMax: 0.3, goodMax: 0.6, fairMax: 0.9, poorMax: 1.2 };
    expect(classifyCarrierCompatibility(0.2, custom)).toBe(CarrierCompatibilityLevel.Excellent);
    expect(classifyCarrierCompatibility(0.4, custom)).toBe(CarrierCompatibilityLevel.Good);
    expect(classifyCarrierCompatibility(0.7, custom)).toBe(CarrierCompatibilityLevel.Fair);
    expect(classifyCarrierCompatibility(1.0, custom)).toBe(CarrierCompatibilityLevel.Poor);
    expect(classifyCarrierCompatibility(1.5, custom)).toBe(CarrierCompatibilityLevel.Incompatible);
  });
});

describe('DEFAULT_CARRIER_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_CARRIER_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.fairMax);
    expect(t.fairMax).toBeLessThan(t.poorMax);
  });
});

describe('getCarrierCompatibilityLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [CarrierCompatibilityLevel.Excellent, CarrierCompatibilityLevel.Good, CarrierCompatibilityLevel.Fair, CarrierCompatibilityLevel.Poor, CarrierCompatibilityLevel.Incompatible];
    for (const level of levels) {
      const info = getCarrierCompatibilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenCarriers', () => {
  const drug = makeDrug(1, 17.0, 10.0, 8.0, 5.0);
  const carriers = [
    makeCarrier(1, 'CloseCarrier', 17.1, 10.1, 8.1, 5.0),
    makeCarrier(2, 'MediumCarrier', 15.0, 5.0, 4.0, 5.0),
    makeCarrier(3, 'FarCarrier', 25.0, 1.0, 1.0, 5.0),
  ];

  it('結果がRED昇順にソートされる', () => {
    const result = screenCarriers(drug, carriers);
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].red).toBeGreaterThanOrEqual(result.results[i - 1].red);
    }
  });

  it('全キャリアが結果に含まれる', () => {
    const result = screenCarriers(drug, carriers);
    expect(result.results.length).toBe(3);
  });

  it('結果にdrugが正しく設定される', () => {
    const result = screenCarriers(drug, carriers);
    expect(result.drug.id).toBe(1);
  });

  it('evaluatedAtが設定される', () => {
    const before = new Date();
    const result = screenCarriers(drug, carriers);
    expect(result.evaluatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
  });

  it('r0はキャリアのものを使用する（drugのr0ではない）', () => {
    // drug.r0=5.0, carrier.r0=10.0 → REDはcarrier.r0で計算される
    const drugSmallR0 = makeDrug(2, 17.0, 10.0, 8.0, 1.0);
    const carrierLargeR0 = makeCarrier(4, 'TestCarrier', 17.1, 10.1, 8.1, 10.0);
    const result = screenCarriers(drugSmallR0, [carrierLargeR0]);
    // RED = Ra / carrier.r0(10.0) → small value
    expect(result.results[0].red).toBeLessThan(1.0);
    expect(result.results[0].compatibility).toBe(CarrierCompatibilityLevel.Excellent);
  });
});
