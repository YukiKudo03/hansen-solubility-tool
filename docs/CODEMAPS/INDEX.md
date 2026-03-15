<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 57 | Token estimate: ~700 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for evaluating polymer-solvent compatibility and **nanoparticle dispersion** using Hansen Solubility Parameters (HSP).

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — High-level system diagram, IPC boundaries, data flow pipeline, module organization, file structure tree

### Implementation Details
- **[frontend.md](./frontend.md)** — React component hierarchy, hooks, IPC interface, styling strategy, type definitions
- **[data.md](./data.md)** — SQLite schema (4 tables), table relationships, seed data (85 solvents + 18 nanoparticles), repository pattern
- **[dependencies.md](./dependencies.md)** — External packages, build tools, build scripts, Docker support, security config

## Key Insights

### Architecture
- **Electron Multi-Process:** Main process (business logic) ↔ Renderer process (React UI) via IPC
- **Pure Core:** `src/core/` contains no I/O (HSP calculations, risk/dispersibility classification, CSV export)
- **Repository Pattern:** `src/db/` abstracts SQLite via interfaces (Parts, Solvent, NanoParticle, Settings repos)
- **Type Safety:** 100% TypeScript across all layers with strict mode enabled

### Two Evaluation Modes
```
Polymer-Solvent Evaluation:
  UI → evaluate(groupId, solventId) → Ra/RED → classifyRisk → RiskLevel (溶解=危険)

Nanoparticle Dispersion Evaluation:
  UI → screenAll(particleId) → Ra/RED → classifyDispersibility → DispersibilityLevel (分散=良好)
```

### Tech Stack
- **Framework:** Electron 41 + React 19 + Vite 5
- **Language:** TypeScript 5.9 (strict)
- **Database:** SQLite with better-sqlite3 12.8
- **Styling:** Tailwind CSS 3.4
- **Testing:** Vitest 2.1 with coverage

## Module Tour

### src/core/
Pure domain logic (testable, no side effects)
- `types.ts` — Domain interfaces (HSPValues, Part, Solvent, NanoParticle, RiskLevel, DispersibilityLevel)
- `hsp.ts` — Hansen distance: `calculateRa()`, `calculateRed()` (shared by both evaluation modes)
- `risk.ts` — Polymer risk: `classifyRisk(red, thresholds)` → RiskLevel 1-5
- `dispersibility.ts` — **NEW** Nanoparticle: `classifyDispersibility(red, thresholds)` → DispersibilityLevel 1-5
- `solvent-finder.ts` — **NEW** `screenSolvents()`, `filterByConstraints()` (solvent screening + physical property filters)
- `report.ts` — CSV export: `formatCsv()`, `formatNanoDispersionCsv()` (BOM-prefixed UTF-8)
- `validation.ts` — Input validators incl. `validateNanoParticleInput()`, `validateDispersibilityThresholds()`
- `mixture.ts` — Solvent mixture calculations: `calculateMixture()`, HSP/viscosity mixing rules

### src/db/
Data access layer (SQLite via better-sqlite3)
- `schema.ts` — Table definitions: parts_groups, parts, solvents, **nano_particles**, settings
- `repository.ts` — Interface definitions (DTOs, method signatures) incl. **NanoParticleRepository**
- `sqlite-repository.ts` — Concrete implementations (4 classes: Parts, Solvent, **NanoParticle**, Settings repos)
- `seed-data.ts` — ~85 solvents + 7 polymer groups
- `seed-nano-particles.ts` — **NEW** 18 nanoparticles (CNT, graphene, Ag NP, TiO₂, ZnO, etc.)

### src/main/
Electron main process (lifecycle, IPC orchestration)
- `main.ts` — App startup, DB init, migration, window creation, seed data load (solvents + nanoparticles)
- `ipc-handlers.ts` — **40+ IPC handlers**: parts CRUD, solvents CRUD, **nanoparticles CRUD**, evaluation, **nano dispersion screening**, mixture, CSV export, settings
- `preload.ts` — Context-isolated bridge exposing `window.api` to renderer (30+ methods)

### src/renderer/
React UI (Vite-bundled, hot-reload in dev)
- `App.tsx` — Tab router (Report, DatabaseEditor, MixtureLab, **NanoDispersion**, Settings)
- `components/ReportView.tsx` — Polymer evaluation workflow
- `components/NanoDispersionView.tsx` — **NEW** Nanoparticle dispersion evaluation (particle select, solvent screening, constraint filters, stats summary, CSV export)
- `components/DispersibilityBadge.tsx` — **NEW** Dispersibility level badge (green→red)
- `components/MixtureLab.tsx` — Mixture creation
- `components/ResultsTable.tsx`, `RiskBadge.tsx` — Polymer evaluation display
- `components/DatabaseEditor.tsx`, `SettingsView.tsx` — Data/config management
- `hooks/useNanoParticles.ts`, `hooks/useNanoDispersion.ts` — **NEW** Nanoparticle data/eval hooks
- `hooks/useEvaluation.ts`, `usePartsGroups.ts`, `useSolvents.ts` — Existing hooks

### tests/
- `tests/unit/` — Core logic (hsp, risk, **dispersibility**, report, validation, **solvent-finder**, mixture) — **167 tests**
- `tests/integration/` — DB operations, seed data integrity
- `tests/renderer/` — React component + hook tests
- `tests/e2e/` — Playwright E2E tests

## File Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| **Core** | 8 files | HSP math, risk, dispersibility, solvent-finder, report, validation, mixture |
| **Database** | 5 files | Schema, repositories, seed data (solvents + nanoparticles) |
| **Main Process** | 3 files | Electron lifecycle, IPC, preload |
| **Renderer** | 15 files | React components + hooks |
| **Tests** | 4 dirs | Unit + integration + renderer + E2E |
| **Config** | 8+ files | TS, Vite, Tailwind, Electron build |

## Database Schema Summary

| Table | Purpose | Rows | Relationships |
|-------|---------|------|---------------|
| `parts_groups` | Polymer material groups | 7 | 1 → Many with parts |
| `parts` | Individual polymers | ~60 | Many ← 1 from parts_groups |
| `solvents` | Chemical solvents | ~85 | No foreign keys |
| `nano_particles` | **Nanoparticle materials** | **18** | **No foreign keys** |
| `settings` | Config (thresholds) | ~4 | Key-value store |

## IPC Contract

**40+ handlers** registered in `ipc-handlers.ts`:
- Parts CRUD: getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup, createPart, updatePart, deletePart
- Solvents CRUD: getAll, getById, search, create, update, delete
- **NanoParticles CRUD: getAll, getById, getByCategory, search, create, update, delete**
- Mixture: createMixture
- Evaluation: evaluate(groupId, solventId)
- **NanoDispersion: evaluate, screenAll, screenFiltered**
- **Settings: getThresholds, setThresholds, getDispersibilityThresholds, setDispersibilityThresholds**
- Export: saveCsv

## Type System Highlights

All types defined in `src/core/types.ts`:
- `HSPValues` { deltaD, deltaP, deltaH }
- `Part`, `PartsGroup`, `Solvent` — existing polymer/solvent types
- **`NanoParticle`** { id, name, nameEn, category, coreMaterial, surfaceLigand, hsp, r0, particleSize, notes }
- **`NanoParticleCategory`** — 'carbon' | 'metal' | 'metal_oxide' | 'quantum_dot' | 'polymer' | 'other'
- `RiskLevel` enum (polymer: 溶解=危険)
- **`DispersibilityLevel`** enum (nanoparticle: 分散=良好) — Excellent(1) to Bad(5)
- **`DispersibilityThresholds`** { excellentMax, goodMax, fairMax, poorMax }
- **`SolventConstraints`** { maxBoilingPoint?, minBoilingPoint?, maxViscosity?, maxSurfaceTension? }
- **`NanoDispersionEvaluationResult`**, **`SolventDispersibilityResult`**

## Critical Paths

1. **App Startup:** main.ts → initDb() → initializeDatabase() → migrateDatabase() → seedDatabase() + seedNanoParticles()
2. **Polymer Evaluation:** ReportView → window.api.evaluate() → calculateRa/RED → classifyRisk
3. **Nano Screening:** NanoDispersionView → window.api.screenAllSolvents() → screenSolvents() → classifyDispersibility → sort by RED
4. **Mixture Creation:** MixtureLab → calculateMixture() → window.api.createMixtureSolvent() → DB
5. **Data Export:** formatCsv() / formatNanoDispersionCsv() → window.api.saveCsv() → dialog

---

**Last Updated:** 2026-03-15 | **Version:** 1.4.0 | **Status:** Current
