/**
 * 実験データリポジトリ — experimental_results + solvent_name_mappings の CRUD
 */
import Database from 'better-sqlite3';
import type { SolventNameMapping } from '../core/experimental-import';

/** 実験結果レコード（DB行） */
export interface ExperimentalResultRow {
  id: number;
  importBatchId: string;
  polymerId: number;
  solventId: number | null;
  solventNameRaw: string;
  result: 'good' | 'partial' | 'bad';
  quantitativeValue: number | null;
  quantitativeUnit: string | null;
  temperatureC: number | null;
  concentration: string | null;
  notes: string | null;
  createdAt: string;
}

/** 実験結果保存DTO */
export interface CreateExperimentalResultDto {
  importBatchId: string;
  polymerId: number;
  solventId: number | null;
  solventNameRaw: string;
  result: 'good' | 'partial' | 'bad';
  quantitativeValue?: number;
  quantitativeUnit?: string;
  temperatureC?: number;
  concentration?: string;
  notes?: string;
}

/** リポジトリインターフェース */
export interface ExperimentalRepository {
  saveResults(dtos: CreateExperimentalResultDto[]): ExperimentalResultRow[];
  getByPolymerId(polymerId: number): ExperimentalResultRow[];
  getByBatchId(batchId: string): ExperimentalResultRow[];
  deleteByBatchId(batchId: string): number;
  deleteByPolymerId(polymerId: number): number;

  saveMapping(rawName: string, solventId: number): SolventNameMapping;
  saveMappings(mappings: Array<{ rawName: string; solventId: number }>): SolventNameMapping[];
  getAllMappings(): SolventNameMapping[];
  deleteMapping(rawName: string): boolean;
}

function rowToExperimentalResult(row: Record<string, unknown>): ExperimentalResultRow {
  return {
    id: row.id as number,
    importBatchId: row.import_batch_id as string,
    polymerId: row.polymer_id as number,
    solventId: (row.solvent_id as number) ?? null,
    solventNameRaw: row.solvent_name_raw as string,
    result: row.result as 'good' | 'partial' | 'bad',
    quantitativeValue: (row.quantitative_value as number) ?? null,
    quantitativeUnit: (row.quantitative_unit as string) ?? null,
    temperatureC: (row.temperature_c as number) ?? null,
    concentration: (row.concentration as string) ?? null,
    notes: (row.notes as string) ?? null,
    createdAt: row.created_at as string,
  };
}

function rowToMapping(row: Record<string, unknown>): SolventNameMapping {
  return {
    id: row.id as number,
    rawName: row.raw_name as string,
    solventId: row.solvent_id as number,
    createdAt: row.created_at as string,
  };
}

/** SQLite 実験データリポジトリ */
export class SqliteExperimentalRepository implements ExperimentalRepository {
  constructor(private db: Database.Database) {}

  saveResults(dtos: CreateExperimentalResultDto[]): ExperimentalResultRow[] {
    const insert = this.db.prepare(`
      INSERT INTO experimental_results
        (import_batch_id, polymer_id, solvent_id, solvent_name_raw, result,
         quantitative_value, quantitative_unit, temperature_c, concentration, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const select = this.db.prepare('SELECT * FROM experimental_results WHERE id = ?');

    const results: ExperimentalResultRow[] = [];
    const insertMany = this.db.transaction((items: CreateExperimentalResultDto[]) => {
      for (const dto of items) {
        const info = insert.run(
          dto.importBatchId,
          dto.polymerId,
          dto.solventId ?? null,
          dto.solventNameRaw,
          dto.result,
          dto.quantitativeValue ?? null,
          dto.quantitativeUnit ?? null,
          dto.temperatureC ?? null,
          dto.concentration ?? null,
          dto.notes ?? null,
        );
        const row = select.get(info.lastInsertRowid) as Record<string, unknown>;
        results.push(rowToExperimentalResult(row));
      }
    });

    insertMany(dtos);
    return results;
  }

  getByPolymerId(polymerId: number): ExperimentalResultRow[] {
    const rows = this.db.prepare(
      'SELECT * FROM experimental_results WHERE polymer_id = ? ORDER BY created_at DESC',
    ).all(polymerId) as Record<string, unknown>[];
    return rows.map(rowToExperimentalResult);
  }

  getByBatchId(batchId: string): ExperimentalResultRow[] {
    const rows = this.db.prepare(
      'SELECT * FROM experimental_results WHERE import_batch_id = ? ORDER BY id',
    ).all(batchId) as Record<string, unknown>[];
    return rows.map(rowToExperimentalResult);
  }

  deleteByBatchId(batchId: string): number {
    const info = this.db.prepare(
      'DELETE FROM experimental_results WHERE import_batch_id = ?',
    ).run(batchId);
    return info.changes;
  }

  deleteByPolymerId(polymerId: number): number {
    const info = this.db.prepare(
      'DELETE FROM experimental_results WHERE polymer_id = ?',
    ).run(polymerId);
    return info.changes;
  }

  saveMapping(rawName: string, solventId: number): SolventNameMapping {
    this.db.prepare(`
      INSERT OR REPLACE INTO solvent_name_mappings (raw_name, solvent_id)
      VALUES (?, ?)
    `).run(rawName, solventId);

    const row = this.db.prepare(
      'SELECT * FROM solvent_name_mappings WHERE raw_name = ?',
    ).get(rawName) as Record<string, unknown>;
    return rowToMapping(row);
  }

  saveMappings(mappings: Array<{ rawName: string; solventId: number }>): SolventNameMapping[] {
    const results: SolventNameMapping[] = [];
    const saveMany = this.db.transaction((items: Array<{ rawName: string; solventId: number }>) => {
      for (const m of items) {
        results.push(this.saveMapping(m.rawName, m.solventId));
      }
    });
    saveMany(mappings);
    return results;
  }

  getAllMappings(): SolventNameMapping[] {
    const rows = this.db.prepare(
      'SELECT * FROM solvent_name_mappings ORDER BY raw_name',
    ).all() as Record<string, unknown>[];
    return rows.map(rowToMapping);
  }

  deleteMapping(rawName: string): boolean {
    const info = this.db.prepare(
      'DELETE FROM solvent_name_mappings WHERE raw_name = ?',
    ).run(rawName);
    return info.changes > 0;
  }
}
