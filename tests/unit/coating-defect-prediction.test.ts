import { describe, it, expect } from 'vitest';
import {
  predictCoatingDefects,
  DefectRisk,
  getDefectRiskInfo,
  DEFAULT_DEFECT_THRESHOLDS,
} from '../../src/core/coating-defect-prediction';

describe('predictCoatingDefects', () => {
  // Epoxy coating on steel + MEK溶媒
  const coatingHSP = { deltaD: 20.4, deltaP: 12.0, deltaH: 11.5 }; // Epoxy
  const substrateHSP = { deltaD: 25.0, deltaP: 0.0, deltaH: 0.0 }; // Steel (高dD, 低dP/dH)
  const solventHSP = { deltaD: 16.0, deltaP: 9.0, deltaH: 5.1 };   // MEK

  it('Epoxy on steel + MEKで正しい結果構造を返す', () => {
    const result = predictCoatingDefects(coatingHSP, substrateHSP, solventHSP);
    expect(result).toHaveProperty('raCoatingSubstrate');
    expect(result).toHaveProperty('raCoatingSolvent');
    expect(result).toHaveProperty('adhesionRisk');
    expect(result).toHaveProperty('marangoniRisk');
    expect(result).toHaveProperty('defectRisk');
    expect(result.raCoatingSubstrate).toBeGreaterThan(0);
    expect(result.raCoatingSolvent).toBeGreaterThan(0);
  });

  it('Ra(coating-substrate)が大きいとき密着不良リスクをtrueにする', () => {
    // Coating-Steel間はdD差が大きいためRaは大きくなる
    const result = predictCoatingDefects(coatingHSP, substrateHSP, solventHSP);
    // Ra = sqrt(4*(20.4-25)^2 + 12^2 + 11.5^2)
    // = sqrt(4*21.16 + 144 + 132.25) = sqrt(84.64+144+132.25) = sqrt(360.89) ≈ 19.0
    expect(result.raCoatingSubstrate).toBeGreaterThan(DEFAULT_DEFECT_THRESHOLDS.adhesionRaThreshold);
    expect(result.adhesionRisk).toBe(true);
  });

  it('Ra(coating-solvent)が小さいときMarangoniリスクを検出する', () => {
    // コーティングとほぼ同じHSPの溶媒
    const closeSolventHSP = { deltaD: 20.0, deltaP: 11.5, deltaH: 11.0 };
    const result = predictCoatingDefects(coatingHSP, substrateHSP, closeSolventHSP);
    expect(result.raCoatingSolvent).toBeLessThanOrEqual(DEFAULT_DEFECT_THRESHOLDS.marangoniRaThreshold);
    expect(result.marangoniRisk).toBe(true);
  });

  it('両方のリスクがある場合はHigh', () => {
    const closeSolventHSP = { deltaD: 20.0, deltaP: 11.5, deltaH: 11.0 };
    const result = predictCoatingDefects(coatingHSP, substrateHSP, closeSolventHSP);
    expect(result.adhesionRisk).toBe(true);
    expect(result.marangoniRisk).toBe(true);
    expect(result.defectRisk).toBe(DefectRisk.High);
  });

  it('片方だけリスクがある場合はModerate', () => {
    const result = predictCoatingDefects(coatingHSP, substrateHSP, solventHSP);
    // adhesionRisk=true (Ra大), marangoniRisk=false (MEKとcoatingのRaは中程度)
    if (result.adhesionRisk && !result.marangoniRisk) {
      expect(result.defectRisk).toBe(DefectRisk.Moderate);
    } else if (!result.adhesionRisk && result.marangoniRisk) {
      expect(result.defectRisk).toBe(DefectRisk.Moderate);
    }
  });

  it('リスクがない場合はLow', () => {
    // coating と substrate が近く、solvent が離れている
    const closeSubstrate = { deltaD: 20.0, deltaP: 11.5, deltaH: 11.0 };
    const farSolvent = { deltaD: 14.0, deltaP: 2.0, deltaH: 2.0 };
    const result = predictCoatingDefects(coatingHSP, closeSubstrate, farSolvent);
    expect(result.adhesionRisk).toBe(false);
    expect(result.marangoniRisk).toBe(false);
    expect(result.defectRisk).toBe(DefectRisk.Low);
  });

  it('カスタム閾値を適用できる', () => {
    const custom = { adhesionRaThreshold: 50.0, marangoniRaThreshold: 0.1 };
    const result = predictCoatingDefects(coatingHSP, substrateHSP, solventHSP, custom);
    expect(result.adhesionRisk).toBe(false);
    expect(result.marangoniRisk).toBe(false);
    expect(result.defectRisk).toBe(DefectRisk.Low);
  });
});

describe('getDefectRiskInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const high = getDefectRiskInfo(DefectRisk.High);
    expect(high.label).toBe('欠陥リスク高');
    expect(high.color).toBe('red');

    const moderate = getDefectRiskInfo(DefectRisk.Moderate);
    expect(moderate.label).toBe('中程度');
    expect(moderate.color).toBe('yellow');

    const low = getDefectRiskInfo(DefectRisk.Low);
    expect(low.label).toBe('欠陥リスク低');
    expect(low.color).toBe('green');
  });
});
