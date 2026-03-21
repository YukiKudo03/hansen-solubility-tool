/**
 * 水素貯蔵材料 コアロジック テスト
 */
import { describe, it, expect } from 'vitest';
import {
  screenHydrogenStorageMaterials,
  classifyH2StorageCompatibility,
  getH2StorageCompatibilityLevelInfo,
  H2StorageCompatibilityLevel,
} from '../../src/core/hydrogen-storage-material';
import type { H2StorageSolvent } from '../../src/core/hydrogen-storage-material';
import type { HSPValues } from '../../src/core/types';

// ジベンジルトルエン (LOHC典型例): δD=18.5, δP=2.0, δH=3.5, R0=8.0
const DBT_HSP: HSPValues = { deltaD: 18.5, deltaP: 2.0, deltaH: 3.5 };
const DBT_R0 = 8.0;

// テスト用溶媒
const TOLUENE: H2StorageSolvent = {
  name: 'トルエン',
  hsp: { deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 },
};

const MCH: H2StorageSolvent = {
  name: 'メチルシクロヘキサン',
  hsp: { deltaD: 16.0, deltaP: 0.0, deltaH: 0.2 },
};

const WATER: H2StorageSolvent = {
  name: '水',
  hsp: { deltaD: 15.6, deltaP: 16.0, deltaH: 42.3 },
};

describe('screenHydrogenStorageMaterials', () => {
  it('トルエンはDBTに近い(低Ra)', () => {
    const result = screenHydrogenStorageMaterials(DBT_HSP, DBT_R0, [TOLUENE, MCH, WATER]);
    expect(result.results.length).toBe(3);
    // トルエンが最もRa小さいはず
    expect(result.results[0].solventName).toBe('トルエン');
    // 水は最もRa大きい
    expect(result.results[2].solventName).toBe('水');
  });

  it('結果がRa昇順ソートされている', () => {
    const result = screenHydrogenStorageMaterials(DBT_HSP, DBT_R0, [WATER, TOLUENE, MCH]);
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].ra).toBeGreaterThanOrEqual(result.results[i - 1].ra);
    }
  });

  it('各結果にra, red, compatibilityLevelが含まれる', () => {
    const result = screenHydrogenStorageMaterials(DBT_HSP, DBT_R0, [TOLUENE]);
    const r = result.results[0];
    expect(r.ra).toBeGreaterThan(0);
    expect(r.red).toBeGreaterThan(0);
    expect(r.compatibilityLevel).toBeDefined();
    expect(r.solventName).toBe('トルエン');
    expect(r.solventHSP).toEqual(TOLUENE.hsp);
  });

  it('carrierHSPとR0が結果に含まれる', () => {
    const result = screenHydrogenStorageMaterials(DBT_HSP, DBT_R0, [TOLUENE]);
    expect(result.carrierHSP).toEqual(DBT_HSP);
    expect(result.carrierR0).toBe(DBT_R0);
  });

  it('空配列でエラー', () => {
    expect(() => screenHydrogenStorageMaterials(DBT_HSP, DBT_R0, [])).toThrow('溶媒候補を1つ以上');
  });

  it('R0<=0でエラー', () => {
    expect(() => screenHydrogenStorageMaterials(DBT_HSP, 0, [TOLUENE])).toThrow('R₀は正の数値');
    expect(() => screenHydrogenStorageMaterials(DBT_HSP, -1, [TOLUENE])).toThrow('R₀は正の数値');
  });

  it('evaluatedAtがDate', () => {
    const result = screenHydrogenStorageMaterials(DBT_HSP, DBT_R0, [TOLUENE]);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });
});

describe('classifyH2StorageCompatibility', () => {
  it('RED<0.5 → Excellent', () => {
    expect(classifyH2StorageCompatibility(0.3)).toBe(H2StorageCompatibilityLevel.Excellent);
  });
  it('0.5<=RED<1.0 → Good', () => {
    expect(classifyH2StorageCompatibility(0.5)).toBe(H2StorageCompatibilityLevel.Good);
  });
  it('1.0<=RED<1.5 → Moderate', () => {
    expect(classifyH2StorageCompatibility(1.0)).toBe(H2StorageCompatibilityLevel.Moderate);
  });
  it('RED>=1.5 → Poor', () => {
    expect(classifyH2StorageCompatibility(2.0)).toBe(H2StorageCompatibilityLevel.Poor);
  });
});

describe('getH2StorageCompatibilityLevelInfo', () => {
  it('全レベルがlabelとdescriptionを返す', () => {
    for (const level of [H2StorageCompatibilityLevel.Excellent, H2StorageCompatibilityLevel.Good, H2StorageCompatibilityLevel.Moderate, H2StorageCompatibilityLevel.Poor]) {
      const info = getH2StorageCompatibilityLevelInfo(level);
      expect(info.label).toBeTruthy();
      expect(info.description).toBeTruthy();
    }
  });
});
