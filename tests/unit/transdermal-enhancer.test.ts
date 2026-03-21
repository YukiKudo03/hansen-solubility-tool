import { describe, it, expect } from 'vitest';
import {
  classifyTransdermalEnhancer,
  screenTransdermalEnhancers,
  getTransdermalLevelInfo,
  DEFAULT_TRANSDERMAL_THRESHOLDS,
  TransdermalEnhancerLevel,
} from '../../src/core/transdermal-enhancer';
import type { EnhancerInput } from '../../src/core/transdermal-enhancer';
import type { HSPValues } from '../../src/core/types';

describe('classifyTransdermalEnhancer', () => {
  it('score < 5.0 → Excellent', () => {
    expect(classifyTransdermalEnhancer(3.0)).toBe(TransdermalEnhancerLevel.Excellent);
  });
  it('score = 0.0 → Excellent', () => {
    expect(classifyTransdermalEnhancer(0.0)).toBe(TransdermalEnhancerLevel.Excellent);
  });
  it('score = 5.0 → Good (境界)', () => {
    expect(classifyTransdermalEnhancer(5.0)).toBe(TransdermalEnhancerLevel.Good);
  });
  it('score = 7.0 → Good', () => {
    expect(classifyTransdermalEnhancer(7.0)).toBe(TransdermalEnhancerLevel.Good);
  });
  it('score = 10.0 → Fair (境界)', () => {
    expect(classifyTransdermalEnhancer(10.0)).toBe(TransdermalEnhancerLevel.Fair);
  });
  it('score = 12.0 → Fair', () => {
    expect(classifyTransdermalEnhancer(12.0)).toBe(TransdermalEnhancerLevel.Fair);
  });
  it('score = 15.0 → Poor (境界)', () => {
    expect(classifyTransdermalEnhancer(15.0)).toBe(TransdermalEnhancerLevel.Poor);
  });
  it('score = 20.0 → Poor', () => {
    expect(classifyTransdermalEnhancer(20.0)).toBe(TransdermalEnhancerLevel.Poor);
  });
  it('負のスコアでエラー', () => {
    expect(() => classifyTransdermalEnhancer(-0.1)).toThrow();
  });
  it('カスタム閾値が適用される', () => {
    const custom = { excellentMax: 3.0, goodMax: 7.0, fairMax: 12.0 };
    expect(classifyTransdermalEnhancer(2.0, custom)).toBe(TransdermalEnhancerLevel.Excellent);
    expect(classifyTransdermalEnhancer(5.0, custom)).toBe(TransdermalEnhancerLevel.Good);
    expect(classifyTransdermalEnhancer(10.0, custom)).toBe(TransdermalEnhancerLevel.Fair);
    expect(classifyTransdermalEnhancer(15.0, custom)).toBe(TransdermalEnhancerLevel.Poor);
  });
});

describe('DEFAULT_TRANSDERMAL_THRESHOLDS', () => {
  it('閾値が昇順', () => {
    const t = DEFAULT_TRANSDERMAL_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.fairMax);
  });
});

describe('getTransdermalLevelInfo', () => {
  it('全レベルに表示情報がある', () => {
    const levels = [TransdermalEnhancerLevel.Excellent, TransdermalEnhancerLevel.Good, TransdermalEnhancerLevel.Fair, TransdermalEnhancerLevel.Poor];
    for (const level of levels) {
      const info = getTransdermalLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});

describe('screenTransdermalEnhancers', () => {
  // Ibuprofen: dD=17.6, dP=5.2, dH=7.0
  const ibuprofenHSP: HSPValues = { deltaD: 17.6, deltaP: 5.2, deltaH: 7.0 };
  // 皮膚: dD=17.0, dP=8.0, dH=10.0
  const skinHSP: HSPValues = { deltaD: 17.0, deltaP: 8.0, deltaH: 10.0 };

  // Oleic acid: dD=16.0, dP=2.8, dH=6.2 → 薬物にも皮膚にもそこそこ近い
  const oleicAcid: EnhancerInput = { name: 'Oleic Acid', hsp: { deltaD: 16.0, deltaP: 2.8, deltaH: 6.2 } };
  // Water: dD=15.5, dP=16.0, dH=42.3 → 薬物・皮膚両方から遠い
  const water: EnhancerInput = { name: 'Water', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } };
  // Isopropyl myristate (IPM): dD=16.0, dP=3.0, dH=4.0 → 薬物に近い
  const ipm: EnhancerInput = { name: 'Isopropyl Myristate', hsp: { deltaD: 16.0, deltaP: 3.0, deltaH: 4.0 } };

  it('Ibuprofen + Oleic acid → 良好な促進剤候補', () => {
    const results = screenTransdermalEnhancers(ibuprofenHSP, skinHSP, [oleicAcid]);
    expect(results).toHaveLength(1);
    // Oleic acidは薬物と皮膚の両方にそこそこ近い → compositeScore小
    expect(results[0].compositeScore).toBeGreaterThan(0);
    expect(results[0].raDrugEnhancer).toBeGreaterThan(0);
    expect(results[0].raSkinEnhancer).toBeGreaterThan(0);
  });

  it('Water → Poor (薬物・皮膚から遠い)', () => {
    const results = screenTransdermalEnhancers(ibuprofenHSP, skinHSP, [water]);
    expect(results).toHaveLength(1);
    expect(results[0].level).toBe(TransdermalEnhancerLevel.Poor);
    expect(results[0].compositeScore).toBeGreaterThanOrEqual(15.0);
  });

  it('結果がcompositeScore昇順にソートされる', () => {
    const results = screenTransdermalEnhancers(ibuprofenHSP, skinHSP, [water, oleicAcid, ipm]);
    expect(results.length).toBe(3);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].compositeScore).toBeGreaterThanOrEqual(results[i - 1].compositeScore);
    }
  });

  it('Oleic acid のスコアが Water より小さい', () => {
    const results = screenTransdermalEnhancers(ibuprofenHSP, skinHSP, [water, oleicAcid]);
    const oleicResult = results.find(r => r.enhancerName === 'Oleic Acid')!;
    const waterResult = results.find(r => r.enhancerName === 'Water')!;
    expect(oleicResult.compositeScore).toBeLessThan(waterResult.compositeScore);
  });

  it('空のリストで空結果', () => {
    const results = screenTransdermalEnhancers(ibuprofenHSP, skinHSP, []);
    expect(results).toHaveLength(0);
  });
});
