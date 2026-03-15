import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { initializeDatabase, migrateDatabase } from '../../src/db/schema';
import {
  SqlitePartsRepository,
  SqliteSolventRepository,
  SqliteSettingsRepository,
} from '../../src/db/sqlite-repository';
import { DEFAULT_THRESHOLDS } from '../../src/core/risk';

let db: Database.Database;
let partsRepo: SqlitePartsRepository;
let solventRepo: SqliteSolventRepository;
let settingsRepo: SqliteSettingsRepository;

beforeEach(() => {
  db = new Database(':memory:');
  initializeDatabase(db);
  partsRepo = new SqlitePartsRepository(db);
  solventRepo = new SqliteSolventRepository(db);
  settingsRepo = new SqliteSettingsRepository(db);
});

describe('SqlitePartsRepository', () => {
  describe('グループCRUD', () => {
    it('グループを作成して取得', () => {
      const group = partsRepo.createGroup({ name: 'テストグループ', description: '説明文' });
      expect(group.id).toBe(1);
      expect(group.name).toBe('テストグループ');
      expect(group.description).toBe('説明文');
      expect(group.parts).toEqual([]);
    });

    it('全グループを取得', () => {
      partsRepo.createGroup({ name: 'グループA' });
      partsRepo.createGroup({ name: 'グループB' });
      const groups = partsRepo.getAllGroups();
      expect(groups.length).toBe(2);
      expect(groups[0].name).toBe('グループA');
      expect(groups[1].name).toBe('グループB');
    });

    it('IDでグループを取得', () => {
      partsRepo.createGroup({ name: 'テスト' });
      const group = partsRepo.getGroupById(1);
      expect(group).not.toBeNull();
      expect(group!.name).toBe('テスト');
    });

    it('存在しないIDでnull', () => {
      expect(partsRepo.getGroupById(999)).toBeNull();
    });

    it('グループを更新', () => {
      partsRepo.createGroup({ name: '元の名前' });
      const updated = partsRepo.updateGroup(1, { name: '新しい名前' });
      expect(updated).not.toBeNull();
      expect(updated!.name).toBe('新しい名前');
    });

    it('存在しないグループの更新でnull', () => {
      expect(partsRepo.updateGroup(999, { name: 'X' })).toBeNull();
    });

    it('グループを削除', () => {
      partsRepo.createGroup({ name: 'テスト' });
      expect(partsRepo.deleteGroup(1)).toBe(true);
      expect(partsRepo.getGroupById(1)).toBeNull();
    });

    it('存在しないグループの削除でfalse', () => {
      expect(partsRepo.deleteGroup(999)).toBe(false);
    });
  });

  describe('部品CRUD', () => {
    beforeEach(() => {
      partsRepo.createGroup({ name: 'グループ' });
    });

    it('部品を作成して取得', () => {
      const part = partsRepo.createPart({
        groupId: 1,
        name: 'ポリスチレン',
        materialType: 'PS',
        deltaD: 18.5,
        deltaP: 4.5,
        deltaH: 2.9,
        r0: 5.3,
      });
      expect(part.id).toBe(1);
      expect(part.name).toBe('ポリスチレン');
      expect(part.hsp.deltaD).toBe(18.5);
      expect(part.r0).toBe(5.3);
    });

    it('グループの部品一覧を取得', () => {
      partsRepo.createPart({
        groupId: 1,
        name: 'PS',
        deltaD: 18.5,
        deltaP: 4.5,
        deltaH: 2.9,
        r0: 5.3,
      });
      partsRepo.createPart({
        groupId: 1,
        name: 'PE',
        deltaD: 18.0,
        deltaP: 3.0,
        deltaH: 2.0,
        r0: 4.0,
      });
      const parts = partsRepo.getPartsByGroupId(1);
      expect(parts.length).toBe(2);
    });

    it('グループ取得時に部品も含まれる', () => {
      partsRepo.createPart({
        groupId: 1,
        name: 'PS',
        deltaD: 18.5,
        deltaP: 4.5,
        deltaH: 2.9,
        r0: 5.3,
      });
      const group = partsRepo.getGroupById(1);
      expect(group!.parts.length).toBe(1);
      expect(group!.parts[0].name).toBe('PS');
    });

    it('部品を更新', () => {
      partsRepo.createPart({
        groupId: 1,
        name: '旧名',
        deltaD: 18.0,
        deltaP: 3.0,
        deltaH: 2.0,
        r0: 4.0,
      });
      const updated = partsRepo.updatePart(1, { name: '新名' });
      expect(updated!.name).toBe('新名');
      expect(updated!.hsp.deltaD).toBe(18.0); // 変更していない値は保持
    });

    it('存在しない部品の更新でnull', () => {
      expect(partsRepo.updatePart(999, { name: 'X' })).toBeNull();
    });

    it('部品を削除', () => {
      partsRepo.createPart({
        groupId: 1,
        name: 'PS',
        deltaD: 18.5,
        deltaP: 4.5,
        deltaH: 2.9,
        r0: 5.3,
      });
      expect(partsRepo.deletePart(1)).toBe(true);
      expect(partsRepo.getPartsByGroupId(1)).toEqual([]);
    });

    it('存在しない部品の削除でfalse', () => {
      expect(partsRepo.deletePart(999)).toBe(false);
    });
  });

  describe('カスケード削除', () => {
    it('グループ削除で配下の部品も削除される', () => {
      partsRepo.createGroup({ name: 'テスト' });
      partsRepo.createPart({
        groupId: 1,
        name: 'PS',
        deltaD: 18.5,
        deltaP: 4.5,
        deltaH: 2.9,
        r0: 5.3,
      });
      partsRepo.deleteGroup(1);
      expect(partsRepo.getPartsByGroupId(1)).toEqual([]);
    });
  });
});

describe('SqliteSolventRepository', () => {
  it('溶媒を作成して取得', () => {
    const solvent = solventRepo.createSolvent({
      name: 'トルエン',
      nameEn: 'Toluene',
      casNumber: '108-88-3',
      deltaD: 18.0,
      deltaP: 1.4,
      deltaH: 2.0,
      molarVolume: 106.2,
      molWeight: 92.14,
    });
    expect(solvent.id).toBe(1);
    expect(solvent.name).toBe('トルエン');
    expect(solvent.nameEn).toBe('Toluene');
    expect(solvent.hsp.deltaD).toBe(18.0);
  });

  it('全溶媒を取得', () => {
    solventRepo.createSolvent({ name: 'A', deltaD: 1, deltaP: 1, deltaH: 1 });
    solventRepo.createSolvent({ name: 'B', deltaD: 2, deltaP: 2, deltaH: 2 });
    expect(solventRepo.getAllSolvents().length).toBe(2);
  });

  it('IDで溶媒を取得', () => {
    solventRepo.createSolvent({ name: 'テスト', deltaD: 1, deltaP: 1, deltaH: 1 });
    expect(solventRepo.getSolventById(1)!.name).toBe('テスト');
  });

  it('存在しないIDでnull', () => {
    expect(solventRepo.getSolventById(999)).toBeNull();
  });

  it('日本語名で検索', () => {
    solventRepo.createSolvent({ name: 'トルエン', nameEn: 'Toluene', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 });
    solventRepo.createSolvent({ name: 'アセトン', nameEn: 'Acetone', deltaD: 15.5, deltaP: 10.4, deltaH: 7.0 });
    const results = solventRepo.searchSolvents('トル');
    expect(results.length).toBe(1);
    expect(results[0].name).toBe('トルエン');
  });

  it('英語名で検索', () => {
    solventRepo.createSolvent({ name: 'トルエン', nameEn: 'Toluene', deltaD: 18.0, deltaP: 1.4, deltaH: 2.0 });
    const results = solventRepo.searchSolvents('Tol');
    expect(results.length).toBe(1);
  });

  it('CAS番号で検索', () => {
    solventRepo.createSolvent({
      name: 'トルエン',
      casNumber: '108-88-3',
      deltaD: 18.0,
      deltaP: 1.4,
      deltaH: 2.0,
    });
    const results = solventRepo.searchSolvents('108-88');
    expect(results.length).toBe(1);
  });

  it('空文字の検索で全件返す', () => {
    solventRepo.createSolvent({ name: 'A', deltaD: 1, deltaP: 1, deltaH: 1 });
    solventRepo.createSolvent({ name: 'B', deltaD: 2, deltaP: 2, deltaH: 2 });
    expect(solventRepo.searchSolvents('').length).toBe(2);
  });

  it('溶媒を更新', () => {
    solventRepo.createSolvent({ name: '旧名', deltaD: 1, deltaP: 1, deltaH: 1 });
    const updated = solventRepo.updateSolvent(1, { name: '新名' });
    expect(updated!.name).toBe('新名');
  });

  it('存在しない溶媒の更新でnull', () => {
    expect(solventRepo.updateSolvent(999, { name: 'X' })).toBeNull();
  });

  it('溶媒を削除', () => {
    solventRepo.createSolvent({ name: 'テスト', deltaD: 1, deltaP: 1, deltaH: 1 });
    expect(solventRepo.deleteSolvent(1)).toBe(true);
    expect(solventRepo.getSolventById(1)).toBeNull();
  });

  it('存在しない溶媒の削除でfalse', () => {
    expect(solventRepo.deleteSolvent(999)).toBe(false);
  });

  it('物性値を含む溶媒を作成して取得', () => {
    const solvent = solventRepo.createSolvent({
      name: 'トルエン',
      deltaD: 18.0,
      deltaP: 1.4,
      deltaH: 2.0,
      boilingPoint: 110.6,
      viscosity: 0.56,
      specificGravity: 0.867,
      surfaceTension: 28.4,
    });
    expect(solvent.boilingPoint).toBe(110.6);
    expect(solvent.viscosity).toBe(0.56);
    expect(solvent.specificGravity).toBe(0.867);
    expect(solvent.surfaceTension).toBe(28.4);
  });

  it('物性値がnullの溶媒を作成', () => {
    const solvent = solventRepo.createSolvent({
      name: 'テスト',
      deltaD: 1,
      deltaP: 1,
      deltaH: 1,
    });
    expect(solvent.boilingPoint).toBeNull();
    expect(solvent.viscosity).toBeNull();
    expect(solvent.specificGravity).toBeNull();
    expect(solvent.surfaceTension).toBeNull();
  });

  it('物性値のみ更新', () => {
    solventRepo.createSolvent({ name: 'テスト', deltaD: 1, deltaP: 1, deltaH: 1 });
    const updated = solventRepo.updateSolvent(1, {
      boilingPoint: 100,
      viscosity: 0.89,
      specificGravity: 0.997,
      surfaceTension: 72.0,
    });
    expect(updated!.boilingPoint).toBe(100);
    expect(updated!.viscosity).toBe(0.89);
    expect(updated!.specificGravity).toBe(0.997);
    expect(updated!.surfaceTension).toBe(72.0);
    expect(updated!.name).toBe('テスト'); // 他のフィールドは保持
  });

  it('沸点の負値を保存できる（ジエチルエーテル等）', () => {
    const solvent = solventRepo.createSolvent({
      name: 'ジエチルエーテル',
      deltaD: 14.5,
      deltaP: 2.9,
      deltaH: 5.1,
      boilingPoint: -34.6,
    });
    expect(solvent.boilingPoint).toBe(-34.6);
  });
});

describe('migrateDatabase', () => {
  it('マイグレーションは冪等（2回実行してもエラーなし）', () => {
    migrateDatabase(db);
    migrateDatabase(db);
    // エラーが出なければ成功
    const solvent = solventRepo.createSolvent({
      name: 'テスト',
      deltaD: 1,
      deltaP: 1,
      deltaH: 1,
      boilingPoint: 100,
    });
    expect(solvent.boilingPoint).toBe(100);
  });
});

describe('SqliteSettingsRepository', () => {
  it('設定の読み書き', () => {
    settingsRepo.setSetting('key1', 'value1');
    expect(settingsRepo.getSetting('key1')).toBe('value1');
  });

  it('存在しない設定でnull', () => {
    expect(settingsRepo.getSetting('nonexistent')).toBeNull();
  });

  it('設定の上書き', () => {
    settingsRepo.setSetting('key1', 'old');
    settingsRepo.setSetting('key1', 'new');
    expect(settingsRepo.getSetting('key1')).toBe('new');
  });

  it('デフォルト閾値を返す（未設定時）', () => {
    const thresholds = settingsRepo.getThresholds();
    expect(thresholds).toEqual(DEFAULT_THRESHOLDS);
  });

  it('閾値を保存・取得', () => {
    const custom = { dangerousMax: 0.3, warningMax: 0.6, cautionMax: 1.0, holdMax: 1.5 };
    settingsRepo.setThresholds(custom);
    expect(settingsRepo.getThresholds()).toEqual(custom);
  });
});
