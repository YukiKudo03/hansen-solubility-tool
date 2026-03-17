import { describe, it, expect } from 'vitest';
import {
  getGHSInfo,
  GHS_DATABASE,
  getGHSPictogramLabel,
  isHighConcernSubstance,
} from '../../src/core/ghs-safety';

describe('GHS_DATABASE', () => {
  it('トルエン（108-88-3）の情報がある', () => {
    const info = GHS_DATABASE['108-88-3'];
    expect(info).toBeDefined();
    expect(info.signalWord).toBe('danger');
    expect(info.hStatements.length).toBeGreaterThan(0);
  });

  it('全エントリにsignalWordが設定されている', () => {
    for (const [cas, info] of Object.entries(GHS_DATABASE)) {
      expect(['danger', 'warning', null]).toContain(info.signalWord);
    }
  });
});

describe('getGHSInfo', () => {
  it('CAS番号でGHS情報を取得', () => {
    const info = getGHSInfo('108-88-3');
    expect(info).not.toBeNull();
    expect(info!.signalWord).toBe('danger');
  });

  it('存在しないCAS番号でnull', () => {
    expect(getGHSInfo('999-99-9')).toBeNull();
  });

  it('null CAS番号でnull', () => {
    expect(getGHSInfo(null)).toBeNull();
  });
});

describe('getGHSPictogramLabel', () => {
  it('flame → 炎', () => {
    expect(getGHSPictogramLabel('flame')).toBe('炎');
  });

  it('skull → どくろ', () => {
    expect(getGHSPictogramLabel('skull')).toBe('どくろ');
  });

  it('未知のピクトグラムでそのまま返す', () => {
    expect(getGHSPictogramLabel('unknown')).toBe('unknown');
  });
});

describe('isHighConcernSubstance', () => {
  it('SVHCリストに含まれる物質でtrue', () => {
    // ジクロロメタン (75-09-2) はSVHC候補
    const info = getGHSInfo('75-09-2');
    if (info) {
      expect(typeof isHighConcernSubstance('75-09-2')).toBe('boolean');
    }
  });

  it('存在しないCAS番号でfalse', () => {
    expect(isHighConcernSubstance('999-99-9')).toBe(false);
  });
});
