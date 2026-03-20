/**
 * 分散剤選定支援 コアロジック テスト (TDD: テストファースト)
 */
import { describe, it, expect } from 'vitest';
import {
  classifyDispersantAffinity,
  evaluateAnchorAffinity,
  evaluateSolvationCompatibility,
  calculateCompositeScore,
  classifyOverallLevel,
  screenDispersants,
  screenSolventsForDispersant,
  evaluateDispersantFallback,
  screenDispersantsFallback,
  DEFAULT_DISPERSANT_THRESHOLDS,
  getDispersantAffinityLevelInfo,
} from '../../src/core/dispersant-selection';
import { DispersantAffinityLevel } from '../../src/core/types';
import type {
  Dispersant,
  NanoParticle,
  Solvent,
  DispersantAffinityThresholds,
} from '../../src/core/types';

// ─── テスト用ヘルパー ───────────────────────────

const mkDispersant = (overrides: Partial<Dispersant> = {}): Dispersant => ({
  id: 1,
  name: 'テスト分散剤',
  nameEn: 'Test Dispersant',
  dispersantType: 'polymeric',
  anchorHSP: { deltaD: 17.0, deltaP: 8.0, deltaH: 11.0 },
  anchorR0: 6.0,
  solvationHSP: { deltaD: 18.0, deltaP: 12.0, deltaH: 7.0 },
  solvationR0: 8.0,
  overallHSP: { deltaD: 17.5, deltaP: 10.0, deltaH: 9.0 },
  hlb: null,
  molWeight: null,
  tradeName: null,
  manufacturer: null,
  notes: null,
  ...overrides,
});

const mkNanoParticle = (overrides: Partial<NanoParticle> = {}): NanoParticle => ({
  id: 1,
  name: 'カーボンブラック',
  nameEn: 'Carbon Black',
  category: 'carbon',
  coreMaterial: 'Carbon Black',
  surfaceLigand: null,
  hsp: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
  r0: 6.1,
  particleSize: null,
  notes: null,
  ...overrides,
});

const mkSolvent = (overrides: Partial<Solvent> = {}): Solvent => ({
  id: 1,
  name: 'NMP',
  nameEn: 'N-Methyl-2-pyrrolidone',
  casNumber: '872-50-4',
  hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
  molarVolume: 96.5,
  molWeight: 99.13,
  boilingPoint: 202,
  viscosity: 1.67,
  specificGravity: 1.028,
  surfaceTension: 40.7,
  notes: null,
  ...overrides,
});

// ─── classifyDispersantAffinity ──────────────────

describe('classifyDispersantAffinity', () => {
  it('RED < 0.5 → Excellent', () => {
    expect(classifyDispersantAffinity(0.3)).toBe(DispersantAffinityLevel.Excellent);
  });

  it('RED = 0 → Excellent', () => {
    expect(classifyDispersantAffinity(0)).toBe(DispersantAffinityLevel.Excellent);
  });

  it('RED = 0.5 → Good (境界値は次レベル)', () => {
    expect(classifyDispersantAffinity(0.5)).toBe(DispersantAffinityLevel.Good);
  });

  it('RED = 0.79 → Good', () => {
    expect(classifyDispersantAffinity(0.79)).toBe(DispersantAffinityLevel.Good);
  });

  it('RED = 0.8 → Fair', () => {
    expect(classifyDispersantAffinity(0.8)).toBe(DispersantAffinityLevel.Fair);
  });

  it('RED = 1.0 → Poor', () => {
    expect(classifyDispersantAffinity(1.0)).toBe(DispersantAffinityLevel.Poor);
  });

  it('RED = 1.5 → Bad', () => {
    expect(classifyDispersantAffinity(1.5)).toBe(DispersantAffinityLevel.Bad);
  });

  it('RED = 3.0 → Bad', () => {
    expect(classifyDispersantAffinity(3.0)).toBe(DispersantAffinityLevel.Bad);
  });

  it('負のRED値でエラー', () => {
    expect(() => classifyDispersantAffinity(-0.1)).toThrow('RED値は非負でなければなりません');
  });

  it('カスタム閾値が適用される', () => {
    const customThresholds: DispersantAffinityThresholds = {
      excellentMax: 0.3, goodMax: 0.6, fairMax: 0.9, poorMax: 1.2,
    };
    expect(classifyDispersantAffinity(0.2, customThresholds)).toBe(DispersantAffinityLevel.Excellent);
    expect(classifyDispersantAffinity(0.35, customThresholds)).toBe(DispersantAffinityLevel.Good);
    expect(classifyDispersantAffinity(0.65, customThresholds)).toBe(DispersantAffinityLevel.Fair);
    expect(classifyDispersantAffinity(1.0, customThresholds)).toBe(DispersantAffinityLevel.Poor);
    expect(classifyDispersantAffinity(1.5, customThresholds)).toBe(DispersantAffinityLevel.Bad);
  });
});

// ─── evaluateAnchorAffinity ──────────────────────

describe('evaluateAnchorAffinity', () => {
  it('アンカー基と粒子表面のRa/REDを計算する', () => {
    const dispersant = mkDispersant({
      anchorHSP: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
      anchorR0: 6.0,
    });
    const particle = mkNanoParticle({
      hsp: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
    });
    const result = evaluateAnchorAffinity(dispersant, particle);
    expect(result.ra).toBeCloseTo(0, 5);
    expect(result.red).toBeCloseTo(0, 5);
    expect(result.affinity).toBe(DispersantAffinityLevel.Excellent);
  });

  it('離れたHSP値で高いRED値を返す', () => {
    const dispersant = mkDispersant({
      anchorHSP: { deltaD: 15.0, deltaP: 2.0, deltaH: 3.0 },
      anchorR0: 5.0,
    });
    const particle = mkNanoParticle({
      hsp: { deltaD: 20.0, deltaP: 10.0, deltaH: 15.0 },
    });
    const result = evaluateAnchorAffinity(dispersant, particle);
    // Ra² = 4*(15-20)² + (2-10)² + (3-15)² = 4*25 + 64 + 144 = 308
    // Ra = √308 ≈ 17.55
    // RED = Ra / particle.r0 = √308 / 6.1
    expect(result.ra).toBeCloseTo(Math.sqrt(308), 2);
    expect(result.red).toBeCloseTo(Math.sqrt(308) / 6.1, 2);
    expect(result.affinity).toBe(DispersantAffinityLevel.Bad);
  });
});

// ─── evaluateSolvationCompatibility ──────────────

describe('evaluateSolvationCompatibility', () => {
  it('溶媒和鎖と溶媒のRa/REDを計算する', () => {
    // 溶媒和鎖HSP ≈ NMP → REDは小さい
    const dispersant = mkDispersant({
      solvationHSP: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
      solvationR0: 8.0,
    });
    const solvent = mkSolvent({
      hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
    });
    const result = evaluateSolvationCompatibility(dispersant, solvent);
    expect(result.ra).toBeCloseTo(0, 5);
    expect(result.red).toBeCloseTo(0, 5);
    expect(result.affinity).toBe(DispersantAffinityLevel.Excellent);
  });

  it('不適な組み合わせで高いRED値', () => {
    const dispersant = mkDispersant({
      solvationHSP: { deltaD: 15.0, deltaP: 1.0, deltaH: 1.0 },
      solvationR0: 3.0,
    });
    const solvent = mkSolvent({
      hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 }, // 水
    });
    const result = evaluateSolvationCompatibility(dispersant, solvent);
    expect(result.red).toBeGreaterThan(1.5);
    expect(result.affinity).toBe(DispersantAffinityLevel.Bad);
  });
});

// ─── calculateCompositeScore ─────────────────────

describe('calculateCompositeScore', () => {
  it('幾何平均を計算する', () => {
    // √(0.4 * 0.6) = √0.24 ≈ 0.4899
    expect(calculateCompositeScore(0.4, 0.6)).toBeCloseTo(Math.sqrt(0.24), 5);
  });

  it('同値の場合はそのまま', () => {
    expect(calculateCompositeScore(0.5, 0.5)).toBeCloseTo(0.5, 5);
  });

  it('片方が0の場合は0', () => {
    expect(calculateCompositeScore(0, 0.5)).toBeCloseTo(0, 5);
  });

  it('両方0の場合は0', () => {
    expect(calculateCompositeScore(0, 0)).toBeCloseTo(0, 5);
  });

  it('負の値でエラー', () => {
    expect(() => calculateCompositeScore(-0.1, 0.5)).toThrow();
    expect(() => calculateCompositeScore(0.5, -0.1)).toThrow();
  });
});

// ─── classifyOverallLevel ────────────────────────

describe('classifyOverallLevel', () => {
  it('両RED < excellentMax → Excellent', () => {
    expect(classifyOverallLevel(0.3, 0.4)).toBe(DispersantAffinityLevel.Excellent);
  });

  it('片方がPoor範囲 → 悪い方に引っ張られる', () => {
    // compositeScore = √(0.3 * 1.2) = √0.36 = 0.6 → Good
    // ただし max(0.3, 1.2) = 1.2 → Poor
    // overallLevel は compositeScore ベース + max補正
    const level = classifyOverallLevel(0.3, 1.2);
    // 実装ではmax(RED_a, RED_s)がpoorMax超えなら少なくともPoor
    expect(level).toBeGreaterThanOrEqual(DispersantAffinityLevel.Fair);
  });

  it('両RED > poorMax → Bad', () => {
    expect(classifyOverallLevel(2.0, 2.0)).toBe(DispersantAffinityLevel.Bad);
  });

  it('両RED = 0 → Excellent', () => {
    expect(classifyOverallLevel(0, 0)).toBe(DispersantAffinityLevel.Excellent);
  });
});

// ─── screenDispersants ───────────────────────────

describe('screenDispersants', () => {
  it('空の分散剤リストで空の結果', () => {
    const particle = mkNanoParticle();
    const solvent = mkSolvent();
    const result = screenDispersants(particle, solvent, []);
    expect(result.results).toHaveLength(0);
    expect(result.particle).toBe(particle);
    expect(result.solvent).toBe(solvent);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it('結果はcompositeScore昇順でソートされる', () => {
    const particle = mkNanoParticle();
    const solvent = mkSolvent();
    // 良い分散剤（アンカー・溶媒和鎖ともに粒子・溶媒に近い）
    const goodDispersant = mkDispersant({
      id: 1,
      name: '良好',
      anchorHSP: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
      solvationHSP: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
    });
    // 悪い分散剤
    const badDispersant = mkDispersant({
      id: 2,
      name: '不良',
      anchorHSP: { deltaD: 14.0, deltaP: 2.0, deltaH: 2.0 },
      solvationHSP: { deltaD: 14.0, deltaP: 2.0, deltaH: 2.0 },
    });
    const result = screenDispersants(particle, solvent, [badDispersant, goodDispersant]);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].dispersant.id).toBe(1); // 良好が先
    expect(result.results[1].dispersant.id).toBe(2);
    expect(result.results[0].compositeScore).toBeLessThan(result.results[1].compositeScore);
  });

  it('各結果にRa/RED/レベルが含まれる', () => {
    const particle = mkNanoParticle();
    const solvent = mkSolvent();
    const dispersant = mkDispersant();
    const result = screenDispersants(particle, solvent, [dispersant]);
    const r = result.results[0];
    expect(r.raAnchor).toBeGreaterThanOrEqual(0);
    expect(r.redAnchor).toBeGreaterThanOrEqual(0);
    expect(r.raSolvation).toBeGreaterThanOrEqual(0);
    expect(r.redSolvation).toBeGreaterThanOrEqual(0);
    expect(r.compositeScore).toBeGreaterThanOrEqual(0);
    expect(Object.values(DispersantAffinityLevel)).toContain(r.affinityAnchor);
    expect(Object.values(DispersantAffinityLevel)).toContain(r.affinitySolvation);
    expect(Object.values(DispersantAffinityLevel)).toContain(r.overallLevel);
  });
});

// ─── screenSolventsForDispersant ──────────────────

describe('screenSolventsForDispersant', () => {
  it('空の溶媒リストで空の結果', () => {
    const particle = mkNanoParticle();
    const dispersant = mkDispersant();
    const result = screenSolventsForDispersant(particle, dispersant, []);
    expect(result.results).toHaveLength(0);
  });

  it('結果はcompositeScore昇順でソートされる', () => {
    const particle = mkNanoParticle();
    const dispersant = mkDispersant({
      solvationHSP: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
    });
    const nmp = mkSolvent({ id: 1, name: 'NMP', hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 } });
    const water = mkSolvent({ id: 2, name: '水', hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 } });

    const result = screenSolventsForDispersant(particle, dispersant, [water, nmp]);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].solvent.id).toBe(1); // NMPが先
    expect(result.results[0].compositeScore).toBeLessThan(result.results[1].compositeScore);
  });
});

// ─── フォールバック評価（全体HSPのみ） ──────────────

describe('evaluateDispersantFallback', () => {
  it('全体HSPのみで評価する', () => {
    const dispersant = mkDispersant({
      overallHSP: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
    });
    const particle = mkNanoParticle({
      hsp: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
    });
    const solvent = mkSolvent(); // solventは使われない（粒子-分散剤の単純評価）
    const result = evaluateDispersantFallback(dispersant, particle);
    expect(result.raOverall).toBeCloseTo(0, 5);
    expect(result.redOverall).toBeCloseTo(0, 5);
    expect(result.affinity).toBe(DispersantAffinityLevel.Excellent);
  });
});

describe('screenDispersantsFallback', () => {
  it('全体HSPのみでスクリーニングし、RED昇順でソート', () => {
    const particle = mkNanoParticle();
    const good = mkDispersant({
      id: 1, name: '近い',
      overallHSP: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
    });
    const bad = mkDispersant({
      id: 2, name: '遠い',
      overallHSP: { deltaD: 14.0, deltaP: 2.0, deltaH: 2.0 },
    });
    const results = screenDispersantsFallback(particle, [bad, good]);
    expect(results).toHaveLength(2);
    expect(results[0].dispersant.id).toBe(1);
    expect(results[0].redOverall).toBeLessThan(results[1].redOverall);
  });
});

// ─── DEFAULT_DISPERSANT_THRESHOLDS ───────────────

describe('DEFAULT_DISPERSANT_THRESHOLDS', () => {
  it('デフォルト閾値が昇順', () => {
    const t = DEFAULT_DISPERSANT_THRESHOLDS;
    expect(t.excellentMax).toBeLessThan(t.goodMax);
    expect(t.goodMax).toBeLessThan(t.fairMax);
    expect(t.fairMax).toBeLessThan(t.poorMax);
  });
});

// ─── getDispersantAffinityLevelInfo ──────────────

describe('getDispersantAffinityLevelInfo', () => {
  it('全レベルの表示情報を返す', () => {
    const levels = [
      DispersantAffinityLevel.Excellent,
      DispersantAffinityLevel.Good,
      DispersantAffinityLevel.Fair,
      DispersantAffinityLevel.Poor,
      DispersantAffinityLevel.Bad,
    ];
    for (const level of levels) {
      const info = getDispersantAffinityLevelInfo(level);
      expect(info.level).toBe(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
      expect(info.color).toBeTruthy();
    }
  });
});
