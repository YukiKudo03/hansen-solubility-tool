/**
 * 膜分離選択性 コアロジック テスト
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateSeparationSelectivity,
  classifySelectivity,
  getSelectivityLevelInfo,
  SelectivityLevel,
} from '../../src/core/membrane-separation-selectivity';
import { GAS_HSP_DATABASE } from '../../src/core/gas-solubility';
import type { HSPValues } from '../../src/core/types';

// PEO系膜 (CO2選択膜): δD=17.3, δP=3.0, δH=9.4
const PEO_MEMBRANE_HSP: HSPValues = { deltaD: 17.3, deltaP: 3.0, deltaH: 9.4 };

describe('evaluateSeparationSelectivity', () => {
  it('CO2/N2分離でPEO膜はCO2側がRa小(選択的)', () => {
    const result = evaluateSeparationSelectivity(
      PEO_MEMBRANE_HSP,
      GAS_HSP_DATABASE.CO2,
      'CO2',
      GAS_HSP_DATABASE.N2,
      'N2',
    );

    expect(result.targetName).toBe('CO2');
    expect(result.impurityName).toBe('N2');
    // CO2はPEOに近い → targetRa < impurityRa
    expect(result.targetRa).toBeLessThan(result.impurityRa);
    // selectivityRatio > 1 (CO2が選択的に透過)
    expect(result.selectivityRatio).toBeGreaterThan(1);
  });

  it('同じ成分同士で選択性1.0', () => {
    const result = evaluateSeparationSelectivity(
      PEO_MEMBRANE_HSP,
      GAS_HSP_DATABASE.CO2,
      'CO2',
      GAS_HSP_DATABASE.CO2,
      'CO2-dup',
    );

    expect(result.selectivityRatio).toBeCloseTo(1.0);
  });

  it('evaluatedAtがDate', () => {
    const result = evaluateSeparationSelectivity(
      PEO_MEMBRANE_HSP,
      GAS_HSP_DATABASE.CO2,
      'CO2',
      GAS_HSP_DATABASE.N2,
      'N2',
    );
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('結果にHSP値が含まれる', () => {
    const result = evaluateSeparationSelectivity(
      PEO_MEMBRANE_HSP,
      GAS_HSP_DATABASE.CO2,
      'CO2',
      GAS_HSP_DATABASE.N2,
      'N2',
    );
    expect(result.membraneHSP).toEqual(PEO_MEMBRANE_HSP);
    expect(result.targetHSP).toEqual(GAS_HSP_DATABASE.CO2);
    expect(result.impurityHSP).toEqual(GAS_HSP_DATABASE.N2);
  });
});

describe('classifySelectivity', () => {
  it('ratio>=5.0 → Excellent', () => {
    expect(classifySelectivity(5.0)).toBe(SelectivityLevel.Excellent);
    expect(classifySelectivity(10.0)).toBe(SelectivityLevel.Excellent);
  });
  it('2.0<=ratio<5.0 → Good', () => {
    expect(classifySelectivity(2.0)).toBe(SelectivityLevel.Good);
    expect(classifySelectivity(4.9)).toBe(SelectivityLevel.Good);
  });
  it('1.2<=ratio<2.0 → Moderate', () => {
    expect(classifySelectivity(1.2)).toBe(SelectivityLevel.Moderate);
    expect(classifySelectivity(1.9)).toBe(SelectivityLevel.Moderate);
  });
  it('ratio<1.2 → Poor', () => {
    expect(classifySelectivity(1.0)).toBe(SelectivityLevel.Poor);
    expect(classifySelectivity(0.5)).toBe(SelectivityLevel.Poor);
  });
});

describe('getSelectivityLevelInfo', () => {
  it('全レベルがlabelとdescriptionを返す', () => {
    for (const level of [SelectivityLevel.Excellent, SelectivityLevel.Good, SelectivityLevel.Moderate, SelectivityLevel.Poor]) {
      const info = getSelectivityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
    }
  });
});
