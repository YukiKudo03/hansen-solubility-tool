<!-- Generated: 2026-03-24 | Updated: 2026-03-24 | Files scanned: 12 | Token estimate: ~900 -->

# Database Schema & Data Layer

## Configuration

- **File:** `{userData}/hansen.db`
- **Driver:** better-sqlite3 12.8.0
- **Mode:** WAL, foreign_keys ON
- **Init:** `schema.ts` → `migrateDatabase()` → 7 seed functions

## Tables (9)

### parts_groups → parts (1:N, CASCADE)
Groups of polymer/coating/carrier materials.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto |
| name | TEXT NOT NULL | Group name |
| description | TEXT | Optional |
| created_at/updated_at | TEXT | Auto |

**Seed groups:** ~7 polymer + 「コーティング材料」(12 parts) + 「DDSキャリア」(11 parts) = ~10 groups, ~83 parts total

### solvents
Chemical solvents + plasticizers (identified by `[可塑剤]` tag in notes).

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto |
| name/name_en | TEXT | JP/EN names |
| cas_number | TEXT | CAS Registry |
| delta_d/p/h | REAL NOT NULL | HSP (MPa^½) |
| molar_volume, mol_weight | REAL | Optional |
| boiling_point, viscosity, specific_gravity, surface_tension | REAL | Physical props |
| notes | TEXT | `[可塑剤]` tag for plasticizers |

**Seed:** ~85 solvents + 10 plasticizers = ~95 rows

### nano_particles
| Key Columns | category (carbon/metal/metal_oxide/quantum_dot/polymer/other), core_material, surface_ligand, delta_d/p/h, r0, particle_size |
**Seed:** 18 nanoparticles

### drugs
| Key Columns | name/name_en, cas_number, delta_d/p/h, r0, mol_weight, log_p, therapeutic_category |
**Seed:** 16 drugs (鎮痛薬, 抗炎症薬, 降圧薬, 抗真菌薬, 抗菌薬, 抗てんかん薬, 気管支拡張薬, 中枢神経刺激薬)

### dispersants
| Key Columns | name, dispersant_type, anchor_delta_d/p/h/r0 (粒子親和HSP), solvation_delta_d/p/h/r0 (溶媒親和HSP), overall_delta_d/p/h, hlb, mol_weight, trade_name, manufacturer, notes |
**Seed:** ~10 dispersants (BYK-163, oleylamine, PVP, SDS, Tween 80, etc.) — dual-HSP model for anchor+solvation evaluation

### settings (KV store)
**Keys:** risk_thresholds, dispersibility_thresholds, wettability_thresholds, swelling_thresholds, drug_solubility_thresholds, chemical_resistance_thresholds, plasticizer_thresholds, carrier_thresholds, adhesion_thresholds, dispersant_thresholds

### bookmarks
| Columns | id INTEGER PK, name TEXT, pipeline TEXT, params_json TEXT, created_at TEXT |

### evaluation_history
| Columns | id INTEGER PK, pipeline TEXT, params_json TEXT, result_json TEXT, thresholds_json TEXT, note TEXT, evaluated_at TEXT |
Auto-prune at ≤1000 entries.

## Repository Pattern

**Interfaces** (`repository.ts`):

| Repository | Methods | DTO |
|-----------|---------|-----|
| PartsRepository | getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup, getPartsByGroupId, createPart, updatePart, deletePart | CreatePartsGroupDto, CreatePartDto |
| SolventRepository | getAllSolvents, getSolventById, searchSolvents, **getPlasticizers**, createSolvent, updateSolvent, deleteSolvent | CreateSolventDto |
| NanoParticleRepository | getAll, getById, getByCategory, search, create, update, delete | CreateNanoParticleDto |
| DrugRepository | getAll, getById, getByTherapeuticCategory, search, create, update, delete | CreateDrugDto |
| **DispersantRepository** | getAll, getById, **getByType**, **search**, create, update, delete | CreateDispersantDto |
| SettingsRepository | getSetting, setSetting, getThresholds, setThresholds | — |
| BookmarkRepository | list, save, delete | CreateBookmarkDto |
| HistoryRepository | list, listFiltered, save, delete, clear | — |

**Implementation:** `sqlite-repository.ts` — 8 classes (SqliteParts/Solvent/NanoParticle/Drug/Dispersant/Settings/Bookmark/History Repository)

## Seed Data Pipeline

```
main.ts → initDb()
  → initializeDatabase(db)    # CREATE TABLE IF NOT EXISTS (9 tables)
  → migrateDatabase(db)       # ALTER TABLE for legacy columns
  → seedDatabase(db)          # 85 solvents + 7 polymer groups (if empty)
  → seedNanoParticles(db)     # 18 nanoparticles (if empty)
  → seedDrugs(db)             # 16 drugs (if empty)
  → seedCoatings(db)          # 12 coatings as PartsGroup (if group absent)
  → seedPlasticizers(db)      # 10 plasticizers as Solvents (if none tagged)
  → seedCarriers(db)          # 11 DDS carriers as PartsGroup (if group absent)
  → seedDispersants(db)       # ~10 dispersants (if empty)
```

## Seed Data Summary

| Entity | Count | Source File |
|--------|-------|-------------|
| Solvents | 135 | seed-data.ts |
| Nanoparticles | 18 | seed-nano-particles.ts |
| Drugs | 16 | seed-drugs.ts |
| Polymers (groups + parts) | ~10 groups, ~83 parts | seed-data.ts |
| Coatings | 12 parts | seed-coatings.ts |
| Plasticizers | 10 | seed-plasticizers.ts |
| Carriers | 11 parts | seed-carriers.ts |
| Dispersants | ~10 | seed-dispersants.ts |

---

**Last Updated:** 2026-03-24

**Related:** See `architecture.md` for overview, `backend.md` for repository implementation, `frontend.md` for UI interaction.
