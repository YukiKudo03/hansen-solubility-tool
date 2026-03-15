import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeDatabase } from '../../src/db/schema';
import { seedDatabase, SOLVENT_SEEDS, POLYMER_GROUP_SEEDS } from '../../src/db/seed-data';
import { SqlitePartsRepository, SqliteSolventRepository } from '../../src/db/sqlite-repository';

let db: Database.Database;

beforeEach(() => {
  db = new Database(':memory:');
  initializeDatabase(db);
  seedDatabase(db);
});

describe('シードデータ', () => {
  it('溶媒が正しい数だけ投入される', () => {
    const repo = new SqliteSolventRepository(db);
    const solvents = repo.getAllSolvents();
    expect(solvents.length).toBe(SOLVENT_SEEDS.length);
  });

  it('ポリマーグループが正しい数だけ投入される', () => {
    const repo = new SqlitePartsRepository(db);
    const groups = repo.getAllGroups();
    expect(groups.length).toBe(POLYMER_GROUP_SEEDS.length);
  });

  it('各グループの部品数が正しい', () => {
    const repo = new SqlitePartsRepository(db);
    const groups = repo.getAllGroups();
    for (let i = 0; i < POLYMER_GROUP_SEEDS.length; i++) {
      expect(groups[i].parts.length).toBe(POLYMER_GROUP_SEEDS[i].parts.length);
    }
  });

  it('トルエンのデータが正しい', () => {
    const repo = new SqliteSolventRepository(db);
    const results = repo.searchSolvents('トルエン');
    expect(results.length).toBe(1);
    expect(results[0].hsp.deltaD).toBe(18.0);
    expect(results[0].hsp.deltaP).toBe(1.4);
    expect(results[0].hsp.deltaH).toBe(2.0);
    expect(results[0].casNumber).toBe('108-88-3');
  });

  it('ポリスチレンのデータが正しい', () => {
    const repo = new SqlitePartsRepository(db);
    const groups = repo.getAllGroups();
    const ps = groups.flatMap((g) => g.parts).find((p) => p.materialType === 'PS');
    expect(ps).toBeDefined();
    expect(ps!.hsp.deltaD).toBe(18.5);
    expect(ps!.hsp.deltaP).toBe(4.5);
    expect(ps!.hsp.deltaH).toBe(2.9);
    expect(ps!.r0).toBe(5.3);
  });

  it('全ポリマー部品の合計数が正しい', () => {
    const expectedTotal = POLYMER_GROUP_SEEDS.reduce((sum, pg) => sum + pg.parts.length, 0);
    const repo = new SqlitePartsRepository(db);
    const groups = repo.getAllGroups();
    const actualTotal = groups.reduce((sum, g) => sum + g.parts.length, 0);
    expect(actualTotal).toBe(expectedTotal);
  });
});
