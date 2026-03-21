/**
 * NL06: ESC (環境応力亀裂) バンド型判定のテスト
 *
 * 文献値:
 * - Hansen (2000) Ind. Eng. Chem. Res. 39:4422-4426
 * - Pirika ESC Chapter: PC ESC-adjusted sphere (dD=21.0, dP=7.6, dH=4.4, R0=10.2)
 * - GMP Plastic PC Chemical Compatibility ratings
 *
 * ESCバンド型: RED 0.7-1.3が最危険帯
 * - RED < 0.7: 溶解/著しい膨潤 (dissolution)
 * - 0.7 ≤ RED ≤ 1.3: ESC危険帯 (cracking)
 * - RED > 1.3: 相互作用不足で安全 (safe)
 */
import { describe, it, expect } from 'vitest';

import {
  classifyESCRisk,
  ESCRiskLevel,
  DEFAULT_ESC_THRESHOLDS,
} from '../../src/core/esc-classification';
import { calculateRa, calculateRed } from '../../src/core/hsp';

// PC ESC-adjusted sphere (Hansen/Pirika)
const PC_ESC = { deltaD: 21.0, deltaP: 7.6, deltaH: 4.4 };
const PC_R0 = 10.2;

// ===== 溶媒HSP (MPa^0.5) =====
const solvents = {
  dichloromethane: { deltaD: 18.2, deltaP: 6.3, deltaH: 6.1 },
  chloroform: { deltaD: 17.8, deltaP: 3.1, deltaH: 5.7 },
  toluene: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
  acetone: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 },
  mek: { deltaD: 16.0, deltaP: 9.0, deltaH: 5.1 },
  thf: { deltaD: 16.8, deltaP: 5.7, deltaH: 8.0 },
  dmf: { deltaD: 17.4, deltaP: 13.7, deltaH: 11.3 },
  benzene: { deltaD: 18.4, deltaP: 0.0, deltaH: 2.0 },
  ethylAcetate: { deltaD: 15.8, deltaP: 5.3, deltaH: 7.2 },
  ethanol: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
  isopropanol: { deltaD: 15.8, deltaP: 6.1, deltaH: 16.4 },
  methanol: { deltaD: 15.1, deltaP: 12.3, deltaH: 22.3 },
  water: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 },
};

describe('classifyESCRisk', () => {
  // ===== 溶解ゾーン (RED < 0.7) =====
  it('DCM vs PC: RED < 0.7 → dissolution', () => {
    const red = calculateRed(PC_ESC, solvents.dichloromethane, PC_R0);
    const risk = classifyESCRisk(red);
    expect(red).toBeLessThan(0.7);
    expect(risk).toBe(ESCRiskLevel.Dissolution);
  });

  // ===== ESC危険帯 (0.7 ≤ RED ≤ 1.3) =====
  it('Chloroform vs PC: RED ≈ 0.75 → ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.chloroform, PC_R0);
    const risk = classifyESCRisk(red);
    expect(red).toBeGreaterThanOrEqual(0.7);
    expect(red).toBeLessThanOrEqual(1.3);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('Toluene vs PC: ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.toluene, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('Acetone vs PC: ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.acetone, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('MEK vs PC: RED ≈ 1.0 → ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.mek, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('THF vs PC: ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.thf, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('DMF vs PC: ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.dmf, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('Benzene vs PC: ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.benzene, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('Ethyl Acetate vs PC: ESC危険帯', () => {
    const red = calculateRed(PC_ESC, solvents.ethylAcetate, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  // ===== 安全ゾーン (RED > 1.3) =====
  it('Ethanol vs PC: RED > 1.3 → 安全', () => {
    const red = calculateRed(PC_ESC, solvents.ethanol, PC_R0);
    const risk = classifyESCRisk(red);
    expect(red).toBeGreaterThan(1.3);
    expect(risk).toBe(ESCRiskLevel.Safe);
  });

  it('Isopropanol vs PC: 安全', () => {
    const red = calculateRed(PC_ESC, solvents.isopropanol, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.Safe);
  });

  it('Water vs PC: RED >> 1.3 → 安全', () => {
    const red = calculateRed(PC_ESC, solvents.water, PC_R0);
    const risk = classifyESCRisk(red);
    expect(red).toBeGreaterThan(3.0);
    expect(risk).toBe(ESCRiskLevel.Safe);
  });

  it('Methanol vs PC: 安全', () => {
    const red = calculateRed(PC_ESC, solvents.methanol, PC_R0);
    const risk = classifyESCRisk(red);
    expect(risk).toBe(ESCRiskLevel.Safe);
  });
});

describe('DEFAULT_ESC_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    expect(DEFAULT_ESC_THRESHOLDS.dissolutionMax).toBeLessThan(DEFAULT_ESC_THRESHOLDS.escMax);
  });

  it('デフォルト値が0.7, 1.3', () => {
    expect(DEFAULT_ESC_THRESHOLDS.dissolutionMax).toBe(0.7);
    expect(DEFAULT_ESC_THRESHOLDS.escMax).toBe(1.3);
  });
});

describe('classifyESCRisk with custom thresholds', () => {
  it('カスタム閾値: stricter band (0.6-1.5)', () => {
    const risk = classifyESCRisk(1.4, { dissolutionMax: 0.6, escMax: 1.5 });
    expect(risk).toBe(ESCRiskLevel.HighRisk);
  });

  it('カスタム閾値: narrower band (0.8-1.2)', () => {
    const risk = classifyESCRisk(1.25, { dissolutionMax: 0.8, escMax: 1.2 });
    expect(risk).toBe(ESCRiskLevel.Safe);
  });
});

describe('ESCの正答率（PC-溶媒系13件）', () => {
  it('文献データに対して少なくとも85%の正答率', () => {
    // 期待結果: GMP Plastic compatibility ratings
    const expected: [string, ESCRiskLevel][] = [
      ['dichloromethane', ESCRiskLevel.Dissolution], // D-Severe (dissolves)
      ['chloroform', ESCRiskLevel.HighRisk],          // D-Severe
      ['toluene', ESCRiskLevel.HighRisk],              // D-Severe
      ['acetone', ESCRiskLevel.HighRisk],              // D-Severe
      ['mek', ESCRiskLevel.HighRisk],                  // D-Severe
      ['thf', ESCRiskLevel.HighRisk],                  // D-Severe
      ['dmf', ESCRiskLevel.HighRisk],                  // D-Severe
      ['benzene', ESCRiskLevel.HighRisk],              // D-Severe
      ['ethylAcetate', ESCRiskLevel.HighRisk],         // D-Severe
      ['ethanol', ESCRiskLevel.Safe],                  // B-Good
      ['isopropanol', ESCRiskLevel.Safe],              // A-Excellent
      ['methanol', ESCRiskLevel.Safe],                 // B-Good
      ['water', ESCRiskLevel.Safe],                    // A-Excellent
    ];

    let correct = 0;
    for (const [solventName, expectedRisk] of expected) {
      const solvent = solvents[solventName as keyof typeof solvents];
      const red = calculateRed(PC_ESC, solvent, PC_R0);
      const risk = classifyESCRisk(red);
      if (risk === expectedRisk) correct++;
    }

    const accuracy = correct / expected.length;
    expect(accuracy).toBeGreaterThanOrEqual(0.85); // 85%以上
  });
});
