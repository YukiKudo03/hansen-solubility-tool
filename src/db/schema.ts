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
  molar_volume    REAL,
  mol_weight      REAL,
  boiling_point   REAL,
  viscosity       REAL,
  specific_gravity REAL,
  surface_tension REAL,
  notes           TEXT,
  created_at   TEXT DEFAULT (datetime('now')),
  updated_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS nano_particles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  name_en         TEXT,
  category        TEXT NOT NULL DEFAULT 'other',
  core_material   TEXT NOT NULL,
  surface_ligand  TEXT,
  delta_d         REAL NOT NULL,
  delta_p         REAL NOT NULL,
  delta_h         REAL NOT NULL,
  r0              REAL NOT NULL,
  particle_size   REAL,
  notes           TEXT,
  created_at      TEXT DEFAULT (datetime('now')),
  updated_at      TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drugs (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  name                  TEXT NOT NULL,
  name_en               TEXT,
  cas_number            TEXT,
  delta_d               REAL NOT NULL,
  delta_p               REAL NOT NULL,
  delta_h               REAL NOT NULL,
  r0                    REAL NOT NULL,
  mol_weight            REAL,
  log_p                 REAL,
  therapeutic_category  TEXT,
  notes                 TEXT,
  created_at            TEXT DEFAULT (datetime('now')),
  updated_at            TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dispersants (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL,
  name_en           TEXT,
  dispersant_type   TEXT NOT NULL DEFAULT 'other',
  anchor_delta_d    REAL NOT NULL,
  anchor_delta_p    REAL NOT NULL,
  anchor_delta_h    REAL NOT NULL,
  anchor_r0         REAL NOT NULL,
  solvation_delta_d REAL NOT NULL,
  solvation_delta_p REAL NOT NULL,
  solvation_delta_h REAL NOT NULL,
  solvation_r0      REAL NOT NULL,
  overall_delta_d   REAL NOT NULL,
  overall_delta_p   REAL NOT NULL,
  overall_delta_h   REAL NOT NULL,
  hlb               REAL,
  mol_weight        REAL,
  trade_name        TEXT,
  manufacturer      TEXT,
  notes             TEXT,
  created_at        TEXT DEFAULT (datetime('now')),
  updated_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  pipeline    TEXT NOT NULL,
  params_json TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS evaluation_history (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  pipeline        TEXT NOT NULL,
  params_json     TEXT NOT NULL,
  result_json     TEXT NOT NULL,
  thresholds_json TEXT NOT NULL,
  note            TEXT,
  evaluated_at    TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_history_pipeline ON evaluation_history(pipeline);
CREATE INDEX IF NOT EXISTS idx_history_date ON evaluation_history(evaluated_at);

CREATE TABLE IF NOT EXISTS experimental_results (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  import_batch_id     TEXT NOT NULL,
  polymer_id          INTEGER NOT NULL REFERENCES parts(id),
  solvent_id          INTEGER,
  solvent_name_raw    TEXT NOT NULL,
  result              TEXT NOT NULL CHECK(result IN ('good','partial','bad')),
  quantitative_value  REAL,
  quantitative_unit   TEXT,
  temperature_c       REAL,
  concentration       TEXT,
  notes               TEXT,
  created_at          TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (solvent_id) REFERENCES solvents(id)
);
CREATE INDEX IF NOT EXISTS idx_expr_batch ON experimental_results(import_batch_id);
CREATE INDEX IF NOT EXISTS idx_expr_polymer ON experimental_results(polymer_id);

CREATE TABLE IF NOT EXISTS solvent_name_mappings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  raw_name    TEXT NOT NULL UNIQUE,
  solvent_id  INTEGER NOT NULL,
  created_at  TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (solvent_id) REFERENCES solvents(id)
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

/**
 * 既存DBのマイグレーション（新カラム追加）
 * ALTER TABLE ADD COLUMN は冪等に実行（既存カラムはスキップ）
 */
export function migrateDatabase(db: Database.Database): void {
  // 溶媒テーブルへのカラム追加
  const solventColumns = db.pragma('table_info(solvents)') as { name: string }[];
  const existingSolventCols = new Set(solventColumns.map((c) => c.name));

  const solventNewCols: Array<{ name: string; type: string }> = [
    { name: 'boiling_point', type: 'REAL' },
    { name: 'viscosity', type: 'REAL' },
    { name: 'specific_gravity', type: 'REAL' },
    { name: 'surface_tension', type: 'REAL' },
  ];

  for (const col of solventNewCols) {
    if (!existingSolventCols.has(col.name)) {
      db.prepare(`ALTER TABLE solvents ADD COLUMN ${col.name} ${col.type}`).run();
    }
  }

  // dispersantsテーブルの冪等作成（既存DBへのマイグレーション対応）
  db.exec(DISPERSANTS_TABLE_SQL);
}

const DISPERSANTS_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS dispersants (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    name              TEXT NOT NULL,
    name_en           TEXT,
    dispersant_type   TEXT NOT NULL DEFAULT 'other',
    anchor_delta_d    REAL NOT NULL,
    anchor_delta_p    REAL NOT NULL,
    anchor_delta_h    REAL NOT NULL,
    anchor_r0         REAL NOT NULL,
    solvation_delta_d REAL NOT NULL,
    solvation_delta_p REAL NOT NULL,
    solvation_delta_h REAL NOT NULL,
    solvation_r0      REAL NOT NULL,
    overall_delta_d   REAL NOT NULL,
    overall_delta_p   REAL NOT NULL,
    overall_delta_h   REAL NOT NULL,
    hlb               REAL,
    mol_weight        REAL,
    trade_name        TEXT,
    manufacturer      TEXT,
    notes             TEXT,
    created_at        TEXT DEFAULT (datetime('now')),
    updated_at        TEXT DEFAULT (datetime('now'))
  );
`;
