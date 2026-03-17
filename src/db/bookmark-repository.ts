/**
 * ブックマーク Repository
 */
import type Database from 'better-sqlite3';
import type { Bookmark } from '../core/types';
import { deserializeBookmarkParams } from '../core/bookmark';

export interface CreateBookmarkDto {
  name: string;
  pipeline: string;
  paramsJson: string;
}

export class SqliteBookmarkRepository {
  constructor(private db: Database.Database) {}

  create(dto: CreateBookmarkDto): Bookmark {
    const stmt = this.db.prepare(
      'INSERT INTO bookmarks (name, pipeline, params_json) VALUES (?, ?, ?)',
    );
    const result = stmt.run(dto.name, dto.pipeline, dto.paramsJson);
    return this.getById(Number(result.lastInsertRowid))!;
  }

  getAll(): Bookmark[] {
    const rows = this.db.prepare(
      'SELECT * FROM bookmarks ORDER BY created_at DESC',
    ).all() as any[];
    return rows.map(this.toBookmark);
  }

  getByPipeline(pipeline: string): Bookmark[] {
    const rows = this.db.prepare(
      'SELECT * FROM bookmarks WHERE pipeline = ? ORDER BY created_at DESC',
    ).all(pipeline) as any[];
    return rows.map(this.toBookmark);
  }

  getById(id: number): Bookmark | null {
    const row = this.db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(id) as any;
    return row ? this.toBookmark(row) : null;
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM bookmarks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toBookmark(row: any): Bookmark {
    return {
      id: row.id,
      name: row.name,
      pipeline: row.pipeline,
      params: deserializeBookmarkParams(row.params_json) ?? {},
      createdAt: new Date(row.created_at),
    };
  }
}
