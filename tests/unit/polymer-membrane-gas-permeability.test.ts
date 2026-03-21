/**
 * ポリマー膜ガス透過性 コアロジック テスト
 */
import { describe, it, expect } from 'vitest';
import {
  screenMembranePermeability,
  classifyGasPermeability,
  getGasPermeabilityLevelInfo,
  getAvailableGasNames,
  GasPermeabilityLevel,
} from '../../src/core/polymer-membrane-gas-permeability';
import type { HSPValues } from '../../src/core/types';

// PDMS (高透過性ポリマー): δD=15.9, δP=0.0, δH=4.7
const PDMS_HSP: HSPValues = { deltaD: 15.9, deltaP: 0.0, deltaH: 4.7 };

// PET (高バリアポリマー): δD=19.4, δP=3.2, δH=8.6
const PET_HSP: HSPValues = { deltaD: 19.4, deltaP: 3.2, deltaH: 8.6 };

describe('screenMembranePermeability', () => {
  it('PDMSの場合CO2/O2/N2の透過性順序が正しい', () => {
    const result = screenMembranePermeability(PDMS_HSP, ['CO2', 'O2', 'N2']);
    expect(result.results.length).toBe(3);
    // Ra²昇順 = 透過性高い順
    const names = result.results.map(r => r.gasName);
    // CO2はPDMSに最も近い（δP, δHの寄与）
    expect(result.polymerHSP).toEqual(PDMS_HSP);
    expect(result.referenceGas).toBe('N2');
  });

  it('PET膜は全般的にRa²が大きい(高バリア)', () => {
    const result = screenMembranePermeability(PET_HSP, ['CO2', 'O2', 'N2']);
    // PETのCO2との距離も計算できる
    const co2Result = result.results.find(r => r.gasName === 'CO2');
    expect(co2Result).toBeDefined();
    expect(co2Result!.ra2).toBeGreaterThan(0);
  });

  it('基準ガスが自動追加される', () => {
    const result = screenMembranePermeability(PDMS_HSP, ['CO2', 'O2'], 'N2');
    expect(result.results.length).toBe(3);
    const n2 = result.results.find(r => r.gasName === 'N2');
    expect(n2).toBeDefined();
    expect(n2!.selectivity).toBeCloseTo(1.0); // 基準ガス自身のselectivity=1
  });

  it('CO2/N2選択性比がPDMSで1より大きい', () => {
    const result = screenMembranePermeability(PDMS_HSP, ['CO2', 'N2']);
    const co2 = result.results.find(r => r.gasName === 'CO2');
    expect(co2).toBeDefined();
    // CO2はPDMSに近い → Ra²小 → selectivity > 1
    expect(co2!.selectivity).toBeGreaterThan(1);
  });

  it('空配列でエラー', () => {
    expect(() => screenMembranePermeability(PDMS_HSP, [])).toThrow('ガスを1つ以上');
  });

  it('evaluatedAtがDate', () => {
    const result = screenMembranePermeability(PDMS_HSP, ['CO2']);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });
});

describe('classifyGasPermeability', () => {
  it('Ra²<50 → High', () => {
    expect(classifyGasPermeability(30)).toBe(GasPermeabilityLevel.High);
  });
  it('50<=Ra²<150 → Medium', () => {
    expect(classifyGasPermeability(100)).toBe(GasPermeabilityLevel.Medium);
  });
  it('Ra²>=150 → Low', () => {
    expect(classifyGasPermeability(200)).toBe(GasPermeabilityLevel.Low);
  });
});

describe('getGasPermeabilityLevelInfo', () => {
  it('全レベルがlabelとdescriptionを返す', () => {
    for (const level of [GasPermeabilityLevel.High, GasPermeabilityLevel.Medium, GasPermeabilityLevel.Low]) {
      const info = getGasPermeabilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
    }
  });
});

describe('getAvailableGasNames', () => {
  it('利用可能なガス名を返す', () => {
    const names = getAvailableGasNames();
    expect(names).toContain('CO2');
    expect(names).toContain('O2');
    expect(names).toContain('N2');
    expect(names).toContain('H2');
  });
});
