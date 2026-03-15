/**
 * SQLite リポジトリ実装
 */
import Database from 'better-sqlite3';
import type { Part, PartsGroup, Solvent, RiskThresholds, NanoParticle, NanoParticleCategory, Drug } from '../core/types';
import { DEFAULT_THRESHOLDS } from '../core/risk';
import type {
  PartsRepository,
  SolventRepository,
  SettingsRepository,
  NanoParticleRepository,
  DrugRepository,
  CreatePartsGroupDto,
  CreatePartDto,
  CreateSolventDto,
  CreateNanoParticleDto,
  CreateDrugDto,
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
    boilingPoint: (row.boiling_point as number) ?? null,
    viscosity: (row.viscosity as number) ?? null,
    specificGravity: (row.specific_gravity as number) ?? null,
    surfaceTension: (row.surface_tension as number) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

/** DBの行からNanoParticleを変換 */
function rowToNanoParticle(row: Record<string, unknown>): NanoParticle {
  return {
    id: row.id as number,
    name: row.name as string,
    nameEn: (row.name_en as string) ?? null,
    category: row.category as NanoParticleCategory,
    coreMaterial: row.core_material as string,
    surfaceLigand: (row.surface_ligand as string) ?? null,
    hsp: {
      deltaD: row.delta_d as number,
      deltaP: row.delta_p as number,
      deltaH: row.delta_h as number,
    },
    r0: row.r0 as number,
    particleSize: (row.particle_size as number) ?? null,
    notes: (row.notes as string) ?? null,
  };
}

/** DBの行からDrugを変換 */
function rowToDrug(row: Record<string, unknown>): Drug {
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
    r0: row.r0 as number,
    molWeight: (row.mol_weight as number) ?? null,
    logP: (row.log_p as number) ?? null,
    therapeuticCategory: (row.therapeutic_category as string) ?? null,
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

  getPlasticizers(): Solvent[] {
    const rows = this.db.prepare("SELECT * FROM solvents WHERE notes LIKE '%[可塑剤]%' ORDER BY id").all() as Record<string, unknown>[];
    return rows.map(rowToSolvent);
  }

  createSolvent(dto: CreateSolventDto): Solvent {
    const result = this.db
      .prepare(
        'INSERT INTO solvents (name, name_en, cas_number, delta_d, delta_p, delta_h, molar_volume, mol_weight, boiling_point, viscosity, specific_gravity, surface_tension, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        dto.boilingPoint ?? null,
        dto.viscosity ?? null,
        dto.specificGravity ?? null,
        dto.surfaceTension ?? null,
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
        "UPDATE solvents SET name = ?, name_en = ?, cas_number = ?, delta_d = ?, delta_p = ?, delta_h = ?, molar_volume = ?, mol_weight = ?, boiling_point = ?, viscosity = ?, specific_gravity = ?, surface_tension = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
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
        dto.boilingPoint ?? existing.boiling_point,
        dto.viscosity ?? existing.viscosity,
        dto.specificGravity ?? existing.specific_gravity,
        dto.surfaceTension ?? existing.surface_tension,
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

export class SqliteNanoParticleRepository implements NanoParticleRepository {
  constructor(private db: Database.Database) {}

  getAll(): NanoParticle[] {
    const rows = this.db.prepare('SELECT * FROM nano_particles ORDER BY id').all() as Record<string, unknown>[];
    return rows.map(rowToNanoParticle);
  }

  getById(id: number): NanoParticle | null {
    const row = this.db.prepare('SELECT * FROM nano_particles WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return rowToNanoParticle(row);
  }

  getByCategory(category: NanoParticleCategory): NanoParticle[] {
    const rows = this.db.prepare('SELECT * FROM nano_particles WHERE category = ? ORDER BY id').all(category) as Record<string, unknown>[];
    return rows.map(rowToNanoParticle);
  }

  search(query: string): NanoParticle[] {
    const rows = this.db
      .prepare('SELECT * FROM nano_particles WHERE name LIKE ? OR name_en LIKE ? OR core_material LIKE ? OR surface_ligand LIKE ? ORDER BY id')
      .all(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`) as Record<string, unknown>[];
    return rows.map(rowToNanoParticle);
  }

  create(dto: CreateNanoParticleDto): NanoParticle {
    const result = this.db
      .prepare(
        'INSERT INTO nano_particles (name, name_en, category, core_material, surface_ligand, delta_d, delta_p, delta_h, r0, particle_size, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        dto.name,
        dto.nameEn ?? null,
        dto.category,
        dto.coreMaterial,
        dto.surfaceLigand ?? null,
        dto.deltaD,
        dto.deltaP,
        dto.deltaH,
        dto.r0,
        dto.particleSize ?? null,
        dto.notes ?? null,
      );
    return this.getById(Number(result.lastInsertRowid))!;
  }

  update(id: number, dto: Partial<CreateNanoParticleDto>): NanoParticle | null {
    const existing = this.db.prepare('SELECT * FROM nano_particles WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE nano_particles SET name = ?, name_en = ?, category = ?, core_material = ?, surface_ligand = ?, delta_d = ?, delta_p = ?, delta_h = ?, r0 = ?, particle_size = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .run(
        dto.name ?? existing.name,
        dto.nameEn ?? existing.name_en,
        dto.category ?? existing.category,
        dto.coreMaterial ?? existing.core_material,
        dto.surfaceLigand ?? existing.surface_ligand,
        dto.deltaD ?? existing.delta_d,
        dto.deltaP ?? existing.delta_p,
        dto.deltaH ?? existing.delta_h,
        dto.r0 ?? existing.r0,
        dto.particleSize ?? existing.particle_size,
        dto.notes ?? existing.notes,
        id,
      );
    return this.getById(id);
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM nano_particles WHERE id = ?').run(id);
    return result.changes > 0;
  }
}

export class SqliteDrugRepository implements DrugRepository {
  constructor(private db: Database.Database) {}

  getAll(): Drug[] {
    const rows = this.db.prepare('SELECT * FROM drugs ORDER BY id').all() as Record<string, unknown>[];
    return rows.map(rowToDrug);
  }

  getById(id: number): Drug | null {
    const row = this.db.prepare('SELECT * FROM drugs WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!row) return null;
    return rowToDrug(row);
  }

  getByTherapeuticCategory(category: string): Drug[] {
    const rows = this.db.prepare('SELECT * FROM drugs WHERE therapeutic_category = ? ORDER BY id').all(category) as Record<string, unknown>[];
    return rows.map(rowToDrug);
  }

  search(query: string): Drug[] {
    const rows = this.db
      .prepare('SELECT * FROM drugs WHERE name LIKE ? OR name_en LIKE ? OR therapeutic_category LIKE ? ORDER BY id')
      .all(`%${query}%`, `%${query}%`, `%${query}%`) as Record<string, unknown>[];
    return rows.map(rowToDrug);
  }

  create(dto: CreateDrugDto): Drug {
    const result = this.db
      .prepare(
        'INSERT INTO drugs (name, name_en, cas_number, delta_d, delta_p, delta_h, r0, mol_weight, log_p, therapeutic_category, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      )
      .run(
        dto.name,
        dto.nameEn ?? null,
        dto.casNumber ?? null,
        dto.deltaD,
        dto.deltaP,
        dto.deltaH,
        dto.r0,
        dto.molWeight ?? null,
        dto.logP ?? null,
        dto.therapeuticCategory ?? null,
        dto.notes ?? null,
      );
    return this.getById(Number(result.lastInsertRowid))!;
  }

  update(id: number, dto: Partial<CreateDrugDto>): Drug | null {
    const existing = this.db.prepare('SELECT * FROM drugs WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return null;
    this.db
      .prepare(
        "UPDATE drugs SET name = ?, name_en = ?, cas_number = ?, delta_d = ?, delta_p = ?, delta_h = ?, r0 = ?, mol_weight = ?, log_p = ?, therapeutic_category = ?, notes = ?, updated_at = datetime('now') WHERE id = ?",
      )
      .run(
        dto.name ?? existing.name,
        dto.nameEn ?? existing.name_en,
        dto.casNumber ?? existing.cas_number,
        dto.deltaD ?? existing.delta_d,
        dto.deltaP ?? existing.delta_p,
        dto.deltaH ?? existing.delta_h,
        dto.r0 ?? existing.r0,
        dto.molWeight ?? existing.mol_weight,
        dto.logP ?? existing.log_p,
        dto.therapeuticCategory ?? existing.therapeutic_category,
        dto.notes ?? existing.notes,
        id,
      );
    return this.getById(id);
  }

  delete(id: number): boolean {
    const result = this.db.prepare('DELETE FROM drugs WHERE id = ?').run(id);
    return result.changes > 0;
  }
}
