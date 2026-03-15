<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 19 | Token estimate: ~950 -->

# Frontend Component Architecture

## Component Hierarchy

```
src/renderer/main.tsx (React entry point)
    └── App.tsx (tab router: report | database | mixture | nanoDispersion | contactAngle | settings)
        ├── ReportView.tsx (Polymer evaluation workflow)
        │   ├── PartsGroupSelector.tsx
        │   ├── SolventSelector.tsx
        │   ├── ResultsTable.tsx → RiskBadge.tsx
        │   └── CSV export via formatCsv()
        │
        ├── NanoDispersionView.tsx (Nanoparticle screening)
        │   ├── Category filter + Particle selector (inline)
        │   ├── Constraint filter panel (BP, viscosity, surface tension)
        │   ├── Stats summary cards (total, dispersible, best RED, best solvent)
        │   ├── Sortable results table → DispersibilityBadge.tsx
        │   └── CSV export via formatNanoDispersionCsv()
        │
        ├── ContactAngleView.tsx (Contact angle estimation)
        │   ├── Mode toggle: グループ評価 | 溶媒スクリーニング
        │   ├── PartsGroupSelector.tsx + SolventSelector.tsx (group mode)
        │   ├── PartsGroupSelector.tsx + Part select (screening mode)
        │   ├── Stats summary (total, hydrophilic count, min θ, best name)
        │   ├── Sortable results table → WettabilityBadge.tsx
        │   └── CSV export via formatContactAngleCsv()
        │
        ├── DatabaseEditor.tsx (CRUD for groups, parts, solvents)
        ├── MixtureLab.tsx (Mixed solvent creation)
        ├── SettingsView.tsx (Risk + Dispersibility + Wettability thresholds)
        └── ErrorBoundary.tsx (catches React errors)
```

## ContactAngleView.tsx
**Purpose:** HSP-based contact angle estimation with two modes
**State:**
- `mode: 'group' | 'screening'` — evaluation mode
- `selectedGroup`, `selectedSolvent`, `selectedPartId`
- `sortKey / sortDir` for results table

**Workflow (group mode):**
1. Select parts group + solvent
2. Click "接触角推定" → evaluate all parts in group
3. Results: γ_LV, γ_SV, γ_SL, cos(θ), θ, wettability badge

**Workflow (screening mode):**
1. Select parts group → select specific part
2. Click "全溶媒スクリーニング" → test against all solvents
3. Results sorted by θ ascending (most wettable first)

**IPC calls:** `estimateContactAngle(groupId, solventId)`, `screenContactAngle(partId, groupId)`

### WettabilityBadge.tsx
**Purpose:** Visual wettability indicator (6 levels)
**Props:** `level: WettabilityLevel`, `angle?: number`
**Color Map:**
- SuperHydrophilic(1) → `bg-blue-100 text-blue-800`
- Hydrophilic(2) → `bg-cyan-100 text-cyan-800`
- Wettable(3) → `bg-green-100 text-green-800`
- Moderate(4) → `bg-yellow-100 text-yellow-800`
- Hydrophobic(5) → `bg-orange-100 text-orange-800`
- SuperHydrophobic(6) → `bg-red-100 text-red-800`

## NanoDispersionView.tsx
**Purpose:** All-in-one nanoparticle-solvent compatibility screening
**IPC calls:** `screenAllSolvents(id)`, `screenFilteredSolvents(id, constraints)`

## Existing Components (unchanged)

### ReportView.tsx
**Purpose:** Polymer-solvent evaluation
**Methods:** `handleEvaluate()` → `window.api.evaluate()`, CSV export

### SettingsView.tsx
**Purpose:** Threshold configuration for all 3 classification systems
**Sections:**
1. リスク判定閾値 (RED thresholds for polymer evaluation)
2. 濡れ性判定閾値 (θ thresholds for contact angle, 0°-180° range)
Both with visual bar chart diagrams.

## Hooks

### useContactAngle()
```ts
hook useContactAngle(): {
  result: GroupContactAngleResult | null,
  loading, error,
  evaluate(groupId, solventId), screenAll(partId, groupId), clear()
}
```
**IPC:** `contactAngle:evaluate`, `contactAngle:screenSolvents`

### useNanoDispersion()
```ts
hook useNanoDispersion(): {
  result: NanoDispersionEvaluationResult | null,
  loading, error,
  screenAll(particleId), screenFiltered(particleId, constraints), clear()
}
```

### useNanoParticles(category?)
```ts
hook useNanoParticles(category?: NanoParticleCategory): {
  particles: NanoParticle[], loading, error, reload()
}
```

### usePartsGroups(), useSolvents(), useEvaluation()
Existing hooks — unchanged.

## IPC Interface (window.api)

Exposed by `src/main/preload.ts` (typed in `src/preload.d.ts`):

```ts
window.api = {
  // Parts groups (5 methods)
  getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup,
  // Parts (3 methods)
  createPart, updatePart, deletePart,
  // Solvents (7 methods)
  getAllSolvents, getSolventById, searchSolvents, createSolvent, updateSolvent, deleteSolvent, createMixtureSolvent,
  // Nanoparticles CRUD (7 methods)
  getAllNanoParticles, getNanoParticleById, getNanoParticlesByCategory,
  searchNanoParticles, createNanoParticle, updateNanoParticle, deleteNanoParticle,
  // Nanoparticle evaluation (3 methods)
  evaluateNanoDispersion, screenAllSolvents, screenFilteredSolvents,
  // Contact angle estimation (2 methods)
  estimateContactAngle, screenContactAngle,
  // Evaluation
  evaluate,
  // Settings (6 methods)
  getThresholds, setThresholds,
  getDispersibilityThresholds, setDispersibilityThresholds,
  getWettabilityThresholds, setWettabilityThresholds,
  // Export
  saveCsv,
}
```

**Total:** 40+ methods

## Styling Strategy

- **Framework:** Tailwind CSS 3.4.19
- **Layout:** Grid + flexbox (no custom CSS)
- **Colors:** Blue primary, gray neutral, green/teal/yellow/orange/red for badges
- **Responsive:** `grid-cols-1 md:grid-cols-{2,3,4}` patterns

---

**Related:** See `architecture.md` for IPC flow, `data.md` for database schema.
