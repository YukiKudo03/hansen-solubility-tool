/**
 * SQLiteスキーマ定義・マイグレーション
 */
import Database from 'better-sqlite3';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS parts_groups (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS parts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id      INTEGER NOT NULL REFERENCES parts_groups(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  material_type TEXT,
  delta_d       REAL NOT NULL,
  delta_p       REAL NOT NULL,
  delta_h       REAL NOT NULL,
  r0            REAL NOT NULL,
  notes         TEXT,
  created_at    TEXT DEFAULT (datetime('now')),
  updated_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS solvents (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  name_en      TEXT,
  cas_number   TEXT,
  delta_d      REAL NOT NULL,
  delta_p      REAL NOT NULL,
  delta_h      REAL NOT NULL,
  molar_volume REAL,
  mol_weight   REAL,
  notes        TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

/**
 * データベースを初期化する（テーブル作成）
 */
export function initializeDatabase(db: Database.Database): void {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(SCHEMA_SQL);
}
