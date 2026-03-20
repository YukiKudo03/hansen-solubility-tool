<!-- Generated: 2026-03-20 | Files scanned: 14 main/db | Token estimate: ~950 -->

# Backend — Main Process & IPC Handlers

## Main Process Architecture

```
electron app
  ↓
main.ts → initDb() → Database initialization
         → registerIpcHandlers() → 100+ IPC method registration
         → createWindow() → preload.js bridge
         → autoUpdater → electron-updater GitHub Releases
```

### Startup Sequence

**main.ts** (91 lines)
1. Parse `VITE_DEV_SERVER_URL` env var
2. Initialize SQLite: `initDb()` → schema + migrations + 6 seed functions
3. Create window with preload context isolation
4. Register IPC handlers (all 100+ routes)
5. Configure auto-updater (electron-updater)
6. Load dev server or production HTML

## IPC Handlers (src/main/ipc-handlers.ts — 770 lines)

### Pattern

```typescript
ipcMain.handle('channel:method', (_, ...args) => {
  // Validation (throw Error)
  // Repository query/mutation
  // Return serialized result
});
```

All handlers:
- Validate input (throw → renderer catches)
- No async (synchronous DB)
- Return serializable objects

### Handler Categories (100+)

#### Parts Management (8)
```
parts:getAllGroups()
parts:getGroupById(id)
parts:createGroup(dto) → validateName()
parts:updateGroup(id, dto)
parts:deleteGroup(id) → cascade delete parts
parts:createPart(dto) → validatePartInput()
parts:updatePart(id, dto)
parts:deletePart(id)
```

#### Solvents & Plasticizers (8)
```
solvents:getAll()
solvents:getById(id)
solvents:search(query)
solvents:create(dto) → validateSolventInput()
solvents:update(id, dto)
solvents:delete(id)
solvents:getPlasticizers() → notes tagged [可塑剤]
solvents:createMixture(components) → calculateMixture()
```

#### Pipeline A: Polymer Risk (1)
```
evaluate(partsGroupId, solventId) → GroupEvaluationResult
  • calculateRa(), calculateRed()
  • classifyRisk(RED, thresholds)
  • Returns: PartEvaluationResult[] per part in group
```

#### Pipeline B: Nano Dispersion (5)
```
nanoParticles:getAll/getById/getByCategory/search/create/update/delete (7 handlers)
nanoDispersion:evaluate(particleId, solventId)
nanoDispersion:screenAll(particleId) → all solvents
nanoDispersion:screenFiltered(particleId, constraints)
  • classifyDispersibility(RED, thresholds)
```

#### Pipeline C: Contact Angle (1)
```
contactAngle:estimate(groupId, solventId, mode: 'group'|'screening')
  • estimateContactAngle() [Nakamoto-Yamamoto]
  • classifyWettability(θ, thresholds)
```

#### Pipeline D: Blend Optimizer (2)
```
blendOptimizer:optimize(targets, selectedIds)
  • optimizeBlend(targets, parts) → grid search
  • Returns: ranked solvent combinations by Ra
```

#### Pipeline E: Swelling (1)
```
swelling:evaluate(groupId, solventId)
  • classifySwelling(RED, thresholds)
```

#### Pipeline F: Drug Solubility (4)
```
drugs:getAll/getById/getByTherapeuticCategory/search/create/update/delete (7)
drugSolubility:screenDrugSolvents(drugId) → all solvents
drugSolubility:evaluate(drugId, solventId)
  • classifyDrugSolubility(RED, thresholds)
```

#### Pipeline G: Chemical Resistance (1)
```
chemicalResistance:evaluate(groupId, solventId)
  • classifyChemicalResistance(RED, thresholds) [inverted: L1=worst]
```

#### Pipeline H: Plasticizer (1)
```
plasticizer:screen(groupId)
  • screenPlasticizers(group, solvents) → compatibility ranking
```

#### Pipeline I: Carrier Selection (1)
```
carrierSelection:screen(drugId)
  • screenCarriers(drug, carriers) → compatibility ranking
```

#### Pipeline J: Adhesion (1)
```
adhesion:evaluate(groupId, solventId)
  • classifyAdhesion(RED, thresholds) → adhesion strength score
```

#### Pipeline K-Q: Advanced Analytics (8)
```
sphereFitting:fitOptimalSphere(solventIds) → HSP球当てはめ
greenSolvent:findAlternatives(solventId) → eco-friendly ranking
multiObjective:paretoOptimization(criteria) → Pareto front
teasPlot:buildData(solventIds) → TEAS metrics (Toxic/Explosive/Aesthetic/Safe)
bagleyPlot:buildData(solventIds) → film-formation ability
projection2D:projectTo2D(solventIds) → δD-δP scatter
groupContribution:estimateHSP(groups) → Van Krevelen-Hoftyzer HSP
comparison:buildMatrix(groupIds, solventIds) → RED heatmap
```

#### Settings (7)
```
settings:getThresholds() → all pipeline thresholds as JSON
settings:setThresholds(dto) → validateThresholds()
settings:getSetting(key) → value
settings:setSetting(key, value)
settings:getWettabilityThresholds()
settings:setWettabilityThresholds(dto)
settings:[other threshold setters]
```

#### Bookmarks (3)
```
bookmarks:list() → all bookmarks
bookmarks:save(dto) → validateBookmark() → SqliteBookmarkRepository
bookmarks:delete(id)
```

#### Evaluation History (5)
```
evaluationHistory:list(filters) → history entries
evaluationHistory:listFiltered(pipeline, status)
evaluationHistory:save(entry) → auto-save evaluation result
evaluationHistory:delete(id)
evaluationHistory:clear() → delete all
```

#### CSV Import (3)
```
csv:importSolvents(csvContent) → parseSolventCsv() → creates N solvents
csv:importParts(csvContent) → parsePartCsv() → creates N parts
csv:save(content) → dialog.showSaveDialog() → fs.writeFileSync()
```

## Repository Pattern (src/db/)

### Interfaces (repository.ts)

```typescript
interface PartsRepository {
  getAllGroups(): Group[]
  getGroupById(id): Group | null
  createGroup(dto): Group
  updateGroup(id, dto)
  deleteGroup(id)
  getPartsByGroupId(id): Part[]
  createPart(dto): Part
  updatePart(id, dto)
  deletePart(id)
}

interface SolventRepository {
  getAllSolvents(): Solvent[]
  getSolventById(id): Solvent | null
  searchSolvents(query): Solvent[]
  getPlasticizers(): Solvent[]
  createSolvent(dto): Solvent
  updateSolvent(id, dto)
  deleteSolvent(id)
}

interface NanoParticleRepository {
  getAll(): NanoParticle[]
  getById(id): NanoParticle | null
  getByCategory(cat): NanoParticle[]
  search(query): NanoParticle[]
  create(dto): NanoParticle
  update(id, dto)
  delete(id)
}

interface DrugRepository {
  getAll(): Drug[]
  getById(id): Drug | null
  getByTherapeuticCategory(cat): Drug[]
  search(query): Drug[]
  create(dto): Drug
  update(id, dto)
  delete(id)
}

interface SettingsRepository {
  getSetting(key): string | null
  setSetting(key, value)
  getThresholds(): ThresholdsConfig
  setThresholds(dto)
}

interface BookmarkRepository {
  list(): Bookmark[]
  save(dto): Bookmark
  delete(id)
}

interface HistoryRepository {
  list(filters?): HistoryEntry[]
  listFiltered(pipeline, status): HistoryEntry[]
  save(entry): HistoryEntry
  delete(id)
  clear()
}
```

### Implementation (sqlite-repository.ts)

```typescript
class SqlitePartsRepository { /* 150+ lines */ }
class SqliteSolventRepository { /* 120+ lines */ }
class SqliteNanoParticleRepository { /* 100+ lines */ }
class SqliteDrugRepository { /* 100+ lines */ }
class SqliteSettingsRepository { /* 80+ lines */ }
class SqliteBookmarkRepository { /* 100+ lines */ }
class SqliteHistoryRepository { /* 150+ lines */ }
```

All use `db.prepare(sql).run()` / `.get()` / `.all()`.

## Database Schema (schema.ts)

### 8 Tables

| Table | Columns | Constraints | Seed |
|-------|---------|-------------|------|
| `parts_groups` | id, name, description, created_at, updated_at | PK id | ~10 groups |
| `parts` | id, group_id, name, cas_number, hsp.*, r0, notes, created_at | PK id, FK group_id CASCADE | ~83 parts |
| `solvents` | id, name, name_en, cas_number, hsp.*, molar_volume, boiling_point, viscosity, etc. | PK id | ~95 solvents + plasticizers |
| `nano_particles` | id, name, category, core_material, hsp.*, r0, particle_size, created_at | PK id | 18 particles |
| `drugs` | id, name, name_en, cas_number, hsp.*, r0, therapeutic_category, created_at | PK id | 16 drugs |
| `settings` | key, value | PK key | ~10 threshold configs |
| `bookmarks` | id, pipeline, name, conditions (JSON), created_at, updated_at | PK id | (user-created) |
| `evaluation_history` | id, pipeline, conditions (JSON), results (JSON), status, created_at | PK id, auto-prune ≤1000 | (auto-saved) |

### Initialization (main.ts)

```typescript
initDb() {
  const db = new Database(dbPath)
  initializeDatabase(db)      // CREATE TABLE IF NOT EXISTS
  migrateDatabase(db)         // ALTER TABLE for legacy columns
  seedDatabase(db)            // Insert solvents + parts groups (if empty)
  seedNanoParticles(db)       // Insert 18 nanoparticles
  seedDrugs(db)               // Insert 16 drugs
  seedCoatings(db)            // Insert coating PartsGroup
  seedPlasticizers(db)        // Insert plasticizer Solvents (tagged)
  seedCarriers(db)            // Insert DDS carrier PartsGroup
  return db
}
```

## Validation Layer (src/core/validation.ts)

**Handler → Validator → Repository Pattern**

```typescript
// Example
ipcMain.handle('parts:create', (_, dto) => {
  const err = validatePartInput(dto)  // → error string | null
  if (err) throw new Error(err)       // Renderer catches
  return partsRepo.createPart(dto)
})
```

**Key validators:**
- `validateName()` — alphanumeric + length ≤ 100
- `validatePartInput()` — name + HSP (δD/P/H: 0-50 MPa^½) + r0 ≥ 0
- `validateSolventInput()` — similar to part
- `validateThresholds()` — all pipelines' threshold objects
- `validateNanoParticleInput()` — category + HSP + r0
- `validateDrugInput()` — name + HSP + therapeutic category
- `validateBlendOptimizationInput()` — target HSP + part IDs

## Preload Bridge (preload.ts)

Context-isolated proxy to IPC:

```typescript
window.api = {
  parts: { getAllGroups, getGroupById, ... },
  solvents: { getAll, getById, ... },
  evaluate: async (...) => ipcRenderer.invoke('evaluate', ...)
  // All 100+ methods mapped
}
```

Whitelist pattern prevents arbitrary IPC calls.

---

**Related:** See `architecture.md` for overview, `frontend.md` for UI components, `data.md` for repository interfaces.

**Last Updated:** 2026-03-20
