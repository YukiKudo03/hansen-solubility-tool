<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 15 | Token estimate: ~950 -->

# Frontend Component Architecture

## Component Hierarchy

```
src/renderer/main.tsx (React entry point)
    └── App.tsx (tab router: report | database | mixture | nanoDispersion | settings)
        ├── ReportView.tsx (Polymer evaluation workflow)
        │   ├── PartsGroupSelector.tsx
        │   ├── SolventSelector.tsx
        │   ├── ResultsTable.tsx → RiskBadge.tsx
        │   └── CSV export via formatCsv()
        │
        ├── NanoDispersionView.tsx (Nanoparticle screening)  ← NEW
        │   ├── Category filter + Particle selector (inline)
        │   ├── Constraint filter panel (BP, viscosity, surface tension)
        │   ├── Stats summary cards (total, dispersible, best RED, best solvent)
        │   ├── Sortable results table → DispersibilityBadge.tsx
        │   └── CSV export via formatNanoDispersionCsv()
        │
        ├── DatabaseEditor.tsx (CRUD for groups, parts, solvents)
        ├── MixtureLab.tsx (Mixed solvent creation)
        ├── SettingsView.tsx (Threshold configuration)
        └── ErrorBoundary.tsx (catches React errors)
```

## NEW: NanoDispersionView.tsx
**Purpose:** All-in-one nanoparticle-solvent compatibility screening
**State:**
- `categoryFilter: NanoParticleCategory | ''`
- `selectedParticle: NanoParticle | null`
- `useConstraints: boolean` + `constraints: SolventConstraints`
- `sortKey / sortDir` for results table

**Workflow:**
1. Optional category filter → particle select dropdown
2. Selected particle info card (母材, 表面修飾, 粒子径, HSP, R₀)
3. Optional constraint filters (沸点, 粘度, 表面張力)
4. Click "全溶媒スクリーニング" → all ~85 solvents ranked by RED
5. Stats summary: total solvents, dispersible (RED<1.0), best RED, best solvent
6. Sortable table: solvent name, δD/δP/δH, Ra, RED, dispersibility badge, physical props
7. CSV export

**IPC calls:** `screenAllSolvents(id)`, `screenFilteredSolvents(id, constraints)`

### DispersibilityBadge.tsx ← NEW
**Purpose:** Visual dispersibility indicator (mirror of RiskBadge but inverted meaning)
**Props:** `level: DispersibilityLevel`, `red?: number`
**Color Map:**
- Excellent(1) → `bg-green-100 text-green-800`
- Good(2) → `bg-teal-100 text-teal-800`
- Fair(3) → `bg-yellow-100 text-yellow-800`
- Poor(4) → `bg-orange-100 text-orange-800`
- Bad(5) → `bg-red-100 text-red-800`

## Existing Components (unchanged)

### ReportView.tsx
**Purpose:** Polymer-solvent evaluation
**State:** selectedGroup, selectedSolvent, result, isEvaluating, error
**Methods:** `handleEvaluate()` → `window.api.evaluate()`, `handleExportCsv()` → `window.api.saveCsv(formatCsv())`

### ResultsTable.tsx + RiskBadge.tsx
**Purpose:** Polymer evaluation results display with risk badge coloring

### MixtureLab.tsx
**Purpose:** Solvent mixture creation, property prediction, DB registration
**Key Flow:** solvents + ratios → calculateMixture() → preview → DB save

### DatabaseEditor.tsx
**Purpose:** CRUD for parts groups, parts, solvents

### SettingsView.tsx
**Purpose:** Risk threshold configuration

## Hooks

### useNanoParticles(category?) ← NEW
```ts
hook useNanoParticles(category?: NanoParticleCategory): {
  particles: NanoParticle[], loading, error, reload()
}
```
**IPC:** `nanoParticles:getAll` or `nanoParticles:getByCategory`

### useNanoDispersion() ← NEW
```ts
hook useNanoDispersion(): {
  result: NanoDispersionEvaluationResult | null,
  loading, error,
  screenAll(particleId), screenFiltered(particleId, constraints), clear()
}
```
**IPC:** `nanoDispersion:screenAll`, `nanoDispersion:screenFiltered`

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
  // Nanoparticles CRUD (7 methods)  ← NEW
  getAllNanoParticles, getNanoParticleById, getNanoParticlesByCategory,
  searchNanoParticles, createNanoParticle, updateNanoParticle, deleteNanoParticle,
  // Nanoparticle evaluation (3 methods)  ← NEW
  evaluateNanoDispersion, screenAllSolvents, screenFilteredSolvents,
  // Evaluation
  evaluate,
  // Settings (4 methods, 2 NEW)
  getThresholds, setThresholds,
  getDispersibilityThresholds, setDispersibilityThresholds,  ← NEW
  // Export
  saveCsv,
}
```

**Total:** 30+ methods (was ~18)

## Styling Strategy

- **Framework:** Tailwind CSS 3.4.19
- **Layout:** Grid + flexbox (no custom CSS)
- **Colors:** Blue primary, gray neutral, green/teal/yellow/orange/red for dispersibility/risk badges
- **Responsive:** `grid-cols-1 md:grid-cols-{2,3,4}` patterns

---

**Related:** See `architecture.md` for IPC flow, `data.md` for database schema.
