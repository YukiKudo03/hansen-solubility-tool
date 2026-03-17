/**
 * 評価履歴 Repository
 */
import type Database from 'better-sqlite3';
import type { SerializedHistoryEntry } from '../core/evaluation-history';
import { deserializeHistoryResult } from '../core/evaluation-history';

export interface EvaluationHistoryRow {
  id: number;
  pipeline: string;
  params: unknown;
  result: unknown;
  thresholds: unknown;
  note: string | null;
  evaluatedAt: string;
}

const MAX_HISTORY_ENTRIES = 1000;

export class SqliteHistoryRepository {
  constructor(private db: Database.Database) {}

  create(entry: SerializedHistoryEntry, note?: string): EvaluationHistoryRow {
    // 上限チェック — 超過分を削除
    const count = this.db.prepare('SELECT COUNT(*) as cnt FROM evaluation_history').get() as { cnt: number };
    if (count.cnt >= MAX_HISTORY_ENTRIES) {
      const excess = count.cnt - MAX_HISTORY_ENTRIES + 1;
      this.db.prepare(
        'DELETE FROM evaluation_history WHERE id IN (SELECT id FROM evaluation_history ORDER BY evaluated_at ASC LIMIT ?)',
      ).run(excess);
    }

    const stmt = this.db.prepare(
      'INSERT INTO evaluation_history (pipeline, params_json, result_json, thresholds_json, note) VALUES (?, ?, ?, ?, ?)',
    );
    const result = stmt.run(entry.pipeline, entry.paramsJson, entry.resultJson, entry.thresholdsJson, note ?? null);
    return this.getById(Number(result.lastInsertRowid))!;
  }

  getAll(): EvaluationHistoryRow[] {
    const rows = this.db.prepare(
      'SELECT * FROM evaluation_history ORDER BY evaluated_at DESC',
    ).all() as any[];
    return rows.map(this.toRow);
  }

  getByPipeline(pipeline: string): EvaluationHistoryRow[] {
    const rows = this.db.prepare(
      'SELECT * FROM evaluation_history WHERE pipeline = ? ORDER BY evaluated_at DESC',
    ).all(pipeline) as any[];
    return rows.map(this.toRow);
  }

  getById(id: number): EvaluationHistoryRow | null {
    const row = this.db.prepare('SELECT * FROM evaluation_history WHERE id = ?').get(id) as any;
    return row ? this.toRow(row) : null;
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM evaluation_history WHERE id = ?').run(id);
    return result.changes > 0;
  }

  deleteOlderThan(days: number): number {
    const result = this.db.prepare(
      "DELETE FROM evaluation_history WHERE evaluated_at < datetime('now', ?)",
    ).run(`-${days} days`);
    return result.changes;
  }

  private toRow(row: any): EvaluationHistoryRow {
    return {
      id: row.id,
      pipeline: row.pipeline,
      params: deserializeHistoryResult(row.params_json) ?? {},
      result: deserializeHistoryResult(row.result_json) ?? {},
      thresholds: deserializeHistoryResult(row.thresholds_json) ?? {},
      note: row.note,
      evaluatedAt: row.evaluated_at,
    };
  }
}
