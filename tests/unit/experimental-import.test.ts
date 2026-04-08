import { describe, it, expect } from 'vitest';
import {
  parseExperimentalCsv,
  matchSolventNames,
  detectShiftJIS,
} from '../../src/core/experimental-import';
import type { Solvent } from '../../src/core/types';

// テスト用溶媒データ
const mockSolvents: Solvent[] = [
  {
    id: 1, name: 'トルエン', nameEn: 'Toluene', casNumber: '108-88-3',
    hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
    molarVolume: 106.8, molWeight: 92.14, boilingPoint: 110.6,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  },
  {
    id: 2, name: 'アセトン', nameEn: 'Acetone', casNumber: '67-64-1',
    hsp: { deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 },
    molarVolume: 74.0, molWeight: 58.08, boilingPoint: 56.1,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  },
  {
    id: 3, name: 'エタノール', nameEn: 'Ethanol', casNumber: '64-17-5',
    hsp: { deltaD: 15.8, deltaP: 8.8, deltaH: 19.4 },
    molarVolume: 58.5, molWeight: 46.07, boilingPoint: 78.3,
    viscosity: null, specificGravity: null, surfaceTension: null, notes: null,
  },
];

describe('parseExperimentalCsv', () => {
  it('最小スキーマ (solvent_name, result) をパース', () => {
    const csv = `solvent_name,result
トルエン,good
アセトン,bad
エタノール,partial`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(3);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].solventNameRaw).toBe('トルエン');
    expect(result.rows[0].result).toBe('good');
    expect(result.rows[1].result).toBe('bad');
    expect(result.rows[2].result).toBe('partial');
  });

  it('日本語ヘッダー (溶媒名, 結果) を認識', () => {
    const csv = `溶媒名,結果
トルエン,good
アセトン,bad`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
  });

  it('オプション列を含むCSVをパース', () => {
    const csv = `solvent_name,result,quantitative_value,quantitative_unit,temperature_c,concentration,notes
トルエン,good,12.5,g/L,25,,溶解良好
アセトン,bad,0.1,%,30,10%,不溶`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].quantitativeValue).toBe(12.5);
    expect(result.rows[0].quantitativeUnit).toBe('g/L');
    expect(result.rows[0].temperatureC).toBe(25);
    expect(result.rows[0].notes).toBe('溶解良好');
    expect(result.rows[1].concentration).toBe('10%');
  });

  it('空CSVでエラー', () => {
    const result = parseExperimentalCsv('');
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('空');
  });

  it('ヘッダーのみで空配列', () => {
    const csv = 'solvent_name,result';
    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('必須ヘッダーがない場合エラー', () => {
    const csv = `name,value
トルエン,good`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('solvent_name');
  });

  it('不正なresult値でエラー行をスキップ', () => {
    const csv = `solvent_name,result
トルエン,good
アセトン,excellent
エタノール,bad`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('行3');
    expect(result.errors[0]).toContain('excellent');
  });

  it('空の溶媒名でエラー行をスキップ', () => {
    const csv = `solvent_name,result
トルエン,good
,bad
エタノール,partial`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('溶媒名が空');
  });

  it('大文字小文字を無視してresultを判定', () => {
    const csv = `solvent_name,result
トルエン,GOOD
アセトン,Bad
エタノール,Partial`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].result).toBe('good');
    expect(result.rows[1].result).toBe('bad');
    expect(result.rows[2].result).toBe('partial');
  });

  it('空行をスキップ', () => {
    const csv = `solvent_name,result
トルエン,good

エタノール,bad`;

    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(2);
  });

  it('CRLFの改行コードに対応', () => {
    const csv = "solvent_name,result\r\nトルエン,good\r\nアセトン,bad";
    const result = parseExperimentalCsv(csv);
    expect(result.rows).toHaveLength(2);
  });
});

describe('matchSolventNames', () => {
  it('完全一致（日本語名）', () => {
    const result = matchSolventNames(['トルエン', 'アセトン'], mockSolvents, []);
    expect(result.matched).toHaveLength(2);
    expect(result.unmatched).toHaveLength(0);
    expect(result.matched[0].solvent.id).toBe(1);
    expect(result.matched[1].solvent.id).toBe(2);
  });

  it('完全一致（英語名、大文字小文字無視）', () => {
    const result = matchSolventNames(['toluene', 'ACETONE'], mockSolvents, []);
    expect(result.matched).toHaveLength(2);
    expect(result.unmatched).toHaveLength(0);
  });

  it('CAS番号でマッチ', () => {
    const result = matchSolventNames(['108-88-3'], mockSolvents, []);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].solvent.name).toBe('トルエン');
  });

  it('正規化マッチ（空白・ハイフン無視）', () => {
    const result = matchSolventNames(['エタ ノール', 'トル-エン'], mockSolvents, []);
    expect(result.matched).toHaveLength(2);
  });

  it('未一致を報告', () => {
    const result = matchSolventNames(['トルエン', '未知の溶媒', 'ミステリー液'], mockSolvents, []);
    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(2);
    expect(result.unmatched).toContain('未知の溶媒');
    expect(result.unmatched).toContain('ミステリー液');
  });

  it('キャッシュされたマッピングを使用', () => {
    const cachedMappings = [
      { id: 1, rawName: 'カスタム名', solventId: 2, createdAt: '2026-01-01' },
    ];
    const result = matchSolventNames(['カスタム名'], mockSolvents, cachedMappings);
    expect(result.matched).toHaveLength(1);
    expect(result.matched[0].solvent.id).toBe(2);
  });

  it('重複した名前は1回だけマッチ', () => {
    const result = matchSolventNames(['トルエン', 'トルエン', 'トルエン'], mockSolvents, []);
    expect(result.matched).toHaveLength(1);
    expect(result.unmatched).toHaveLength(0);
  });

  it('空の入力で空の結果', () => {
    const result = matchSolventNames([], mockSolvents, []);
    expect(result.matched).toHaveLength(0);
    expect(result.unmatched).toHaveLength(0);
  });
});

describe('detectShiftJIS', () => {
  it('ASCII文字列はShift-JISと判定しない', () => {
    const buffer = new TextEncoder().encode('hello world');
    expect(detectShiftJIS(new Uint8Array(buffer))).toBe(false);
  });

  it('UTF-8の日本語はShift-JISと判定しない', () => {
    const buffer = new TextEncoder().encode('トルエン,good');
    expect(detectShiftJIS(new Uint8Array(buffer))).toBe(false);
  });

  it('Shift-JIS範囲のバイトが多い場合はtrueを返す', () => {
    // Shift-JIS "トルエン" の近似バイト列
    const buffer = new Uint8Array([0x83, 0x67, 0x83, 0x8B, 0x83, 0x47, 0x83, 0x93]);
    expect(detectShiftJIS(buffer)).toBe(true);
  });
});
