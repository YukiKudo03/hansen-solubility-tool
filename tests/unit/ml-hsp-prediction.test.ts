import { describe, it, expect } from 'vitest';
import {
  estimateHSPFromDescriptors,
  validateDescriptors,
} from '../../src/core/ml-hsp-prediction';
import type { MolecularDescriptors } from '../../src/core/ml-hsp-prediction';

describe('validateDescriptors', () => {
  it('有効な記述子でnullを返す', () => {
    expect(validateDescriptors({
      molarVolume: 106.8, logP: 2.7, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: 1,
    })).toBeNull();
  });

  it('モル体積が0以下でエラー', () => {
    expect(validateDescriptors({
      molarVolume: 0, logP: 2.7, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: 1,
    })).toContain('モル体積');
  });

  it('logPが非有限でエラー', () => {
    expect(validateDescriptors({
      molarVolume: 100, logP: NaN, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: 0,
    })).toContain('logP');
  });

  it('ドナー数が負でエラー', () => {
    expect(validateDescriptors({
      molarVolume: 100, logP: 1.0, numHBDonors: -1, numHBAcceptors: 0, aromaticRings: 0,
    })).toContain('ドナー');
  });

  it('アクセプター数が負でエラー', () => {
    expect(validateDescriptors({
      molarVolume: 100, logP: 1.0, numHBDonors: 0, numHBAcceptors: -1, aromaticRings: 0,
    })).toContain('アクセプター');
  });

  it('芳香環数が負でエラー', () => {
    expect(validateDescriptors({
      molarVolume: 100, logP: 1.0, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: -1,
    })).toContain('芳香環');
  });
});

describe('estimateHSPFromDescriptors', () => {
  // Toluene: 既知HSP δD=18.0, δP=1.4, δH=2.0
  it('Toluene記述子からHSPを推算（誤差<30%）', () => {
    const toluene: MolecularDescriptors = {
      molarVolume: 106.8, // cm³/mol
      logP: 2.73,
      numHBDonors: 0,
      numHBAcceptors: 0,
      aromaticRings: 1,
    };
    const result = estimateHSPFromDescriptors(toluene);
    expect(result.hsp.deltaD).toBeGreaterThan(0);
    // δD: 既知18.0, 許容誤差30% → 12.6-23.4
    expect(result.hsp.deltaD).toBeGreaterThan(12.6);
    expect(result.hsp.deltaD).toBeLessThan(23.4);
    // δP, δH: ドナー・アクセプターが0なので低い値になるはず
    expect(result.hsp.deltaP).toBeLessThan(5);
    expect(result.hsp.deltaH).toBeLessThan(5);
  });

  // Ethanol: 既知HSP δD=15.8, δP=8.8, δH=19.4
  it('Ethanol記述子からHSPを推算（誤差<30%）', () => {
    const ethanol: MolecularDescriptors = {
      molarVolume: 58.5,
      logP: -0.31,
      numHBDonors: 1,
      numHBAcceptors: 1,
      aromaticRings: 0,
    };
    const result = estimateHSPFromDescriptors(ethanol);
    // δD: 既知15.8, 許容誤差30% → 11.1-20.5
    expect(result.hsp.deltaD).toBeGreaterThan(11.0);
    expect(result.hsp.deltaD).toBeLessThan(21.0);
    // δP: 既知8.8, 許容誤差30% → 6.2-11.4 (ドナー1+アクセプター1で有意な値)
    expect(result.hsp.deltaP).toBeGreaterThan(2);
    // δH: 既知19.4, 許容誤差30% → 13.6-25.2 (ドナー1有り)
    expect(result.hsp.deltaH).toBeGreaterThan(3);
  });

  // Acetone: 既知HSP δD=15.5, δP=10.4, δH=7.0
  it('Acetone記述子からHSPを推算（誤差<30%）', () => {
    const acetone: MolecularDescriptors = {
      molarVolume: 74.0,
      logP: -0.24,
      numHBDonors: 0,
      numHBAcceptors: 2,
      aromaticRings: 0,
    };
    const result = estimateHSPFromDescriptors(acetone);
    // δD: 既知15.5
    expect(result.hsp.deltaD).toBeGreaterThan(10);
    expect(result.hsp.deltaD).toBeLessThan(21);
    // δP: 既知10.4 — アクセプター2あり
    expect(result.hsp.deltaP).toBeGreaterThan(2);
    // δH: 既知7.0 — ドナー0, アクセプター2
    expect(result.hsp.deltaH).toBeGreaterThan(1);
  });

  it('結果に全フィールドが含まれる', () => {
    const result = estimateHSPFromDescriptors({
      molarVolume: 100, logP: 1.0, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: 0,
    });
    expect(result.hsp).toBeDefined();
    expect(result.descriptors).toBeDefined();
    expect(result.confidence).toBeDefined();
    expect(['high', 'medium', 'low']).toContain(result.confidence);
    expect(Array.isArray(result.warnings)).toBe(true);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('高logPで極性項が減衰する', () => {
    const polar = estimateHSPFromDescriptors({
      molarVolume: 100, logP: 1.0, numHBDonors: 2, numHBAcceptors: 2, aromaticRings: 0,
    });
    const nonpolar = estimateHSPFromDescriptors({
      molarVolume: 100, logP: 6.0, numHBDonors: 2, numHBAcceptors: 2, aromaticRings: 0,
    });
    expect(nonpolar.hsp.deltaP).toBeLessThan(polar.hsp.deltaP);
    expect(nonpolar.hsp.deltaH).toBeLessThan(polar.hsp.deltaH);
  });

  it('不正な記述子でエラーをスロー', () => {
    expect(() => estimateHSPFromDescriptors({
      molarVolume: -10, logP: 1.0, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: 0,
    })).toThrow();
  });

  it('低信頼度のとき警告を含む', () => {
    const result = estimateHSPFromDescriptors({
      molarVolume: 5, logP: -5, numHBDonors: 0, numHBAcceptors: 0, aromaticRings: 10,
    });
    expect(result.confidence).toBe('low');
    expect(result.warnings.length).toBeGreaterThan(0);
  });
});
