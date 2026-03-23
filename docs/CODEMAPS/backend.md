<!-- Generated: 2026-03-24 | Files scanned: 15 main/db | Token estimate: ~1200 -->

# Backend — Main Process & IPC Handlers

## Main Process Architecture

```
electron app
  ↓
main.ts → initDb() → Database initialization
         → registerIpcHandlers() → 190+ IPC method registration
         → createWindow() → preload.js bridge
         → autoUpdater → electron-updater GitHub Releases
```

### Startup Sequence

**main.ts** (124 lines)
1. Parse `VITE_DEV_SERVER_URL` env var
2. Initialize SQLite: `initDb()` → schema + migrations + 7 seed functions
3. Create window with preload context isolation
4. Register IPC handlers (all 190+ routes)
5. Configure auto-updater (electron-updater)
6. Load dev server or production HTML

## IPC Handlers (src/main/ipc-handlers.ts — 1990 lines)

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

### Handler Categories (190+)

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

#### Pipeline J: Dispersant Selection (4)
```
dispersants:getAll/getById/create/update/delete (5 handlers)
dispersants:screen(particleId, solventId)
  • evaluateAnchorAffinity(dispersant, particle) → RED_anchor
  • evaluateSolvationCompatibility(dispersant, solvent) → RED_solvation
  • compositeRed = √(RED_a × RED_s) → classifyAffinity
```

#### Pipeline K: Adhesion (1)
```
adhesion:evaluate(groupId, solventId)
  • classifyAdhesion(RED, thresholds) → adhesion strength score
```

#### Pipeline L-R: Advanced Analytics (8)
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

#### Extended Pipelines (80+ additional handlers)
```
評価系 (33 pipelines): ESC, ブレンド相溶性, リサイクル相溶性, 添加剤移行,
  フレーバースカルピング, 包装材溶出, リポソーム透過性, インク-基材密着,
  多層コーティング密着, 粘着テープ剥離強度, 構造接着設計, ガス透過性,
  膜分離選択性, 吸入薬適合性, タンパク質凝集, 残留溶媒, コーティング欠陥,
  レジスト現像, 結晶溶解温度, ハイドロゲル膨潤, ゴム配合, 繊維染色性,
  多形リスク, 印刷電子濡れ性, 封止材適合, バイオ燃料適合, etc.

選定系 (26 pipelines): 共結晶, 3D印刷平滑化, 誘電体膜, 賦形剤,
  相溶化剤, 香料カプセル化, 経皮吸収促進剤, 顔料分散, CNT/グラフェン,
  MXene, NP薬物ローディング, CO2吸収材, 水素貯蔵, UVフィルター, etc.

最適化系 (17 pipelines): 超臨界CO2, 洗浄剤配合, ペロブスカイト溶媒,
  有機半導体膜, UV硬化インク, 多成分最適化, LiB電解液, 溶媒代替, etc.

分析系 (16 pipelines): コポリマーHSP, 表面処理効果, 温度/圧力HSP補正,
  逆HSP推定, HSP不確かさ, 表面HSP決定, IL/DES, ML予測, MD連携, etc.

Each pipeline handler follows the same pattern:
  ipcMain.handle('pipeline:evaluate', (_, args) => {
    validate(args) → compute(args) → return result
  })
```

#### Settings (22)
```
settings:getThresholds() → all pipeline thresholds as JSON
settings:setThresholds(dto) → validateThresholds()
settings:getSetting(key) → value
settings:setSetting(key, value)
settings:get/set[Pipeline]Thresholds() × 9 pipeline types
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

interface NanoParticleRepository { getAll, getById, getByCategory, search, create, update, delete }
interface DrugRepository { getAll, getById, getByTherapeuticCategory, search, create, update, delete }
interface DispersantRepository { getAll, getById, getByType, search, create, update, delete }
interface SettingsRepository { getSetting, setSetting, getThresholds, setThresholds }
interface BookmarkRepository { list, save, delete }
interface HistoryRepository { list, listFiltered, save, delete, clear }
```

### Implementation (sqlite-repository.ts — 550+ lines)

All use `db.prepare(sql).run()` / `.get()` / `.all()`.

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
- `validateDispersantInput()` — name + anchor HSP + solvation HSP + solvation r0
- `validateBlendOptimizationInput()` — target HSP + part IDs

## Preload Bridge (preload.ts — 10,757 lines)

Context-isolated proxy to IPC:

```typescript
window.api = {
  parts: { getAllGroups, getGroupById, ... },
  solvents: { getAll, getById, ... },
  evaluate: async (...) => ipcRenderer.invoke('evaluate', ...)
  // All 190+ methods mapped
}
```

Whitelist pattern prevents arbitrary IPC calls.

---

**Related:** See `architecture.md` for overview, `frontend.md` for UI components, `data.md` for repository interfaces.

**Last Updated:** 2026-03-24
