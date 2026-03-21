/**
 * CO2吸収材選定 コアロジック テスト
 */
import { describe, it, expect } from 'vitest';
import {
  screenCO2Absorbents,
  classifyCO2Absorption,
  getCO2AbsorptionLevelInfo,
  CO2AbsorptionLevel,
} from '../../src/core/co2-absorbent-selection';
import type { CO2Absorbent } from '../../src/core/co2-absorbent-selection';

// MEA (モノエタノールアミン): δD=17.2, δP=10.4, δH=21.3, R0=12.0
const MEA: CO2Absorbent = {
  name: 'MEA (モノエタノールアミン)',
  hsp: { deltaD: 17.2, deltaP: 10.4, deltaH: 21.3 },
  r0: 12.0,
};

// MDEA (メチルジエタノールアミン): δD=17.0, δP=8.0, δH=15.0, R0=10.0
const MDEA: CO2Absorbent = {
  name: 'MDEA',
  hsp: { deltaD: 17.0, deltaP: 8.0, deltaH: 15.0 },
  r0: 10.0,
};

// PEI (ポリエチレンイミン): δD=17.5, δP=12.0, δH=18.0, R0=11.0
const PEI: CO2Absorbent = {
  name: 'PEI (ポリエチレンイミン)',
  hsp: { deltaD: 17.5, deltaP: 12.0, deltaH: 18.0 },
  r0: 11.0,
};

describe('screenCO2Absorbents', () => {
  it('MEA, MDEA, PEIのスクリーニング結果がRa昇順', () => {
    const result = screenCO2Absorbents([MEA, MDEA, PEI]);
    expect(result.results.length).toBe(3);
    // Ra昇順であること
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].ra).toBeGreaterThanOrEqual(result.results[i - 1].ra);
    }
  });

  it('CO2のHSPが正しい', () => {
    const result = screenCO2Absorbents([MEA]);
    // CO2 HSP from GAS_HSP_DATABASE
    expect(result.co2HSP.deltaD).toBeCloseTo(15.6);
    expect(result.co2HSP.deltaP).toBeCloseTo(5.2);
    expect(result.co2HSP.deltaH).toBeCloseTo(5.8);
  });

  it('各結果にra, red, absorptionLevelが含まれる', () => {
    const result = screenCO2Absorbents([MEA, MDEA]);
    for (const r of result.results) {
      expect(r.ra).toBeGreaterThan(0);
      expect(r.red).toBeGreaterThan(0);
      expect(r.absorptionLevel).toBeDefined();
      expect(r.absorbent).toBeTruthy();
    }
  });

  it('空配列でエラー', () => {
    expect(() => screenCO2Absorbents([])).toThrow('吸収材候補を1つ以上');
  });

  it('evaluatedAtがDate', () => {
    const result = screenCO2Absorbents([MEA]);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });
});

describe('classifyCO2Absorption', () => {
  it('RED<0.5 → Excellent', () => {
    expect(classifyCO2Absorption(0.3)).toBe(CO2AbsorptionLevel.Excellent);
  });
  it('0.5<=RED<1.0 → Good', () => {
    expect(classifyCO2Absorption(0.5)).toBe(CO2AbsorptionLevel.Good);
    expect(classifyCO2Absorption(0.9)).toBe(CO2AbsorptionLevel.Good);
  });
  it('1.0<=RED<1.5 → Moderate', () => {
    expect(classifyCO2Absorption(1.0)).toBe(CO2AbsorptionLevel.Moderate);
  });
  it('RED>=1.5 → Poor', () => {
    expect(classifyCO2Absorption(1.5)).toBe(CO2AbsorptionLevel.Poor);
    expect(classifyCO2Absorption(3.0)).toBe(CO2AbsorptionLevel.Poor);
  });
});

describe('getCO2AbsorptionLevelInfo', () => {
  it('全レベルがlabelとdescriptionを返す', () => {
    for (const level of [CO2AbsorptionLevel.Excellent, CO2AbsorptionLevel.Good, CO2AbsorptionLevel.Moderate, CO2AbsorptionLevel.Poor]) {
      const info = getCO2AbsorptionLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
    }
  });
});
