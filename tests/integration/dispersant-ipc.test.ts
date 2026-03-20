/**
 * 分散剤選定 IPC層統合テスト
 * DB → コアロジック連携をテスト（IPCハンドラーが使うフローを直接テスト）
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeDatabase, migrateDatabase } from '../../src/db/schema';
import { SqliteDispersantRepository } from '../../src/db/sqlite-repository';
import { seedDispersants } from '../../src/db/seed-dispersants';
import { screenDispersants, screenSolventsForDispersant, screenDispersantsFallback, DEFAULT_DISPERSANT_THRESHOLDS } from '../../src/core/dispersant-selection';
import type { NanoParticle, Solvent } from '../../src/core/types';

function createSeededDb(): Database.Database {
  const db = new Database(':memory:');
  initializeDatabase(db);
  migrateDatabase(db);
  seedDispersants(db);
  return db;
}

const carbonBlack: NanoParticle = {
  id: 1, name: 'カーボンブラック', nameEn: 'Carbon Black',
  category: 'carbon', coreMaterial: 'Carbon Black',
  surfaceLigand: null,
  hsp: { deltaD: 17.2, deltaP: 8.5, deltaH: 11.6 },
  r0: 6.1, particleSize: null, notes: null,
};

const nmp: Solvent = {
  id: 1, name: 'NMP', nameEn: 'N-Methyl-2-pyrrolidone',
  casNumber: '872-50-4',
  hsp: { deltaD: 18.0, deltaP: 12.3, deltaH: 7.2 },
  molarVolume: 96.5, molWeight: 99.13,
  boilingPoint: 202, viscosity: 1.67,
  specificGravity: 1.028, surfaceTension: 40.7,
  notes: null,
};

const water: Solvent = {
  id: 2, name: '水', nameEn: 'Water',
  casNumber: '7732-18-5',
  hsp: { deltaD: 15.5, deltaP: 16.0, deltaH: 42.3 },
  molarVolume: 18.0, molWeight: 18.02,
  boilingPoint: 100, viscosity: 0.89,
  specificGravity: 1.0, surfaceTension: 72.8,
  notes: null,
};

describe('分散剤選定: DB→コアロジック統合テスト', () => {
  let db: Database.Database;
  let repo: SqliteDispersantRepository;

  beforeEach(() => {
    db = createSeededDb();
    repo = new SqliteDispersantRepository(db);
  });

  it('シードデータが正常に投入される', () => {
    const all = repo.getAll();
    expect(all.length).toBeGreaterThanOrEqual(10);
  });

  it('分散剤スクリーニング: カーボンブラック + NMP', () => {
    const dispersants = repo.getAll();
    const result = screenDispersants(carbonBlack, nmp, dispersants, DEFAULT_DISPERSANT_THRESHOLDS);

    expect(result.results.length).toBe(dispersants.length);
    expect(result.particle).toBe(carbonBlack);
    expect(result.solvent).toBe(nmp);
    // compositeScore昇順
    for (let i = 1; i < result.results.length; i++) {
      expect(result.results[i].compositeScore).toBeGreaterThanOrEqual(result.results[i - 1].compositeScore);
    }
    // 全結果にアンカー・溶媒和鎖の評価が含まれる
    for (const r of result.results) {
      expect(r.raAnchor).toBeGreaterThanOrEqual(0);
      expect(r.redAnchor).toBeGreaterThanOrEqual(0);
      expect(r.raSolvation).toBeGreaterThanOrEqual(0);
      expect(r.redSolvation).toBeGreaterThanOrEqual(0);
      expect(r.compositeScore).toBeGreaterThanOrEqual(0);
    }
  });

  it('逆引き溶媒スクリーニング: カーボンブラック + BYK-163', () => {
    const dispersant = repo.search('BYK-163')[0];
    expect(dispersant).toBeDefined();

    const result = screenSolventsForDispersant(
      carbonBlack, dispersant, [nmp, water], DEFAULT_DISPERSANT_THRESHOLDS,
    );

    expect(result.results).toHaveLength(2);
    // NMPの方がorganic分散媒として良いはず
    expect(result.results[0].solvent.name).toBe('NMP');
  });

  it('フォールバックスクリーニング: 全体HSPのみ', () => {
    const dispersants = repo.getAll();
    const results = screenDispersantsFallback(carbonBlack, dispersants, DEFAULT_DISPERSANT_THRESHOLDS);

    expect(results.length).toBe(dispersants.length);
    // RED昇順
    for (let i = 1; i < results.length; i++) {
      expect(results[i].redOverall).toBeGreaterThanOrEqual(results[i - 1].redOverall);
    }
  });

  it('タイプ別取得 → スクリーニング', () => {
    const polymeric = repo.getByType('polymeric');
    expect(polymeric.length).toBeGreaterThanOrEqual(3);

    const result = screenDispersants(carbonBlack, nmp, polymeric, DEFAULT_DISPERSANT_THRESHOLDS);
    expect(result.results.length).toBe(polymeric.length);
  });

  it('シードデータの二重投入はスキップされる', () => {
    const countBefore = repo.getAll().length;
    seedDispersants(db);
    const countAfter = repo.getAll().length;
    expect(countAfter).toBe(countBefore);
  });
});
