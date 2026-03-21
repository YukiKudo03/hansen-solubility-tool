import { describe, it, expect } from 'vitest';
import {
  importMDResults,
  validateCEDInput,
} from '../../src/core/md-hsp-import';
import type { CEDComponents } from '../../src/core/md-hsp-import';

describe('validateCEDInput', () => {
  it('有効な入力でnullを返す', () => {
    expect(validateCEDInput(
      { totalCED: 337, dispersionCED: 300, polarCED: 25, hbondCED: 12 },
      106.8,
    )).toBeNull();
  });

  it('全CED値が負でエラー', () => {
    expect(validateCEDInput(
      { totalCED: -1, dispersionCED: 0, polarCED: 0, hbondCED: 0 }, 100,
    )).toContain('全CED');
  });

  it('分散力CED値が負でエラー', () => {
    expect(validateCEDInput(
      { totalCED: 100, dispersionCED: -1, polarCED: 0, hbondCED: 0 }, 100,
    )).toContain('分散力CED');
  });

  it('極性CED値が負でエラー', () => {
    expect(validateCEDInput(
      { totalCED: 100, dispersionCED: 0, polarCED: -1, hbondCED: 0 }, 100,
    )).toContain('極性CED');
  });

  it('水素結合CED値が負でエラー', () => {
    expect(validateCEDInput(
      { totalCED: 100, dispersionCED: 0, polarCED: 0, hbondCED: -1 }, 100,
    )).toContain('水素結合CED');
  });

  it('モル体積が0以下でエラー', () => {
    expect(validateCEDInput(
      { totalCED: 100, dispersionCED: 100, polarCED: 0, hbondCED: 0 }, 0,
    )).toContain('モル体積');
  });
});

describe('importMDResults', () => {
  // Toluene: δD=18.0, δP=1.4, δH=2.0
  // CED成分: δD²=324, δP²=1.96, δH²=4.0
  it('TolueneのCED値からHSPを逆算', () => {
    const ced: CEDComponents = {
      totalCED: 324 + 1.96 + 4.0,  // ≈ 330
      dispersionCED: 324,  // 18.0² = 324
      polarCED: 1.96,      // 1.4² = 1.96
      hbondCED: 4.0,       // 2.0² = 4.0
    };
    const result = importMDResults(ced, 106.8);
    expect(result.hsp.deltaD).toBeCloseTo(18.0, 1);
    expect(result.hsp.deltaP).toBeCloseTo(1.4, 1);
    expect(result.hsp.deltaH).toBeCloseTo(2.0, 1);
  });

  // Ethanol: δD=15.8, δP=8.8, δH=19.4
  it('EthanolのCED値からHSPを逆算', () => {
    const ced: CEDComponents = {
      totalCED: 15.8**2 + 8.8**2 + 19.4**2,
      dispersionCED: 15.8**2,
      polarCED: 8.8**2,
      hbondCED: 19.4**2,
    };
    const result = importMDResults(ced, 58.5);
    expect(result.hsp.deltaD).toBeCloseTo(15.8, 1);
    expect(result.hsp.deltaP).toBeCloseTo(8.8, 1);
    expect(result.hsp.deltaH).toBeCloseTo(19.4, 1);
  });

  it('全フィールドが含まれる', () => {
    const ced: CEDComponents = {
      totalCED: 300, dispersionCED: 250, polarCED: 30, hbondCED: 20,
    };
    const result = importMDResults(ced, 100);
    expect(result.hsp).toBeDefined();
    expect(result.ced).toBeDefined();
    expect(result.molarVolume).toBe(100);
    expect(result.totalSolubilityParameter).toBeGreaterThan(0);
    expect(result.consistency).toBeGreaterThanOrEqual(0);
    expect(result.consistency).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('成分の合計がtotalCEDと一致するとき整合性が高い', () => {
    const dD = 18.0, dP = 1.4, dH = 2.0;
    const ced: CEDComponents = {
      totalCED: dD*dD + dP*dP + dH*dH,
      dispersionCED: dD*dD,
      polarCED: dP*dP,
      hbondCED: dH*dH,
    };
    const result = importMDResults(ced, 100);
    expect(result.consistency).toBeGreaterThan(95);
  });

  it('成分の合計とtotalCEDが大きく異なるとき警告を出す', () => {
    const ced: CEDComponents = {
      totalCED: 1000,  // 合計と大きく乖離
      dispersionCED: 100,
      polarCED: 10,
      hbondCED: 5,
    };
    const result = importMDResults(ced, 100);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.consistency).toBeLessThan(90);
  });

  it('CED値が全て0のとき正常に処理', () => {
    const ced: CEDComponents = {
      totalCED: 0, dispersionCED: 0, polarCED: 0, hbondCED: 0,
    };
    const result = importMDResults(ced, 100);
    expect(result.hsp.deltaD).toBe(0);
    expect(result.hsp.deltaP).toBe(0);
    expect(result.hsp.deltaH).toBe(0);
    expect(result.consistency).toBe(100);
  });

  it('不正なCED入力でエラーをスロー', () => {
    expect(() => importMDResults(
      { totalCED: -1, dispersionCED: 0, polarCED: 0, hbondCED: 0 }, 100,
    )).toThrow();
  });
});
