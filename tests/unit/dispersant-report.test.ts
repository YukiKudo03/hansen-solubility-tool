/**
 * 分散剤選定 CSV出力・精度警告・履歴 テスト (TDD)
 */
import { describe, it, expect } from 'vitest';
import { formatDispersantSelectionCsv } from '../../src/core/report';
import { getDispersantSelectionWarnings } from '../../src/core/accuracy-warnings';
import { isValidHistoryPipeline } from '../../src/core/evaluation-history';
import { DispersantAffinityLevel } from '../../src/core/types';
import type { DispersantEvaluationResult, DispersantScreeningResult, Dispersant, NanoParticle, Solvent } from '../../src/core/types';

const mkDispersant = (): Dispersant => ({
  id: 1, name: 'BYK-163', nameEn: 'BYK-163',
  dispersantType: 'polymeric',
  anchorHSP: { deltaD: 19.5, deltaP: 9.0, deltaH: 7.5 }, anchorR0: 6.5,
  solvationHSP: { deltaD: 16.5, deltaP: 4.5, deltaH: 5.0 }, solvationR0: 8.0,
  overallHSP: { deltaD: 17.8, deltaP: 6.5, deltaH: 6.0 },
  hlb: null, molWeight: 8000, tradeName: 'BYK-163', manufacturer: 'BYK-Chemie', notes: null,
});

const mkParticle = (): NanoParticle => ({
  id: 1, name: 'カーボンブラック', nameEn: 'Carbon Black',
  category: 'carbon', coreMaterial: 'CB', surfaceLigand: null,
  hsp: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 }, r0: 6.1,
  particleSize: null, notes: null,
});

const mkSolvent = (): Solvent => ({
  id: 1, name: 'NMP', nameEn: 'NMP', casNumber: null,
  hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
  molarVolume: null, molWeight: null, boilingPoint: null,
  viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
});

const mkResult = (): DispersantEvaluationResult => ({
  particle: mkParticle(),
  solvent: mkSolvent(),
  results: [{
    dispersant: mkDispersant(),
    particle: mkParticle(),
    solvent: mkSolvent(),
    raAnchor: 5.5, redAnchor: 0.9,
    affinityAnchor: DispersantAffinityLevel.Fair,
    raSolvation: 4.2, redSolvation: 0.525,
    affinitySolvation: DispersantAffinityLevel.Good,
    compositeScore: 0.687,
    overallLevel: DispersantAffinityLevel.Fair,
  }],
  evaluatedAt: new Date('2026-03-20T12:00:00Z'),
  thresholdsUsed: { excellentMax: 0.5, goodMax: 0.8, fairMax: 1.0, poorMax: 1.5 },
});

// ─── CSV出力 ─────────────────────────────────────

describe('formatDispersantSelectionCsv', () => {
  it('BOM付きUTF-8 CSV文字列を生成する', () => {
    const csv = formatDispersantSelectionCsv(mkResult());
    expect(csv.startsWith('\uFEFF')).toBe(true);
  });

  it('ヘッダーにアンカー基・溶媒和鎖・総合の列が含まれる', () => {
    const csv = formatDispersantSelectionCsv(mkResult());
    expect(csv).toContain('アンカー基 Ra');
    expect(csv).toContain('アンカー基 RED');
    expect(csv).toContain('溶媒和鎖 Ra');
    expect(csv).toContain('溶媒和鎖 RED');
    expect(csv).toContain('総合スコア');
    expect(csv).toContain('総合判定');
  });

  it('データ行に分散剤名と数値が含まれる', () => {
    const csv = formatDispersantSelectionCsv(mkResult());
    expect(csv).toContain('BYK-163');
    expect(csv).toContain('5.500'); // raAnchor
    expect(csv).toContain('0.900'); // redAnchor
  });

  it('空の結果でもヘッダーのみ出力される', () => {
    const result = mkResult();
    result.results = [];
    const csv = formatDispersantSelectionCsv(result);
    expect(csv).toContain('分散剤名');
    expect(csv.split('\r\n').filter(Boolean).length).toBe(1); // ヘッダーのみ
  });
});

// ─── 精度警告 ─────────────────────────────────────

describe('getDispersantSelectionWarnings', () => {
  it('基本的な警告メッセージを返す', () => {
    const warnings = getDispersantSelectionWarnings();
    expect(warnings.length).toBeGreaterThan(0);
    expect(warnings.some((w) => w.includes('推定値'))).toBe(true);
  });
});

// ─── 評価履歴 ─────────────────────────────────────

describe('dispersantSelection: 評価履歴パイプライン', () => {
  it('dispersantSelection が有効なパイプラインとして認識される', () => {
    expect(isValidHistoryPipeline('dispersantSelection')).toBe(true);
  });
});
