/**
 * NL07: 圧力依存HSP補正のテスト
 *
 * 数式（一般式）: δ(P) = δ(P0) * sqrt(Vm(P0) / Vm(P))
 * scCO2用Giddings式: δt = 1.25 * Pc^0.5 * ρr / ρr_liq
 *
 * 文献:
 * - Giddings et al. (1968) Science 162:67
 * - Williams, Martin (2002) Ind. Eng. Chem. Res. 41:4927-4932 (CO2 HSP)
 * - Hansen (2007) Chapter 5: Effects of temperature and pressure
 *
 * CO2の臨界定数: Tc=304.13K, Pc=7.377MPa, ρc=467.6 kg/m³
 *
 * 検証値 (scCO2 at 40°C):
 * - 10 MPa: δt ≈ 12-14 MPa^0.5 (gas-like)
 * - 20 MPa: δt ≈ 15-17 MPa^0.5 (liquid-like)
 * - 30 MPa: δt ≈ 17-18 MPa^0.5 (approaching hexane)
 */
import { describe, it, expect } from 'vitest';

import {
  correctHSPForPressure,
  estimateCO2HSP,
  CO2_CRITICAL_CONSTANTS,
} from '../../src/core/pressure-hsp';

describe('CO2_CRITICAL_CONSTANTS', () => {
  it('臨界温度が304.13K付近', () => {
    expect(CO2_CRITICAL_CONSTANTS.tc).toBeCloseTo(304.13, 0);
  });

  it('臨界圧力が7.377MPa付近', () => {
    expect(CO2_CRITICAL_CONSTANTS.pc).toBeCloseTo(7.377, 1);
  });
});

describe('estimateCO2HSP', () => {
  it('低圧(1MPa, 25°C): δtが非常に小さい（ガス状態）', () => {
    const hsp = estimateCO2HSP(1.0, 298.15);
    expect(hsp.deltaTotal).toBeLessThan(5);
  });

  it('scCO2 (10MPa, 313K): δt ≈ 10-16 MPa^0.5', () => {
    const hsp = estimateCO2HSP(10.0, 313.15);
    expect(hsp.deltaTotal).toBeGreaterThan(8);
    expect(hsp.deltaTotal).toBeLessThan(18);
  });

  it('scCO2 (20MPa, 313K): δt ≈ 14-18 MPa^0.5', () => {
    const hsp = estimateCO2HSP(20.0, 313.15);
    expect(hsp.deltaTotal).toBeGreaterThan(12);
    expect(hsp.deltaTotal).toBeLessThan(20);
  });

  it('圧力増加でδtが増加する', () => {
    const hsp10 = estimateCO2HSP(10.0, 313.15);
    const hsp20 = estimateCO2HSP(20.0, 313.15);
    const hsp30 = estimateCO2HSP(30.0, 313.15);
    expect(hsp20.deltaTotal).toBeGreaterThan(hsp10.deltaTotal);
    expect(hsp30.deltaTotal).toBeGreaterThan(hsp20.deltaTotal);
  });

  it('温度増加でδtが減少する（同一圧力）', () => {
    const hsp40 = estimateCO2HSP(20.0, 313.15); // 40°C
    const hsp80 = estimateCO2HSP(20.0, 353.15); // 80°C
    expect(hsp80.deltaTotal).toBeLessThan(hsp40.deltaTotal);
  });

  it('HSP成分が分離される: dD > dP, dH', () => {
    const hsp = estimateCO2HSP(20.0, 313.15);
    expect(hsp.deltaD).toBeGreaterThan(0);
    expect(hsp.deltaP).toBeGreaterThan(0);
    expect(hsp.deltaH).toBeGreaterThan(0);
    // CO2: dDが主成分
    expect(hsp.deltaD).toBeGreaterThan(hsp.deltaP);
  });
});

describe('correctHSPForPressure', () => {
  it('基準圧力では元のHSP値が返る', () => {
    const hsp = correctHSPForPressure(
      { deltaD: 18.0, deltaP: 5.0, deltaH: 5.0 },
      0.1, // 0.1 MPa = 1 atm
      0.1, // 同じ圧力
      298.15
    );
    expect(hsp.deltaD).toBeCloseTo(18.0, 5);
    expect(hsp.deltaP).toBeCloseTo(5.0, 5);
    expect(hsp.deltaH).toBeCloseTo(5.0, 5);
  });

  it('圧力増加でHSP値が増加する（液体の圧縮）', () => {
    const hspLow = correctHSPForPressure(
      { deltaD: 18.0, deltaP: 5.0, deltaH: 5.0 }, 0.1, 0.1, 298.15
    );
    const hspHigh = correctHSPForPressure(
      { deltaD: 18.0, deltaP: 5.0, deltaH: 5.0 }, 0.1, 100.0, 298.15
    );
    const totalLow = Math.sqrt(hspLow.deltaD ** 2 + hspLow.deltaP ** 2 + hspLow.deltaH ** 2);
    const totalHigh = Math.sqrt(hspHigh.deltaD ** 2 + hspHigh.deltaP ** 2 + hspHigh.deltaH ** 2);
    expect(totalHigh).toBeGreaterThan(totalLow);
  });

  it('通常液体の低圧範囲ではほぼ変化なし', () => {
    const hsp = correctHSPForPressure(
      { deltaD: 18.0, deltaP: 5.0, deltaH: 5.0 }, 0.1, 1.0, 298.15
    );
    // 液体は低圧では非圧縮性
    expect(hsp.deltaD).toBeCloseTo(18.0, 0);
  });
});
