import { describe, it, expect } from 'vitest';
import { formatCsv, formatContactAngleCsv, formatSwellingCsv, formatDrugSolubilityCsv, formatBlendOptimizationCsv } from '../../src/core/report';
import { RiskLevel, WettabilityLevel, SwellingLevel, DrugSolubilityLevel } from '../../src/core/types';
import type { GroupEvaluationResult, GroupContactAngleResult, ContactAngleResult, Part, Solvent, PartsGroup, GroupSwellingResult, DrugSolubilityScreeningResult, BlendOptimizationResult } from '../../src/core/types';

function makePart(overrides: Partial<Part> = {}): Part {
  return {
    id: 1,
    groupId: 1,
    name: 'ポリスチレン',
    materialType: 'PS',
    hsp: { deltaD: 18.5, deltaP: 4.5, deltaH: 2.9 },
    r0: 5.3,
    notes: null,
    ...overrides,
  };
}

function makeSolvent(overrides: Partial<Solvent> = {}): Solvent {
  return {
    id: 1,
    name: 'トルエン',
    nameEn: 'Toluene',
    casNumber: '108-88-3',
    hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
    molarVolume: 106.2,
    molWeight: 92.14,
    boilingPoint: 110.6,
    viscosity: 0.56,
    specificGravity: 0.867,
    surfaceTension: 28.4,
    notes: null,
    ...overrides,
  };
}

function makeGroupResult(overrides: Partial<GroupEvaluationResult> = {}): GroupEvaluationResult {
  const part = makePart();
  const solvent = makeSolvent();
  const group: PartsGroup = {
    id: 1,
    name: 'テストグループ',
    description: null,
    parts: [part],
  };
  return {
    partsGroup: group,
    solvent,
    results: [
      {
        part,
        solvent,
        ra: 3.380,
        red: 0.638,
        riskLevel: RiskLevel.Warning,
      },
    ],
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    thresholdsUsed: {
      dangerousMax: 0.5,
      warningMax: 0.8,
      cautionMax: 1.2,
      holdMax: 2.0,
    },
    ...overrides,
  };
}

describe('formatCsv', () => {
  it('BOM付きUTF-8で出力される', () => {
    const csv = formatCsv(makeGroupResult());
    expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM
  });

  it('ヘッダー行が正しい', () => {
    const csv = formatCsv(makeGroupResult());
    const lines = csv.split('\r\n');
    // BOMを除去してヘッダーを検証
    const header = lines[0].replace('\uFEFF', '');
    expect(header).toBe(
      '部品グループ,部品名,材料種別,部品 δD,部品 δP,部品 δH,部品 R₀,溶媒名,溶媒 δD,溶媒 δP,溶媒 δH,溶媒 沸点(°C),溶媒 粘度(mPa·s),溶媒 比重,溶媒 表面張力(mN/m),Ra,RED,リスクレベル,リスク判定,評価日時',
    );
  });

  it('データ行が正しい', () => {
    const csv = formatCsv(makeGroupResult());
    const lines = csv.split('\r\n');
    const dataLine = lines[1];
    expect(dataLine).toContain('テストグループ');
    expect(dataLine).toContain('ポリスチレン');
    expect(dataLine).toContain('PS');
    expect(dataLine).toContain('トルエン');
    expect(dataLine).toContain('3.380');
    expect(dataLine).toContain('0.638');
    expect(dataLine).toContain('Level 2');
    expect(dataLine).toContain('要警戒');
  });

  it('数値が小数点以下3桁で出力される', () => {
    const csv = formatCsv(makeGroupResult());
    const lines = csv.split('\r\n');
    const dataLine = lines[1];
    // δD=18.5 → 18.500
    expect(dataLine).toContain('18.500');
  });

  it('CRLFで改行される', () => {
    const csv = formatCsv(makeGroupResult());
    expect(csv).toContain('\r\n');
    // LFのみの改行がないことを確認
    const withoutCRLF = csv.replace(/\r\n/g, '');
    expect(withoutCRLF).not.toContain('\n');
  });

  it('末尾に改行がある', () => {
    const csv = formatCsv(makeGroupResult());
    expect(csv.endsWith('\r\n')).toBe(true);
  });

  it('空の結果セットではヘッダーのみ', () => {
    const result = makeGroupResult({ results: [] });
    const csv = formatCsv(result);
    const lines = csv.split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(1); // ヘッダーのみ（BOM含む）
  });

  it('カンマを含む名前が適切にエスケープされる', () => {
    const part = makePart({ name: 'ポリマー,テスト' });
    const result = makeGroupResult({
      partsGroup: { id: 1, name: 'グループ,テスト', description: null, parts: [part] },
      results: [
        {
          part,
          solvent: makeSolvent(),
          ra: 3.380,
          red: 0.638,
          riskLevel: RiskLevel.Warning,
        },
      ],
    });
    const csv = formatCsv(result);
    expect(csv).toContain('"グループ,テスト"');
    expect(csv).toContain('"ポリマー,テスト"');
  });

  it('引用符を含む名前が適切にエスケープされる', () => {
    const part = makePart({ name: 'ポリマー"テスト"' });
    const result = makeGroupResult({
      partsGroup: { id: 1, name: 'テスト', description: null, parts: [part] },
      results: [
        {
          part,
          solvent: makeSolvent(),
          ra: 1.0,
          red: 0.5,
          riskLevel: RiskLevel.Warning,
        },
      ],
    });
    const csv = formatCsv(result);
    expect(csv).toContain('"ポリマー""テスト"""');
  });

  it('物性値がCSVに含まれる', () => {
    const csv = formatCsv(makeGroupResult());
    const lines = csv.split('\r\n');
    const dataLine = lines[1];
    expect(dataLine).toContain('110.6');
    expect(dataLine).toContain('0.56');
    expect(dataLine).toContain('0.867');
    expect(dataLine).toContain('28.4');
  });

  it('物性値がnullの場合は空文字', () => {
    const solvent = makeSolvent({ boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null });
    const part = makePart();
    const result = makeGroupResult({
      results: [{ part, solvent, ra: 3.380, red: 0.638, riskLevel: RiskLevel.Warning }],
    });
    const csv = formatCsv(result);
    const lines = csv.split('\r\n');
    const fields = lines[1].split(',');
    // 溶媒δH(index 10) の後に 4つの物性カラム(index 11-14)
    expect(fields[11]).toBe('');
    expect(fields[12]).toBe('');
    expect(fields[13]).toBe('');
    expect(fields[14]).toBe('');
  });

  it('materialTypeがnullの場合は空文字', () => {
    const part = makePart({ materialType: null });
    const result = makeGroupResult({
      results: [
        {
          part,
          solvent: makeSolvent(),
          ra: 3.380,
          red: 0.638,
          riskLevel: RiskLevel.Warning,
        },
      ],
    });
    const csv = formatCsv(result);
    const lines = csv.split('\r\n');
    const fields = lines[1].split(',');
    expect(fields[2]).toBe(''); // materialType列が空
  });

  it('複数部品の結果が出力される', () => {
    const part1 = makePart({ id: 1, name: '部品A' });
    const part2 = makePart({ id: 2, name: '部品B' });
    const solvent = makeSolvent();
    const result = makeGroupResult({
      results: [
        { part: part1, solvent, ra: 3.0, red: 0.5, riskLevel: RiskLevel.Warning },
        { part: part2, solvent, ra: 6.0, red: 1.5, riskLevel: RiskLevel.Hold },
      ],
    });
    const csv = formatCsv(result);
    const lines = csv.split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(3); // ヘッダー + 2行
    expect(lines[1]).toContain('部品A');
    expect(lines[2]).toContain('部品B');
  });
});

// ─── formatContactAngleCsv ───────────────────

function makeContactAngleResult(overrides: Partial<GroupContactAngleResult> = {}): GroupContactAngleResult {
  const part = makePart();
  const solvent = makeSolvent();
  const group: PartsGroup = { id: 1, name: 'テストグループ', description: null, parts: [part] };
  return {
    partsGroup: group,
    solvent,
    results: [
      {
        part,
        solvent,
        surfaceTensionLV: 28.5,
        surfaceEnergySV: 33.2,
        interfacialTension: 1.5,
        cosTheta: 0.85,
        contactAngle: 31.8,
        wettability: WettabilityLevel.Wettable,
      },
    ],
    evaluatedAt: new Date('2026-03-15T10:00:00Z'),
    ...overrides,
  };
}

describe('formatContactAngleCsv', () => {
  it('BOM付きUTF-8で出力される', () => {
    const csv = formatContactAngleCsv(makeContactAngleResult());
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('ヘッダー行に接触角関連カラムがある', () => {
    const csv = formatContactAngleCsv(makeContactAngleResult());
    const header = csv.split('\r\n')[0].replace('\uFEFF', '');
    expect(header).toContain('接触角(°)');
    expect(header).toContain('γ_LV(mN/m)');
    expect(header).toContain('γ_SV(mN/m)');
    expect(header).toContain('γ_SL(mN/m)');
    expect(header).toContain('cos(θ)');
    expect(header).toContain('濡れ性レベル');
    expect(header).toContain('濡れ性判定');
  });

  it('データ行に数値が含まれる', () => {
    const csv = formatContactAngleCsv(makeContactAngleResult());
    const lines = csv.split('\r\n');
    const dataLine = lines[1];
    expect(dataLine).toContain('ポリスチレン');
    expect(dataLine).toContain('トルエン');
    expect(dataLine).toContain('31.8');
    expect(dataLine).toContain('28.500');
    expect(dataLine).toContain('33.200');
  });

  it('CRLFで改行される', () => {
    const csv = formatContactAngleCsv(makeContactAngleResult());
    expect(csv).toContain('\r\n');
    const withoutCRLF = csv.replace(/\r\n/g, '');
    expect(withoutCRLF).not.toContain('\n');
  });

  it('空の結果セットではヘッダーのみ', () => {
    const result = makeContactAngleResult({ results: [] });
    const csv = formatContactAngleCsv(result);
    const lines = csv.split('\r\n').filter((l) => l.length > 0);
    expect(lines.length).toBe(1);
  });
});

// ─── formatSwellingCsv ───────────────────

describe('formatSwellingCsv', () => {
  it('BOM付きUTF-8ヘッダーを含む', () => {
    const result: GroupSwellingResult = {
      partsGroup: { id: 1, name: 'TestGroup', description: null, parts: [] },
      solvent: { id: 1, name: 'Water', nameEn: null, casNumber: null, hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 }, molarVolume: null, molWeight: null, boilingPoint: null, viscosity: null, specificGravity: null, surfaceTension: null, notes: null },
      results: [],
      evaluatedAt: new Date('2024-01-01'),
      thresholdsUsed: { severeMax: 0.5, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 },
    };
    const csv = formatSwellingCsv(result);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('膨潤レベル');
  });

  it('結果行が正しくフォーマットされる', () => {
    const result: GroupSwellingResult = {
      partsGroup: { id: 1, name: 'TestGroup', description: null, parts: [
        { id: 1, groupId: 1, name: 'Part1', materialType: 'elastomer', hsp: { deltaD: 18.0, deltaP: 5.0, deltaH: 7.0 }, r0: 5.0, notes: null },
      ] },
      solvent: { id: 1, name: 'Toluene', nameEn: null, casNumber: null, hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: null, molWeight: null, boilingPoint: 110.6, viscosity: null, specificGravity: null, surfaceTension: null, notes: null },
      results: [
        { part: { id: 1, groupId: 1, name: 'Part1', materialType: 'elastomer', hsp: { deltaD: 18.0, deltaP: 5.0, deltaH: 7.0 }, r0: 5.0, notes: null }, solvent: { id: 1, name: 'Toluene', nameEn: null, casNumber: null, hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 }, molarVolume: null, molWeight: null, boilingPoint: 110.6, viscosity: null, specificGravity: null, surfaceTension: null, notes: null }, ra: 3.5, red: 0.7, swellingLevel: SwellingLevel.High },
      ],
      evaluatedAt: new Date('2024-01-01'),
      thresholdsUsed: { severeMax: 0.5, highMax: 0.8, moderateMax: 1.0, lowMax: 1.5 },
    };
    const csv = formatSwellingCsv(result);
    expect(csv).toContain('Part1');
    expect(csv).toContain('高膨潤');
  });
});

// ─── formatDrugSolubilityCsv ───────────────────

describe('formatDrugSolubilityCsv', () => {
  it('BOM付きUTF-8ヘッダーを含む', () => {
    const result: DrugSolubilityScreeningResult = {
      drug: { id: 1, name: 'Acetaminophen', nameEn: null, casNumber: null, hsp: { deltaD: 17.2, deltaP: 9.4, deltaH: 13.3 }, r0: 5.0, molWeight: null, logP: null, therapeuticCategory: null, notes: null },
      results: [],
      evaluatedAt: new Date('2024-01-01'),
      thresholdsUsed: { excellentMax: 0.5, goodMax: 0.8, partialMax: 1.0, poorMax: 1.5 },
    };
    const csv = formatDrugSolubilityCsv(result);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('溶解性レベル');
  });
});

// ─── formatBlendOptimizationCsv ───────────────────

describe('formatBlendOptimizationCsv', () => {
  it('BOM付きUTF-8ヘッダーを含む', () => {
    const result: BlendOptimizationResult = {
      targetHSP: { deltaD: 17.0, deltaP: 5.0, deltaH: 10.0 },
      topResults: [],
      evaluatedAt: new Date('2024-01-01'),
    };
    const csv = formatBlendOptimizationCsv(result);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('Ra');
  });
});
