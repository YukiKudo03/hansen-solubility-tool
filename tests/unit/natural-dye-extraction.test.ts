import { describe, it, expect } from 'vitest';
import {
  classifyExtraction,
  screenDyeExtractionSolvents,
  ExtractionLevel,
  DEFAULT_EXTRACTION_THRESHOLDS,
  getExtractionLevelInfo,
} from '../../src/core/natural-dye-extraction';

describe('classifyExtraction', () => {
  it('RED < 0.7 → Excellent', () => {
    expect(classifyExtraction(0.0)).toBe(ExtractionLevel.Excellent);
    expect(classifyExtraction(0.5)).toBe(ExtractionLevel.Excellent);
    expect(classifyExtraction(0.69)).toBe(ExtractionLevel.Excellent);
  });

  it('0.7 <= RED < 1.0 → Good', () => {
    expect(classifyExtraction(0.7)).toBe(ExtractionLevel.Good);
    expect(classifyExtraction(0.85)).toBe(ExtractionLevel.Good);
    expect(classifyExtraction(0.99)).toBe(ExtractionLevel.Good);
  });

  it('RED >= 1.0 → Low', () => {
    expect(classifyExtraction(1.0)).toBe(ExtractionLevel.Low);
    expect(classifyExtraction(1.5)).toBe(ExtractionLevel.Low);
    expect(classifyExtraction(3.0)).toBe(ExtractionLevel.Low);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyExtraction(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値を適用', () => {
    const custom = { excellentMax: 0.5, goodMax: 0.8 };
    expect(classifyExtraction(0.3, custom)).toBe(ExtractionLevel.Excellent);
    expect(classifyExtraction(0.6, custom)).toBe(ExtractionLevel.Good);
    expect(classifyExtraction(0.9, custom)).toBe(ExtractionLevel.Low);
  });
});

describe('getExtractionLevelInfo', () => {
  it('各レベルの情報を正しく返す', () => {
    const excellent = getExtractionLevelInfo(ExtractionLevel.Excellent);
    expect(excellent.label).toBe('優秀');
    expect(excellent.color).toBe('green');

    const good = getExtractionLevelInfo(ExtractionLevel.Good);
    expect(good.label).toBe('良好');

    const low = getExtractionLevelInfo(ExtractionLevel.Low);
    expect(low.label).toBe('低効率');
    expect(low.color).toBe('red');
  });
});

describe('screenDyeExtractionSolvents', () => {
  // Anthocyanin (dD=18.0, dP=9.0, dH=20.0, R0=10)
  const dyeHSP = { deltaD: 18.0, deltaP: 9.0, deltaH: 20.0 };
  const dyeR0 = 10;

  const solvents = [
    { name: '水', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } },
    { name: 'エタノール', hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 } },
    { name: '酢酸エチル', hsp: { deltaD: 15.8, deltaP: 5.3, deltaH: 7.2 } },
  ];

  it('Anthocyaninのスクリーニングで正しい結果を返す', () => {
    const results = screenDyeExtractionSolvents(dyeHSP, dyeR0, solvents);
    expect(results.length).toBe(3);

    // RED昇順でソートされている
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].red).toBeLessThanOrEqual(results[i + 1].red);
    }

    for (const r of results) {
      expect(r.solvent.name).toBeTruthy();
      expect(r.ra).toBeGreaterThanOrEqual(0);
      expect(r.red).toBeGreaterThanOrEqual(0);
      expect(Object.values(ExtractionLevel)).toContain(r.extractionLevel);
    }
  });

  it('エタノールはAnthocyaninに対してExcellent（HSPが近い）', () => {
    const results = screenDyeExtractionSolvents(dyeHSP, dyeR0, [solvents[1]]);
    expect(results[0].extractionLevel).toBe(ExtractionLevel.Excellent);
  });

  it('酢酸エチルはAnthocyaninに対してGoodまたはLow（dHが離れている）', () => {
    const results = screenDyeExtractionSolvents(dyeHSP, dyeR0, [solvents[2]]);
    expect(results[0].extractionLevel).not.toBe(ExtractionLevel.Excellent);
  });

  it('空の溶媒リストで空配列を返す', () => {
    const results = screenDyeExtractionSolvents(dyeHSP, dyeR0, []);
    expect(results).toEqual([]);
  });

  it('結果のraとredが正しく計算される', () => {
    const results = screenDyeExtractionSolvents(dyeHSP, dyeR0, solvents);
    for (const r of results) {
      const dD = dyeHSP.deltaD - r.solvent.hsp.deltaD;
      const dP = dyeHSP.deltaP - r.solvent.hsp.deltaP;
      const dH = dyeHSP.deltaH - r.solvent.hsp.deltaH;
      const expectedRa = Math.sqrt(4 * dD * dD + dP * dP + dH * dH);
      expect(r.ra).toBeCloseTo(expectedRa, 6);
      expect(r.red).toBeCloseTo(expectedRa / dyeR0, 6);
    }
  });
});
