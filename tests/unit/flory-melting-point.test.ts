/**
 * NL05: Flory希釈理論による融点降下計算のテスト
 *
 * 数式: 1/Td - 1/Tm0 = (R/dHu) * (Vu/V1) * (phi1 - chi*phi1^2)
 *   Td: 溶解温度 [K]
 *   Tm0: 純ポリマー融点 [K]
 *   dHu: 繰り返し単位あたりの融解熱 [J/mol]
 *   Vu: 繰り返し単位モル体積 [cm³/mol]
 *   V1: 溶媒モル体積 [cm³/mol]
 *   phi1: 溶媒体積分率
 *   chi: Flory-Huggins相互作用パラメータ
 *
 * 文献:
 * - Flory (1953) Principles of Polymer Chemistry, Cornell University Press
 * - Tian et al. (2013) Mol. Pharmaceutics 10:236
 */
import { describe, it, expect } from 'vitest';

import {
  calculateDissolutionTemperature,
  estimateMeltingPointDepression,
} from '../../src/core/flory-melting-point';

const R_GAS = 8.314;

describe('calculateDissolutionTemperature', () => {
  it('chi=0（理想溶液）ではTdがTm0から大きく降下する', () => {
    // PEO-like: Tm0=338K, dHu=8700 J/mol, Vu=38.9 cm³/mol
    const td = calculateDissolutionTemperature({
      tm0: 338,
      deltaHu: 8700,
      vu: 38.9,
      v1: 89.4, // benzene
      phi1: 0.5,
      chi: 0,
    });
    expect(td).toBeLessThan(338);
    expect(td).toBeGreaterThan(200); // 妥当な範囲
  });

  it('chi増加で溶解温度が上昇する（溶けにくくなる）', () => {
    const params = { tm0: 338, deltaHu: 8700, vu: 38.9, v1: 89.4, phi1: 0.5 };
    const td0 = calculateDissolutionTemperature({ ...params, chi: 0 });
    const td1 = calculateDissolutionTemperature({ ...params, chi: 0.5 });
    const td2 = calculateDissolutionTemperature({ ...params, chi: 1.0 });
    expect(td1).toBeGreaterThan(td0);
    expect(td2).toBeGreaterThan(td1);
  });

  it('phi1=0（純ポリマー）ではTd=Tm0', () => {
    const td = calculateDissolutionTemperature({
      tm0: 338,
      deltaHu: 8700,
      vu: 38.9,
      v1: 89.4,
      phi1: 0,
      chi: 0.5,
    });
    expect(td).toBeCloseTo(338, 0);
  });

  it('phi1増加で溶解温度が降下する', () => {
    const base = { tm0: 338, deltaHu: 8700, vu: 38.9, v1: 89.4, chi: 0.3 };
    const td_low = calculateDissolutionTemperature({ ...base, phi1: 0.1 });
    const td_high = calculateDissolutionTemperature({ ...base, phi1: 0.8 });
    expect(td_high).toBeLessThan(td_low);
  });
});

describe('estimateMeltingPointDepression', () => {
  it('融点降下量が正の値', () => {
    const dT = estimateMeltingPointDepression({
      tm0: 338,
      deltaHu: 8700,
      vu: 38.9,
      v1: 89.4,
      phi1: 0.5,
      chi: 0.3,
    });
    expect(dT).toBeGreaterThan(0);
  });

  it('chi=0で最大降下', () => {
    const base = { tm0: 338, deltaHu: 8700, vu: 38.9, v1: 89.4, phi1: 0.5 };
    const dT_ideal = estimateMeltingPointDepression({ ...base, chi: 0 });
    const dT_real = estimateMeltingPointDepression({ ...base, chi: 0.5 });
    expect(dT_ideal).toBeGreaterThan(dT_real);
  });

  it('典型値: PEO系で10-50Kの降下範囲', () => {
    const dT = estimateMeltingPointDepression({
      tm0: 338,
      deltaHu: 8700,
      vu: 38.9,
      v1: 89.4,
      phi1: 0.5,
      chi: 0.3,
    });
    expect(dT).toBeGreaterThan(5);
    expect(dT).toBeLessThan(80);
  });
});
