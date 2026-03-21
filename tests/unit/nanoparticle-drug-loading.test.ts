import { describe, it, expect } from 'vitest';
import {
  classifyLoading,
  screenDrugLoading,
  LoadingLevel,
  DEFAULT_LOADING_THRESHOLDS,
  getLoadingLevelInfo,
} from '../../src/core/nanoparticle-drug-loading';

describe('classifyLoading', () => {
  it('RED < 0.7 → High', () => {
    expect(classifyLoading(0.0)).toBe(LoadingLevel.High);
    expect(classifyLoading(0.5)).toBe(LoadingLevel.High);
    expect(classifyLoading(0.69)).toBe(LoadingLevel.High);
  });

  it('0.7 <= RED < 1.0 → Medium', () => {
    expect(classifyLoading(0.7)).toBe(LoadingLevel.Medium);
    expect(classifyLoading(0.85)).toBe(LoadingLevel.Medium);
    expect(classifyLoading(0.99)).toBe(LoadingLevel.Medium);
  });

  it('RED >= 1.0 → Low', () => {
    expect(classifyLoading(1.0)).toBe(LoadingLevel.Low);
    expect(classifyLoading(1.5)).toBe(LoadingLevel.Low);
    expect(classifyLoading(3.0)).toBe(LoadingLevel.Low);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyLoading(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { highMax: 0.5, mediumMax: 0.8 };
    expect(classifyLoading(0.3, custom)).toBe(LoadingLevel.High);
    expect(classifyLoading(0.6, custom)).toBe(LoadingLevel.Medium);
    expect(classifyLoading(0.9, custom)).toBe(LoadingLevel.Low);
  });
});

describe('getLoadingLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const high = getLoadingLevelInfo(LoadingLevel.High);
    expect(high.label).toBe('高');
    expect(high.color).toBe('green');

    const medium = getLoadingLevelInfo(LoadingLevel.Medium);
    expect(medium.label).toBe('中');
    expect(medium.color).toBe('yellow');

    const low = getLoadingLevelInfo(LoadingLevel.Low);
    expect(low.label).toBe('低');
    expect(low.color).toBe('red');
  });
});

describe('screenDrugLoading', () => {
  // PLGA (dD=17.6, dP=9.3, dH=12.3, R0=8)
  const plgaHSP = { deltaD: 17.6, deltaP: 9.3, deltaH: 12.3 };
  const r0 = 8;

  const drugs = [
    { name: 'イブプロフェン', hsp: { deltaD: 17.4, deltaP: 4.0, deltaH: 8.0 } },
    { name: 'パラセタモール', hsp: { deltaD: 20.3, deltaP: 10.5, deltaH: 14.7 } },
    { name: 'アスピリン', hsp: { deltaD: 18.0, deltaP: 8.6, deltaH: 10.8 } },
  ];

  it('PLGAのスクリーニングで正しいローディング分類を返す', () => {
    const results = screenDrugLoading(plgaHSP, r0, drugs);
    expect(results.length).toBe(3);

    // RED昇順ソート
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    // 各結果の構造を検証
    for (const r of results) {
      expect(r.drug.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(LoadingLevel)).toContain(r.loadingLevel);
    }
  });

  it('空の薬物リストで空配列を返す', () => {
    const results = screenDrugLoading(plgaHSP, r0, []);
    expect(results).toEqual([]);
  });

  it('アスピリンはPLGAに近いHSP値のため高いローディング', () => {
    // アスピリン dD=18.0, dP=8.6, dH=10.8 はPLGAに比較的近い
    const results = screenDrugLoading(plgaHSP, r0, [drugs[2]]);
    expect(results[0].red).toBeLessThan(1.0);
    expect([LoadingLevel.High, LoadingLevel.Medium]).toContain(results[0].loadingLevel);
  });

  it('各結果のra, redが正しく計算される', () => {
    const results = screenDrugLoading(plgaHSP, r0, drugs);
    for (const r of results) {
      const dD = plgaHSP.deltaD - r.drug.hsp.deltaD;
      const dP = plgaHSP.deltaP - r.drug.hsp.deltaP;
      const dH = plgaHSP.deltaH - r.drug.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / r0, 6);
    }
  });

  it('イブプロフェンとパラセタモールの比較', () => {
    const results = screenDrugLoading(plgaHSP, r0, drugs);
    const ibuprofen = results.find(r => r.drug.name === 'イブプロフェン')!;
    const paracetamol = results.find(r => r.drug.name === 'パラセタモール')!;
    // どちらもRA値を持つ
    expect(ibuprofen.ra).toBeGreaterThan(0);
    expect(paracetamol.ra).toBeGreaterThan(0);
  });
});
