/**
 * 圧力依存HSP補正ツール — ユニットテスト
 */
import { describe, it, expect } from 'vitest';
import { correctHSPForPressure, estimateCO2HSP, CO2_CRITICAL_CONSTANTS } from '../../src/core/pressure-hsp';

describe('pressure-hsp: correctHSPForPressure', () => {
  it('基準圧力と同じ場合はHSPが変化しない', () => {
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const result = correctHSPForPressure(hsp, 0.1, 0.1, 300);
    expect(result.deltaD).toBeCloseTo(18.0, 5);
    expect(result.deltaP).toBeCloseTo(1.4, 5);
    expect(result.deltaH).toBeCloseTo(2.0, 5);
  });

  it('一般液体の高圧補正: 圧力上昇でHSP増加', () => {
    // トルエン at 0.1MPa → 100MPa, βT = 1e-3
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    const result = correctHSPForPressure(hsp, 0.1, 100, 300, 1e-3);
    // Vm(P)/Vm(P0) = 1 - 1e-3 * 99.9 = 0.9001 → factor = 1/sqrt(0.9001) ≈ 1.054
    expect(result.deltaD).toBeGreaterThan(18.0);
    expect(result.deltaP).toBeGreaterThan(1.4);
    expect(result.deltaH).toBeGreaterThan(2.0);
    // 約5%増加
    expect(result.deltaD).toBeCloseTo(18.0 / Math.sqrt(1 - 1e-3 * 99.9), 2);
  });

  it('圧力減少でHSP減少', () => {
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    // 高圧→低圧（非物理的だが数学的にはOK）
    const result = correctHSPForPressure(hsp, 100, 0.1, 300, 1e-3);
    expect(result.deltaD).toBeLessThan(18.0);
  });

  it('極端な圧力でsafe volumeRatio制限が適用', () => {
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    // 非常に高い圧力: volumeRatio < 0.5 → clamped to 0.5
    const result = correctHSPForPressure(hsp, 0.1, 1000, 300, 1e-3);
    // factor = 1/sqrt(0.5) ≈ 1.414
    expect(result.deltaD).toBeCloseTo(18.0 * Math.sqrt(2), 1);
  });

  it('温度0以下でエラー', () => {
    const hsp = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
    expect(() => correctHSPForPressure(hsp, 0.1, 10, 0)).toThrow();
  });
});

describe('pressure-hsp: estimateCO2HSP', () => {
  it('20MPa, 313K での超臨界CO2 HSP推定', () => {
    const result = estimateCO2HSP(20, 313);
    // 文献値: δt ≈ 15.8 MPa^0.5
    expect(result.deltaTotal).toBeGreaterThan(10);
    expect(result.deltaTotal).toBeLessThan(25);
    // HSP成分の合計二乗がδt²と一致
    const dt2 = result.deltaD ** 2 + result.deltaP ** 2 + result.deltaH ** 2;
    expect(dt2).toBeCloseTo(result.deltaTotal ** 2, 1);
    // 密度チェック
    expect(result.density).toBeGreaterThan(500);
    expect(result.density).toBeLessThan(1000);
  });

  it('10MPa, 313K: 低圧ではδtが小さい', () => {
    const result10 = estimateCO2HSP(10, 313);
    const result20 = estimateCO2HSP(20, 313);
    expect(result10.deltaTotal).toBeLessThan(result20.deltaTotal);
  });

  it('圧力0以下でエラー', () => {
    expect(() => estimateCO2HSP(0, 313)).toThrow();
  });

  it('温度0以下でエラー', () => {
    expect(() => estimateCO2HSP(20, 0)).toThrow();
  });

  it('HSP成分比: dD > dP > dH', () => {
    const result = estimateCO2HSP(20, 313);
    expect(result.deltaD).toBeGreaterThan(result.deltaP);
    expect(result.deltaP).toBeGreaterThan(result.deltaH);
  });
});
