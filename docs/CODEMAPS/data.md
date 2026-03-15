<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 4 | Token estimate: ~800 -->

# Database Schema & Data Layer

## Database Location & Configuration

**File Path:** `{app.getPath('userData')}/hansen.db`
- Windows: `C:\Users\{user}\AppData\Roaming\{app-name}\hansen.db`
- macOS: `~/Library/Application Support/{app-name}/hansen.db`
- Linux: `~/.config/{app-name}/hansen.db`

**Configuration:**
- **Driver:** better-sqlite3 12.8.0
- **Mode:** WAL (Write-Ahead Logging) for concurrent access
- **Foreign Keys:** Enabled (`PRAGMA foreign_keys = ON`)
- **Initialization:** `src/db/schema.ts` executes SQL on app startup

## Table Schema

### parts_groups
Polymer material groups

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Group name (e.g., "ゴム類", "プラスチック") |
| description | TEXT | | Optional notes |
| created_at | TEXT | DEFAULT NOW | Audit timestamp |
| updated_at | TEXT | DEFAULT NOW | Audit timestamp |

**Relationships:** 1 → Many with `parts`

### parts
Individual polymer materials within a group

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| group_id | INTEGER | NOT NULL FK → parts_groups | Parent group |
| name | TEXT | NOT NULL | Part/material name |
| material_type | TEXT | | Classification (e.g., "天然ゴム", "PVC") |
| delta_d | REAL | NOT NULL | Dispersive force component (MPa^(1/2)) |
| delta_p | REAL | NOT NULL | Polar component (MPa^(1/2)) |
| delta_h | REAL | NOT NULL | Hydrogen bonding component (MPa^(1/2)) |
| r0 | REAL | NOT NULL | Interaction radius (MPa^(1/2)) |
| notes | TEXT | | Technical notes |
| created_at | TEXT | DEFAULT NOW | Audit timestamp |
| updated_at | TEXT | DEFAULT NOW | Audit timestamp |

**Relationships:** Many ← 1 with `parts_groups` (ON DELETE CASCADE)

### solvents
Chemical solvents with HSP values

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier |
| name | TEXT | NOT NULL | Japanese name |
| name_en | TEXT | | English name |
| cas_number | TEXT | | CAS Registry Number |
| delta_d | REAL | NOT NULL | Dispersive force (MPa^(1/2)) |
| delta_p | REAL | NOT NULL | Polar component (MPa^(1/2)) |
| delta_h | REAL | NOT NULL | Hydrogen bonding (MPa^(1/2)) |
| molar_volume | REAL | | cm³/mol (optional, for density calculations) |
| mol_weight | REAL | | g/mol (optional) |
| notes | TEXT | | Safety/source notes |
| created_at | TEXT | DEFAULT NOW | Audit timestamp |
| updated_at | TEXT | DEFAULT NOW | Audit timestamp |

**Seed Data:** ~85 solvents across categories:
- Hydrocarbons: n-pentane to n-dodecane, cyclohexane
- Aromatics: benzene, toluene, xylene, styrene
- Halogenated: dichloromethane, chloroform, TCE, etc.
- Alcohols: methanol, ethanol, propanol, butanol, glycols
- Esters: ethyl acetate, butyl acetate, propylene glycol
- Ketones: acetone, MEK, MIBK
- Others: DMSO, water, formamide

### settings
Key-value configuration store

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| key | TEXT | PRIMARY KEY | Setting identifier |
| value | TEXT | NOT NULL | JSON-serialized value |

**Current Keys:**
- `thresholds.dangerous_max` → default 0.5 (RED value boundary)
- `thresholds.warning_max` → default 0.8
- `thresholds.caution_max` → default 1.2
- `thresholds.hold_max` → default 2.0

## Repository Pattern

**Interface:** `src/db/repository.ts`
- `PartsRepository` (8 methods)
- `SolventRepository` (6 methods)
- `SettingsRepository` (4 methods)

**Implementation:** `src/db/sqlite-repository.ts`
- `SqlitePartsRepository`
- `SqliteSolventRepository`
- `SqliteSettingsRepository`

**Data Transfer Objects (DTOs):**
```ts
CreatePartsGroupDto { name, description? }
CreatePartDto { groupId, name, materialType?, deltaD, deltaP, deltaH, r0, notes? }
CreateSolventDto { name, nameEn?, casNumber?, deltaD, deltaP, deltaH, molarVolume?, molWeight?, notes? }
```

## Seed Data Loading

**File:** `src/db/seed-data.ts`
**Exported:**
- `SOLVENT_SEEDS: CreateSolventDto[]` (~85 entries)
- `seedDatabase(db): void` function

**Logic in main.ts:**
```ts
const count = db.prepare('SELECT COUNT(*) as cnt FROM solvents').get();
if (count.cnt === 0) {
  seedDatabase(db);  // Load only on first launch
}
```

**Polymer Groups (seeded):** 7 groups:
- ゴム類 (Rubbers)
- プラスチック (Plastics)
- フッ素樹脂 (Fluoropolymers)
- 接着剤 (Adhesives) — 10 types: Epoxy, CA, PU, Acrylic, Silicone, EVA, PVAc, CR, Phenolic, PA-HM
- その他 (Others)

## Type Mapping

Database rows → Domain types via helper functions in `sqlite-repository.ts`:

```ts
function rowToPart(row): Part {
  return {
    id: row.id,
    groupId: row.group_id,
    hsp: { deltaD: row.delta_d, deltaP: row.delta_p, deltaH: row.delta_h },
    r0: row.r0,
    // ... other fields
  }
}

function rowToSolvent(row): Solvent {
  // Similar transformation, maps snake_case to camelCase
}
```

## Query Patterns

### Load Group with Parts
```sql
SELECT * FROM parts_groups WHERE id = ?
  → then SELECT * FROM parts WHERE group_id = ?
```

### Search Solvents
```sql
SELECT * FROM solvents WHERE name LIKE ? OR name_en LIKE ? LIMIT 50
```

### Create Part with Validation
```sql
INSERT INTO parts (group_id, name, delta_d, delta_p, delta_h, r0, ...)
VALUES (?, ?, ?, ?, ?, ?, ...)
```

### Get All Thresholds
```sql
SELECT value FROM settings WHERE key LIKE 'thresholds.%'
  → Parse JSON and build RiskThresholds object
```

## Data Integrity

- **Foreign Key Constraints:** ON DELETE CASCADE (delete group → deletes parts)
- **NOT NULL Fields:** name (groups, parts, solvents), HSP values, r0
- **Default Values:** Timestamps auto-set to current time
- **Type Safety:** TypeScript mapping prevents schema drift

---

**Related:** See `architecture.md` for initialization flow, `frontend.md` for UI ↔ DB interaction.
