import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeDatabase } from '../../src/db/schema';
import { SqliteSolventRepository } from '../../src/db/sqlite-repository';
import { calculateMixture } from '../../src/core/mixture';
import type { MixtureComponent } from '../../src/core/types';

let db: Database.Database;
let solventRepo: SqliteSolventRepository;

beforeEach(() => {
  db = new Database(':memory:');
  initializeDatabase(db);
  solventRepo = new SqliteSolventRepository(db);
});

describe('混合溶媒の統合テスト', () => {
  it('2溶媒を混合してDBに登録・取得', () => {
    // 溶媒を登録
    const toluene = solventRepo.createSolvent({
      name: 'トルエン', nameEn: 'Toluene',
      deltaD: 18.0, deltaP: 1.4, deltaH: 2.0,
      molarVolume: 106.8, molWeight: 92.14,
      boilingPoint: 110.6, viscosity: 0.56, specificGravity: 0.867, surfaceTension: 28.4,
    });
    const ethanol = solventRepo.createSolvent({
      name: 'エタノール', nameEn: 'Ethanol',
      deltaD: 15.8, deltaP: 8.8, deltaH: 19.4,
      molarVolume: 58.5, molWeight: 46.07,
      boilingPoint: 78.4, viscosity: 1.07, specificGravity: 0.789, surfaceTension: 22.1,
    });

    // 混合計算
    const components: MixtureComponent[] = [
      { solvent: toluene, volumeRatio: 3 },
      { solvent: ethanol, volumeRatio: 1 },
    ];
    const result = calculateMixture(components);

    // DB登録
    const mixture = solventRepo.createSolvent({
      name: 'トルエン/エタノール 3:1',
      deltaD: result.hsp.deltaD,
      deltaP: result.hsp.deltaP,
      deltaH: result.hsp.deltaH,
      molarVolume: result.molarVolume ?? undefined,
      molWeight: result.molWeight ?? undefined,
      boilingPoint: result.boilingPoint ?? undefined,
      viscosity: result.viscosity ?? undefined,
      specificGravity: result.specificGravity ?? undefined,
      surfaceTension: result.surfaceTension ?? undefined,
      notes: result.compositionNote,
    });

    // 取得して検証
    const fetched = solventRepo.getSolventById(mixture.id);
    expect(fetched).not.toBeNull();
    expect(fetched!.name).toBe('トルエン/エタノール 3:1');
    expect(fetched!.hsp.deltaD).toBeCloseTo(17.45, 1);
    expect(fetched!.hsp.deltaP).toBeCloseTo(3.25, 1);
    expect(fetched!.hsp.deltaH).toBeCloseTo(6.35, 1);
    expect(fetched!.notes).toContain('トルエン');
    expect(fetched!.notes).toContain('エタノール');
    expect(fetched!.notes).toContain('75.0%');
  });

  it('混合溶媒が検索で見つかる', () => {
    solventRepo.createSolvent({
      name: 'テスト混合液A', deltaD: 17.0, deltaP: 5.0, deltaH: 10.0,
      notes: '混合溶媒: テスト',
    });

    const results = solventRepo.searchSolvents('混合液');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('テスト混合液A');
  });

  it('物性nullの溶媒を含む混合のDB登録', () => {
    const s1 = solventRepo.createSolvent({
      name: 'A', deltaD: 18.0, deltaP: 1.0, deltaH: 2.0,
      boilingPoint: 100, viscosity: 0.5, specificGravity: 0.9, surfaceTension: 25.0,
    });
    const s2 = solventRepo.createSolvent({
      name: 'B', deltaD: 16.0, deltaP: 3.0, deltaH: 5.0,
      // 物性値なし
    });

    const result = calculateMixture([
      { solvent: s1, volumeRatio: 1 },
      { solvent: s2, volumeRatio: 1 },
    ]);

    expect(result.hsp.deltaD).toBeCloseTo(17.0, 1);
    expect(result.boilingPoint).toBeNull();
    expect(result.viscosity).toBeNull();

    // null物性でもDB登録可能
    const mixture = solventRepo.createSolvent({
      name: 'A+B混合',
      deltaD: result.hsp.deltaD,
      deltaP: result.hsp.deltaP,
      deltaH: result.hsp.deltaH,
      notes: result.compositionNote,
    });
    expect(mixture.boilingPoint).toBeNull();
  });
});
