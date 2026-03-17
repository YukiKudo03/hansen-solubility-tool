import { describe, it, expect } from 'vitest';
import {
  parseSolventCsv,
  parsePartCsv,
  validateSolventImportRow,
  validatePartImportRow,
} from '../../src/core/csv-import';

describe('parseSolventCsv', () => {
  it('有効なCSVを溶媒配列にパース', () => {
    const csv = `name,nameEn,casNumber,deltaD,deltaP,deltaH
トルエン,Toluene,108-88-3,18.0,1.4,2.0
アセトン,Acetone,67-64-1,15.5,10.4,7.0`;

    const result = parseSolventCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].name).toBe('トルエン');
    expect(result.rows[0].hsp.deltaD).toBe(18.0);
  });

  it('ヘッダー行のみで空配列', () => {
    const csv = 'name,nameEn,casNumber,deltaD,deltaP,deltaH';
    const result = parseSolventCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(0);
  });

  it('不正なHSP値でエラーを返す', () => {
    const csv = `name,nameEn,casNumber,deltaD,deltaP,deltaH
トルエン,Toluene,108-88-3,abc,1.4,2.0`;

    const result = parseSolventCsv(csv);
    expect(result.rows).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('行2');
  });

  it('空行をスキップ', () => {
    const csv = `name,nameEn,casNumber,deltaD,deltaP,deltaH
トルエン,Toluene,108-88-3,18.0,1.4,2.0

アセトン,Acetone,67-64-1,15.5,10.4,7.0`;

    const result = parseSolventCsv(csv);
    expect(result.rows).toHaveLength(2);
  });

  it('オプションフィールド（沸点、粘度等）を含むCSV', () => {
    const csv = `name,nameEn,casNumber,deltaD,deltaP,deltaH,boilingPoint,viscosity
トルエン,Toluene,108-88-3,18.0,1.4,2.0,110.6,0.56`;

    const result = parseSolventCsv(csv);
    expect(result.rows[0].boilingPoint).toBe(110.6);
    expect(result.rows[0].viscosity).toBe(0.56);
  });
});

describe('parsePartCsv', () => {
  it('有効なCSVを部品配列にパース', () => {
    const csv = `name,materialType,deltaD,deltaP,deltaH,r0
PS,PS,18.5,4.5,2.9,5.3
PE,PE,18.0,0.0,0.0,6.0`;

    const result = parsePartCsv(csv);
    expect(result.rows).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    expect(result.rows[0].name).toBe('PS');
    expect(result.rows[0].r0).toBe(5.3);
  });

  it('R₀が0以下でエラー', () => {
    const csv = `name,materialType,deltaD,deltaP,deltaH,r0
PS,PS,18.5,4.5,2.9,0`;

    const result = parsePartCsv(csv);
    expect(result.errors).toHaveLength(1);
  });
});

describe('validateSolventImportRow', () => {
  it('有効な行でnull', () => {
    const err = validateSolventImportRow({ name: 'トルエン', deltaD: 18, deltaP: 1.4, deltaH: 2 });
    expect(err).toBeNull();
  });

  it('名前が空でエラー', () => {
    const err = validateSolventImportRow({ name: '', deltaD: 18, deltaP: 1.4, deltaH: 2 });
    expect(err).toContain('名前');
  });

  it('δDがNaNでエラー', () => {
    const err = validateSolventImportRow({ name: 'X', deltaD: NaN, deltaP: 1.4, deltaH: 2 });
    expect(err).toContain('δD');
  });
});

describe('validatePartImportRow', () => {
  it('有効な行でnull', () => {
    const err = validatePartImportRow({ name: 'PS', deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 5.3 });
    expect(err).toBeNull();
  });

  it('R₀が0でエラー', () => {
    const err = validatePartImportRow({ name: 'PS', deltaD: 18.5, deltaP: 4.5, deltaH: 2.9, r0: 0 });
    expect(err).toContain('R₀');
  });
});
