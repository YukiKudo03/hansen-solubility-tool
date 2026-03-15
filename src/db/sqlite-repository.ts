/**
 * SQLite リポジトリ実装
 */
import Database from 'better-sqlite3';
import type { Part, PartsGroup, Solvent, RiskThresholds } from '../core/types';
import { DEFAULT_THRESHOLDS } from '../core/risk';
import type {
  PartsRepository,
  SolventRepository,
  SettingsRepository,
  CreatePartsGroupDto,
  CreatePartDto,
  CreateSolventDto,
} from './repository';

/** DBの行からPartを変換 */
function rowToPart(row: Record<string, unknown>): Part {
  return {
    id: row.id as number,
    groupId: row.group_id as number,
    name: row.name as string,
    materialType: (row.material_type as string) ?? null,
    hsp: {
      deltaD: row.delta_d as number,
      deltaP: row.delta_p as number,
      deltaH: row.delta_h as number,
    },
    r0: row.r0 as number,
    notes: (row.notes as string) ?? null,
  };
}

/** DBの行からSolventを変換 */
function rowToSolvent(row: Record<string, unknown>): Solvent {
  return {
    id: row.id as number,
    name: row.name as string,
    nameEn: (row.name_en as string) ?? null,
    casNumber: (row.cas_number as string) ?? null,
    hsp: {
      deltaD: row.delta_d as number,
      deltaP: row.delta_p as number,
      deltaH: row.delta_h as number,
    },
    molarVolume: (row.molar_volume as number) ?? null,
    molWeight: (row.mol_weight as number) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

export class SqlitePartsRepository implements PartsRepository {
  constructor(private db: Database.Database) {}

  getAllGroups(): PartsGroup[] {
    const groups = this.db.prepare('SELECT * FROM parts_groups ORDER BY id').all() as Record<string, unknown>[];
    return groups.map((g) => ({
      id: g.id as number,
      name: g.name as string,
      description: (g.description as string) ?? null,
      parts: this.getPartsByGroupId(g.id as number),
    }));
  }

  getGroupById(id: number): PartsGroup | null {
    const row = this.db.prepare('SELECT * FROM parts_groups WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return {
      id: row.id as number,
      name: row.name as string,
      description: (row.description as string) ?? null,
      parts: this.getPartsByGroupId(row.id as number),
    };
  }

  createGroup(dto: CreatePartsGroupDto): PartsGroup {
    const result = this.db
      .prepare('INSERT INTO parts_groups (name, description) VALUES (?, ?)')
      .run(dto.name, dto.description ?? null);
    return this.getGroupById(Number(result.lastInsertRowid))!;
  }

  updateGroup(id: number, dto: Partial<CreatePartsGroupDto>): PartsGroup | null {
    const existing = this.getGroupById(id);
    if (!existing) return null;
    this.db
      .prepare("UPDATE parts_groups SET name = ?, description = ?, updated_at = datetime('now') WHERE id = ?")
      .run(dto.name ?? existing.name, dto.description ?? existing.description, id);
    return this.getGroupById(id);
  }

  deleteGroup(id: number): boolean {
    const result = this.db.prepare('DELETE FROM parts_groups WHERE id = ?').run(id);
    return result.changes > 0;
  }

  getPartsByGroupId(groupId: number): Part[] {
    const rows = this.db.prepare('SELECT * FROM parts WHERE group_id = ? ORDER BY id').all(groupId) as Record<string, unknown>[];
    return rows.map(rowToPart);
  }

  createPart(dto: CreatePartDto): Part {
    const result = this.db
      .prepare(
        'INSERT INTO parts (group_id, name, material_type, delta_d, delta_p, delta_h, r0, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(dto.groupId, dto.name, dto.materialType ?? null, dto.deltaD, dto.deltaP, dto.deltaH, dto.r0, dto.notes ?? null);
    const row = this.db.prepare('SELECT * FROM parts WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<string, unknown>;
    return rowToPart(row);
  }

  updatePart(id: number, dto: Partial<CreatePartDto>): Part | null {
    const existing = this.db.prepare('SELECT * FROM parts WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE parts SET name = ?, material_type = ?, delta_d = ?, delta_p = ?, delta_h = ?, r0 = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .run(
        dto.name ?? existing.name,
        dto.materialType ?? existing.material_type,
        dto.deltaD ?? existing.delta_d,
        dto.deltaP ?? existing.delta_p,
        dto.deltaH ?? existing.delta_h,
        dto.r0 ?? existing.r0,
        dto.notes ?? existing.notes,
        id,
      );
    const row = this.db.prepare('SELECT * FROM parts WHERE id = ?').get(id) as Record<string, unknown>;
    return rowToPart(row);
  }

  deletePart(id: number): boolean {
    const result = this.db.prepare('DELETE FROM parts WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

export class SqliteSolventRepository implements SolventRepository {
  constructor(private db: Database.Database) {}

  getAllSolvents(): Solvent[] {
    const rows = this.db.prepare('SELECT * FROM solvents ORDER BY id').all() as Record<string, unknown>[];
    return rows.map(rowToSolvent);
  }

  getSolventById(id: number): Solvent | null {
    const row = this.db.prepare('SELECT * FROM solvents WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return rowToSolvent(row);
  }

  searchSolvents(query: string): Solvent[] {
    const rows = this.db
      .prepare('SELECT * FROM solvents WHERE name LIKE ? OR name_en LIKE ? OR cas_number LIKE ? ORDER BY id')
      .all(`%${query}%`, `%${query}%`, `%${query}%`) as Record<string, unknown>[];
    return rows.map(rowToSolvent);
  }

  createSolvent(dto: CreateSolventDto): Solvent {
    const result = this.db
      .prepare(
        'INSERT INTO solvents (name, name_en, cas_number, delta_d, delta_p, delta_h, molar_volume, mol_weight, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        dto.name,
        dto.nameEn ?? null,
        dto.casNumber ?? null,
        dto.deltaD,
        dto.deltaP,
        dto.deltaH,
        dto.molarVolume ?? null,
        dto.molWeight ?? null,
        dto.notes ?? null,
      );
    const row = this.db.prepare('SELECT * FROM solvents WHERE id = ?').get(Number(result.lastInsertRowid)) as Record<string, unknown>;
    return rowToSolvent(row);
  }

  updateSolvent(id: number, dto: Partial<CreateSolventDto>): Solvent | null {
    const existing = this.db.prepare('SELECT * FROM solvents WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE solvents SET name = ?, name_en = ?, cas_number = ?, delta_d = ?, delta_p = ?, delta_h = ?, molar_volume = ?, mol_weight = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .run(
        dto.name ?? existing.name,
        dto.nameEn ?? existing.name_en,
        dto.casNumber ?? existing.cas_number,
        dto.deltaD ?? existing.delta_d,
        dto.deltaP ?? existing.delta_p,
        dto.deltaH ?? existing.delta_h,
        dto.molarVolume ?? existing.molar_volume,
        dto.molWeight ?? existing.mol_weight,
        dto.notes ?? existing.notes,
        id,
      );
    return this.getSolventById(id);
  }

  deleteSolvent(id: number): boolean {
    const result = this.db.prepare('DELETE FROM solvents WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

export class SqliteSettingsRepository implements SettingsRepository {
  constructor(private db: Database.Database) {}

  getSetting(key: string): string | null {
    const row = this.db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
    return row?.value ?? null;
  }

  setSetting(key: string, value: string): void {
    this.db
      .prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(key, value);
  }

  getThresholds(): RiskThresholds {
    const json = this.getSetting('risk_thresholds');
    if (!json) return { ...DEFAULT_THRESHOLDS };
    return JSON.parse(json) as RiskThresholds;
  }

  setThresholds(thresholds: RiskThresholds): void {
    this.setSetting('risk_thresholds', JSON.stringify(thresholds));
  }
}
