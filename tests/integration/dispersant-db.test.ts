/**
 * 分散剤データベース層 統合テスト (TDD: テストファースト)
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeDatabase, migrateDatabase } from '../../src/db/schema';
import { SqliteDispersantRepository } from '../../src/db/sqlite-repository';
import type { CreateDispersantDto } from '../../src/db/repository';
import type { DispersantType } from '../../src/core/types';

function createTestDb(): Database.Database {
  const db = new Database(':memory:');
  initializeDatabase(db);
  migrateDatabase(db);
  return db;
}

const validDto: CreateDispersantDto = {
  name: 'BYK-163',
  nameEn: 'BYK-163',
  dispersantType: 'polymeric',
  anchorDeltaD: 17.0, anchorDeltaP: 8.0, anchorDeltaH: 11.0, anchorR0: 6.0,
  solvationDeltaD: 18.0, solvationDeltaP: 12.0, solvationDeltaH: 7.0, solvationR0: 8.0,
  overallDeltaD: 17.5, overallDeltaP: 10.0, overallDeltaH: 9.0,
  hlb: 12.0,
  molWeight: 5000,
  tradeName: 'BYK-163',
  manufacturer: 'BYK-Chemie',
  notes: '有機顔料用高分子分散剤',
};

describe('SqliteDispersantRepository', () => {
  let db: Database.Database;
  let repo: SqliteDispersantRepository;

  beforeEach(() => {
    db = createTestDb();
    repo = new SqliteDispersantRepository(db);
  });

  describe('CRUD操作', () => {
    it('create: 分散剤を作成できる', () => {
      const dispersant = repo.create(validDto);
      expect(dispersant.id).toBeGreaterThan(0);
      expect(dispersant.name).toBe('BYK-163');
      expect(dispersant.dispersantType).toBe('polymeric');
      expect(dispersant.anchorHSP).toEqual({ deltaD: 17.0, deltaP: 8.0, deltaH: 11.0 });
      expect(dispersant.anchorR0).toBe(6.0);
      expect(dispersant.solvationHSP).toEqual({ deltaD: 18.0, deltaP: 12.0, deltaH: 7.0 });
      expect(dispersant.solvationR0).toBe(8.0);
      expect(dispersant.overallHSP).toEqual({ deltaD: 17.5, deltaP: 10.0, deltaH: 9.0 });
      expect(dispersant.hlb).toBe(12.0);
      expect(dispersant.molWeight).toBe(5000);
      expect(dispersant.tradeName).toBe('BYK-163');
      expect(dispersant.manufacturer).toBe('BYK-Chemie');
    });

    it('getAll: 全件取得', () => {
      repo.create(validDto);
      repo.create({ ...validDto, name: 'DISPERBYK-111' });
      const all = repo.getAll();
      expect(all).toHaveLength(2);
    });

    it('getById: ID指定で取得', () => {
      const created = repo.create(validDto);
      const found = repo.getById(created.id);
      expect(found).not.toBeNull();
      expect(found!.name).toBe('BYK-163');
    });

    it('getById: 存在しないIDでnull', () => {
      expect(repo.getById(999)).toBeNull();
    });

    it('getByType: タイプ指定で取得', () => {
      repo.create(validDto);
      repo.create({ ...validDto, name: 'SDS', dispersantType: 'surfactant' });
      const polymeric = repo.getByType('polymeric');
      expect(polymeric).toHaveLength(1);
      expect(polymeric[0].name).toBe('BYK-163');
    });

    it('search: 名前・英名で検索', () => {
      repo.create(validDto);
      repo.create({ ...validDto, name: 'Solsperse 24000', nameEn: 'Solsperse 24000', tradeName: 'Solsperse 24000', manufacturer: 'Lubrizol' });
      const results = repo.search('BYK');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('BYK-163');
    });

    it('search: メーカー名・商品名でも検索', () => {
      repo.create(validDto);
      const results = repo.search('Chemie');
      expect(results).toHaveLength(1);
    });

    it('update: 部分更新', () => {
      const created = repo.create(validDto);
      const updated = repo.update(created.id, { name: 'BYK-163 Updated', hlb: 14.0 });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('BYK-163 Updated');
      expect(updated!.hlb).toBe(14.0);
      // 変更していないフィールドは元のまま
      expect(updated!.anchorHSP.deltaD).toBe(17.0);
    });

    it('update: 存在しないIDでnull', () => {
      expect(repo.update(999, { name: 'x' })).toBeNull();
    });

    it('delete: 削除成功', () => {
      const created = repo.create(validDto);
      expect(repo.delete(created.id)).toBe(true);
      expect(repo.getById(created.id)).toBeNull();
    });

    it('delete: 存在しないIDでfalse', () => {
      expect(repo.delete(999)).toBe(false);
    });
  });

  describe('任意フィールド', () => {
    it('hlb, molWeight, tradeName, manufacturer, notes がnullでも作成可能', () => {
      const dto: CreateDispersantDto = {
        name: 'Simple',
        dispersantType: 'other',
        anchorDeltaD: 17.0, anchorDeltaP: 8.0, anchorDeltaH: 11.0, anchorR0: 6.0,
        solvationDeltaD: 18.0, solvationDeltaP: 12.0, solvationDeltaH: 7.0, solvationR0: 8.0,
        overallDeltaD: 17.5, overallDeltaP: 10.0, overallDeltaH: 9.0,
      };
      const created = repo.create(dto);
      expect(created.hlb).toBeNull();
      expect(created.molWeight).toBeNull();
      expect(created.tradeName).toBeNull();
      expect(created.manufacturer).toBeNull();
    });
  });
});

describe('migrateDatabase: dispersantsテーブルの冪等マイグレーション', () => {
  it('初回作成とマイグレーションの2回実行でエラーなし', () => {
    const db = new Database(':memory:');
    initializeDatabase(db);
    migrateDatabase(db);
    // 2回目
    migrateDatabase(db);
    // テーブルが存在することを確認
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='dispersants'").all();
    expect(tables).toHaveLength(1);
  });
});
