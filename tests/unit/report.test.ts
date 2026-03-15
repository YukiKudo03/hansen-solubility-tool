import { describe, it, expect } from 'vitest';
import { formatCsv } from '../../src/core/report';
import { RiskLevel } from '../../src/core/types';
import type { GroupEvaluationResult, Part, Solvent, PartsGroup } from '../../src/core/types';

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
      '部品グループ,部品名,材料種別,部品 δD,部品 δP,部品 δH,部品 R₀,溶媒名,溶媒 δD,溶媒 δP,溶媒 δH,Ra,RED,リスクレベル,リスク判定,評価日時',
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
