<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 5 | Token estimate: ~950 -->

# Database Schema & Data Layer

## Database Location & Configuration

**File Path:** `{app.getPath('userData')}/hansen.db`
- Windows: `C:\Users\{user}\AppData\Roaming\{app-name}\hansen.db`

**Configuration:**
- **Driver:** better-sqlite3 12.8.0
- **Mode:** WAL (Write-Ahead Logging)
- **Foreign Keys:** Enabled (`PRAGMA foreign_keys = ON`)
- **Initialization:** `src/db/schema.ts` executes SQL on app startup

## Table Schema

### parts_groups
Polymer material groups

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK AUTO | Unique identifier |
| name | TEXT | NOT NULL | Group name |
| description | TEXT | | Optional notes |
| created_at | TEXT | DEFAULT NOW | Audit |
| updated_at | TEXT | DEFAULT NOW | Audit |

**Relationships:** 1 → Many with `parts`

### parts
Individual polymer materials within a group

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK AUTO | Unique identifier |
| group_id | INTEGER | NOT NULL FK → parts_groups | Parent group |
| name | TEXT | NOT NULL | Part/material name |
| material_type | TEXT | | Classification |
| delta_d/p/h | REAL | NOT NULL | HSP components (MPa^(1/2)) |
| r0 | REAL | NOT NULL | Interaction radius |
| notes | TEXT | | Technical notes |
| created_at/updated_at | TEXT | DEFAULT NOW | Audit |

**Relationships:** Many ← 1 with `parts_groups` (ON DELETE CASCADE)

### solvents
Chemical solvents with HSP + physical properties

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK AUTO | Unique identifier |
| name / name_en | TEXT | NOT NULL / optional | Japanese / English name |
| cas_number | TEXT | | CAS Registry Number |
| delta_d/p/h | REAL | NOT NULL | HSP components |
| molar_volume | REAL | | cm³/mol |
| mol_weight | REAL | | g/mol |
| boiling_point | REAL | | 沸点 (°C, 負値許容) |
| viscosity | REAL | | 粘度 (mPa·s, 25°C) |
| specific_gravity | REAL | | 比重 (25°C) |
| surface_tension | REAL | | 表面張力 (mN/m) |
| notes | TEXT | | Notes |
| created_at/updated_at | TEXT | DEFAULT NOW | Audit |

**Seed Data:** ~85 solvents across categories (hydrocarbons, aromatics, halogenated, alcohols, esters, ketones, others)

### nano_particles ← NEW
Nanoparticle materials with surface HSP

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK AUTO | Unique identifier |
| name / name_en | TEXT | NOT NULL / optional | Japanese / English name |
| category | TEXT | NOT NULL DEFAULT 'other' | carbon/metal/metal_oxide/quantum_dot/polymer/other |
| core_material | TEXT | NOT NULL | 母材 (TiO₂, Ag, SWCNT, etc.) |
| surface_ligand | TEXT | | 表面修飾剤 (オレイルアミン, PVP, etc.) |
| delta_d/p/h | REAL | NOT NULL | Surface HSP (ligand-inclusive) |
| r0 | REAL | NOT NULL | Interaction radius |
| particle_size | REAL | | 粒子径 (nm) |
| notes | TEXT | | Source references |
| created_at/updated_at | TEXT | DEFAULT NOW | Audit |

**Seed Data:** 18 nanoparticles from literature:
- Carbon: SWCNT, MWCNT, Graphene, C60, GO
- Metal: Ag NP (OAm), Ag NP (decanoic acid), Au NP (citrate), Cu NP (PVP)
- Metal Oxide: TiO₂, ZnO, SiO₂, ZrO₂ (acetic acid), ZrO₂ (oleic acid), Al₂O₃
- Quantum Dot: ZnO QD, CdSe/ZnS QD (oleic acid)

### settings
Key-value configuration store

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| key | TEXT | PRIMARY KEY | Setting identifier |
| value | TEXT | NOT NULL | JSON-serialized value |

**Current Keys:**
- `risk_thresholds` → `{ dangerousMax, warningMax, cautionMax, holdMax }`
- `dispersibility_thresholds` → `{ excellentMax, goodMax, fairMax, poorMax }` ← NEW

## Repository Pattern

**Interface:** `src/db/repository.ts`
- `PartsRepository` (8 methods)
- `SolventRepository` (6 methods)
- `NanoParticleRepository` (7 methods) ← NEW: getAll, getById, getByCategory, search, create, update, delete
- `SettingsRepository` (4 methods)

**Implementation:** `src/db/sqlite-repository.ts`
- `SqlitePartsRepository`
- `SqliteSolventRepository`
- `SqliteNanoParticleRepository` ← NEW
- `SqliteSettingsRepository`

**DTOs:**
```ts
CreatePartsGroupDto { name, description? }
CreatePartDto { groupId, name, materialType?, deltaD, deltaP, deltaH, r0, notes? }
CreateSolventDto { name, nameEn?, casNumber?, deltaD, deltaP, deltaH, molarVolume?, molWeight?, boilingPoint?, viscosity?, specificGravity?, surfaceTension?, notes? }
CreateNanoParticleDto { name, nameEn?, category, coreMaterial, surfaceLigand?, deltaD, deltaP, deltaH, r0, particleSize?, notes? }  ← NEW
```

## Row Mapping Functions

```ts
rowToPart(row) → Part        // snake_case → camelCase + HSP object
rowToSolvent(row) → Solvent  // snake_case → camelCase + HSP object
rowToNanoParticle(row) → NanoParticle  // ← NEW: includes category, coreMaterial, surfaceLigand, particleSize
```

## Seed Data Loading

**Files:**
- `src/db/seed-data.ts` → `seedDatabase(db)` for solvents + polymer groups
- `src/db/seed-nano-particles.ts` → `seedNanoParticles(db)` for nanoparticles ← NEW

**Logic in main.ts:**
```ts
// Solvents: load only on first launch
if (count.cnt === 0) seedDatabase(db);
// Nanoparticles: load if table empty (idempotent)
seedNanoParticles(db);
```

## Data Integrity

- **Foreign Key Constraints:** ON DELETE CASCADE (delete group → deletes parts)
- **NOT NULL Fields:** name, HSP values, r0, category + core_material (nano_particles)
- **Default Values:** Timestamps auto-set, category defaults to 'other'
- **Type Safety:** TypeScript mapping prevents schema drift

---

**Related:** See `architecture.md` for initialization flow, `frontend.md` for UI ↔ DB interaction.
