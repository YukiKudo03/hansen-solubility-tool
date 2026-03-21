/**
 * NL01: Flory-Huggins chi パラメータ計算のテスト
 *
 * 文献値:
 * - Lindvig, Michelsen, Kontogeorgis (2002) Fluid Phase Equilibria 203:247-260
 * - PPPDB Chi Parameter Database, University of Chicago
 * - Abbott, Practical Adhesion Science HSP
 */
import { describe, it, expect } from 'vitest';

// テスト対象の関数（実装前）
import {
  calculateFloryHugginsChi,
  calculateChiCritical,
  assessMiscibility,
} from '../../src/core/flory-huggins';

const R = 8.314; // J/(mol·K)
const T_25C = 298.15; // K

// ===== ポリマーHSP (MPa^0.5) =====
const PS = { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 };
const PMMA = { deltaD: 18.6, deltaP: 10.5, deltaH: 5.1 };

// ===== 溶媒データ =====
const TOLUENE = { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 };
const TOLUENE_VM = 106.8; // cm³/mol

const ACETONE = { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 };
const ACETONE_VM = 74.0;

const CHLOROFORM = { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 };
const CHLOROFORM_VM = 80.7;

const BENZENE = { deltaD: 18.4, deltaP: 0.0, deltaH: 2.0 };
const BENZENE_VM = 89.4;

describe('calculateFloryHugginsChi', () => {
  it('PS-Toluene at 25°C: chi理論値が計算可能', () => {
    // Ra² = 4*(0.5)² + (3.1)² + (0.9)² = 1.0 + 9.61 + 0.81 = 11.42
    // chi = Vm * Ra² / (6 * R * T) = 106.8 * 11.42 / (6 * 8.314 * 298.15)
    const result = calculateFloryHugginsChi(PS, TOLUENE, TOLUENE_VM, T_25C);
    expect(result).toBeGreaterThan(0);
    // 理論値 ≈ 0.082 (未補正)
    expect(result).toBeCloseTo(0.082, 2);
  });

  it('PS-Acetone at 25°C: chiがPS-Tolueneより大きい（悪溶媒）', () => {
    const chiToluene = calculateFloryHugginsChi(PS, TOLUENE, TOLUENE_VM, T_25C);
    const chiAcetone = calculateFloryHugginsChi(PS, ACETONE, ACETONE_VM, T_25C);
    expect(chiAcetone).toBeGreaterThan(chiToluene);
  });

  it('PMMA-Chloroform at 25°C: chi理論値が妥当な範囲', () => {
    // Ra² = 4*(0.8)² + (7.4)² + (-0.6)² = 2.56 + 54.76 + 0.36 = 57.68
    // chi = 80.7 * 57.68 / 14874.8 ≈ 0.313
    const result = calculateFloryHugginsChi(PMMA, CHLOROFORM, CHLOROFORM_VM, T_25C);
    expect(result).toBeCloseTo(0.313, 2);
  });

  it('PMMA-Acetone at 25°C: chi理論値', () => {
    // Ra² = 4*(3.1)² + (0.1)² + (-1.9)² = 38.44 + 0.01 + 3.61 = 42.06
    // chi = 74.0 * 42.06 / 14874.8 ≈ 0.209
    const result = calculateFloryHugginsChi(PMMA, ACETONE, ACETONE_VM, T_25C);
    expect(result).toBeCloseTo(0.209, 2);
  });

  it('PS-Chloroform at 25°C: 低chi値（良溶媒）', () => {
    // Ra² = 4*(0.7)² + (1.4)² + (-2.8)² = 1.96 + 1.96 + 7.84 = 11.76
    // chi = 80.7 * 11.76 / 14874.8 ≈ 0.064
    const result = calculateFloryHugginsChi(PS, CHLOROFORM, CHLOROFORM_VM, T_25C);
    expect(result).toBeCloseTo(0.064, 2);
  });

  it('温度上昇でchiが減少する', () => {
    const chi25 = calculateFloryHugginsChi(PS, TOLUENE, TOLUENE_VM, 298.15);
    const chi65 = calculateFloryHugginsChi(PS, TOLUENE, TOLUENE_VM, 338.15);
    expect(chi65).toBeLessThan(chi25);
  });

  it('同一HSPでchi = 0', () => {
    const result = calculateFloryHugginsChi(PS, PS, 100, T_25C);
    expect(result).toBe(0);
  });

  it('溶媒/ポリマーの順序を逆にしても同じ値', () => {
    const chi1 = calculateFloryHugginsChi(PS, TOLUENE, TOLUENE_VM, T_25C);
    const chi2 = calculateFloryHugginsChi(TOLUENE, PS, TOLUENE_VM, T_25C);
    expect(chi1).toBeCloseTo(chi2, 10);
  });

  it('良溶媒のランキングが実験値と一致', () => {
    // PS溶媒のchiランキング: Chloroform < Toluene < Benzene < Acetone
    const chiCHCl3 = calculateFloryHugginsChi(PS, CHLOROFORM, CHLOROFORM_VM, T_25C);
    const chiTol = calculateFloryHugginsChi(PS, TOLUENE, TOLUENE_VM, T_25C);
    const chiBenz = calculateFloryHugginsChi(PS, BENZENE, BENZENE_VM, T_25C);
    const chiAcet = calculateFloryHugginsChi(PS, ACETONE, ACETONE_VM, T_25C);

    expect(chiCHCl3).toBeLessThan(chiTol);
    expect(chiTol).toBeLessThan(chiBenz);
    expect(chiBenz).toBeLessThan(chiAcet);
  });
});

describe('calculateChiCritical', () => {
  it('対称ブレンド(N1=N2=100): chi_c = 0.02', () => {
    // chi_c = 0.5 * (1/sqrt(100) + 1/sqrt(100))^2 = 0.5 * (0.1+0.1)^2 = 0.02
    const chiC = calculateChiCritical(100, 100);
    expect(chiC).toBeCloseTo(0.02, 4);
  });

  it('非対称ブレンド(N1=100, N2=1000)', () => {
    // chi_c = 0.5 * (1/sqrt(100) + 1/sqrt(1000))^2 = 0.5 * (0.1 + 0.0316)^2
    // = 0.5 * 0.01732 = 0.00866
    const chiC = calculateChiCritical(100, 1000);
    expect(chiC).toBeCloseTo(0.00866, 4);
  });

  it('N→∞で chi_c→0', () => {
    const chiC = calculateChiCritical(100000, 100000);
    expect(chiC).toBeLessThan(0.001);
  });

  it('ポリマー-溶媒(N2=1): chi_c = 0.5 * (1/sqrt(N1) + 1)^2 ≈ 0.5', () => {
    const chiC = calculateChiCritical(1000, 1);
    expect(chiC).toBeCloseTo(0.5321, 3);
  });
});

describe('assessMiscibility', () => {
  it('chi < chi_critical → miscible', () => {
    const result = assessMiscibility(0.01, 0.02);
    expect(result).toBe('miscible');
  });

  it('chi > chi_critical → immiscible', () => {
    const result = assessMiscibility(0.05, 0.02);
    expect(result).toBe('immiscible');
  });

  it('chi ≈ chi_critical → partial (境界)', () => {
    const result = assessMiscibility(0.020, 0.020);
    expect(result).toBe('partial');
  });
});
