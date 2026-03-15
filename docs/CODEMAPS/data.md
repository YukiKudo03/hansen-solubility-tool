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
| created_at / updated_at | TEXT | DEFAULT NOW | Audit |

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

**Seed Data:** ~85 solvents

### nano_particles
Nanoparticle materials with surface HSP

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PK AUTO | Unique identifier |
| name / name_en | TEXT | NOT NULL / optional | Japanese / English name |
| category | TEXT | NOT NULL DEFAULT 'other' | carbon/metal/metal_oxide/quantum_dot/polymer/other |
| core_material | TEXT | NOT NULL | 母材 (TiO₂, Ag, SWCNT, etc.) |
| surface_ligand | TEXT | | 表面修飾剤 |
| delta_d/p/h | REAL | NOT NULL | Surface HSP (ligand-inclusive) |
| r0 | REAL | NOT NULL | Interaction radius |
| particle_size | REAL | | 粒子径 (nm) |

**Seed Data:** 18 nanoparticles (Carbon: 5, Metal: 4, Metal Oxide: 5, Quantum Dot: 2, Polymer: 1, Other: 1)

### settings
Key-value configuration store

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| key | TEXT | PRIMARY KEY | Setting identifier |
| value | TEXT | NOT NULL | JSON-serialized value |

**Current Keys:**
- `risk_thresholds` → `{ dangerousMax, warningMax, cautionMax, holdMax }`
- `dispersibility_thresholds` → `{ excellentMax, goodMax, fairMax, poorMax }`
- `wettability_thresholds` → `{ superHydrophilicMax, hydrophilicMax, wettableMax, moderateMax, hydrophobicMax }`

## Repository Pattern

**Interface:** `src/db/repository.ts`
- `PartsRepository` (8 methods)
- `SolventRepository` (6 methods)
- `NanoParticleRepository` (7 methods)
- `SettingsRepository` (4 methods: getThresholds, setThresholds, getSetting, setSetting)

**Implementation:** `src/db/sqlite-repository.ts`
- `SqlitePartsRepository`
- `SqliteSolventRepository`
- `SqliteNanoParticleRepository`
- `SqliteSettingsRepository`

**DTOs:**
```ts
CreatePartsGroupDto { name, description? }
CreatePartDto { groupId, name, materialType?, deltaD, deltaP, deltaH, r0, notes? }
CreateSolventDto { name, nameEn?, casNumber?, deltaD, deltaP, deltaH, molarVolume?, molWeight?, boilingPoint?, viscosity?, specificGravity?, surfaceTension?, notes? }
CreateNanoParticleDto { name, nameEn?, category, coreMaterial, surfaceLigand?, deltaD, deltaP, deltaH, r0, particleSize?, notes? }
```

## Data Integrity

- **Foreign Key Constraints:** ON DELETE CASCADE (delete group → deletes parts)
- **NOT NULL Fields:** name, HSP values, r0, category + core_material (nano_particles)
- **Default Values:** Timestamps auto-set, category defaults to 'other'
- **Type Safety:** TypeScript mapping prevents schema drift

---

**Related:** See `architecture.md` for initialization flow, `frontend.md` for UI ↔ DB interaction.
