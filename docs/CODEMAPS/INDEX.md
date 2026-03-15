<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 71 | Token estimate: ~900 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for evaluating polymer-solvent compatibility, **nanoparticle dispersion**, and **contact angle estimation** using Hansen Solubility Parameters (HSP).

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — High-level system diagram, 3 evaluation pipelines, module boundaries, file structure tree

### Implementation Details
- **[frontend.md](./frontend.md)** — React component hierarchy (6 tabs), hooks, IPC interface (40+ methods), styling strategy
- **[data.md](./data.md)** — SQLite schema (5 tables), repositories, seed data (85 solvents + 18 nanoparticles)
- **[dependencies.md](./dependencies.md)** — External packages, build tools, Docker support, security config

## Key Insights

### Architecture
- **Electron Multi-Process:** Main process (business logic) ↔ Renderer process (React UI) via IPC
- **Pure Core:** `src/core/` contains no I/O (HSP calculations, risk/dispersibility/wettability classification, CSV export)
- **Repository Pattern:** `src/db/` abstracts SQLite via interfaces (Parts, Solvent, NanoParticle, Settings repos)
- **Type Safety:** 100% TypeScript across all layers with strict mode enabled

### Three Evaluation Modes
```
Polymer-Solvent Evaluation:
  UI → evaluate(groupId, solventId) → Ra/RED → classifyRisk → RiskLevel (溶解=危険)

Nanoparticle Dispersion Evaluation:
  UI → screenAll(particleId) → Ra/RED → classifyDispersibility → DispersibilityLevel (分散=良好)

Contact Angle Estimation:
  UI → estimateContactAngle(groupId, solventId) → γ_SV/γ_LV/γ_SL → Young's equation
  → classifyWettability → WettabilityLevel (θ小=親水, θ大=疎水)
```

### Tech Stack
- **Framework:** Electron 41 + React 19 + Vite 5
- **Language:** TypeScript 5.9 (strict)
- **Database:** SQLite with better-sqlite3 12.8
- **Styling:** Tailwind CSS 3.4
- **Testing:** Vitest 2.1 (303 tests)

## Module Tour

### src/core/
Pure domain logic (testable, no side effects)
- `types.ts` — Domain interfaces (HSPValues, Part, Solvent, NanoParticle, RiskLevel, DispersibilityLevel, WettabilityLevel, ContactAngleResult)
- `hsp.ts` — Hansen distance: `calculateRa()`, `calculateRed()` (shared by Pipeline A/B)
- `risk.ts` — Polymer risk: `classifyRisk(red, thresholds)` → RiskLevel 1-5
- `dispersibility.ts` — Nanoparticle: `classifyDispersibility(red, thresholds)` → DispersibilityLevel 1-5
- `wettability.ts` — Contact angle: `classifyWettability(angle, thresholds)` → WettabilityLevel 1-6
- `contact-angle.ts` — Nakamoto-Yamamoto式: `calculateSurfaceTension()`, `calculateInterfacialTension()`, `estimateContactAngle()`
- `solvent-finder.ts` — `screenSolvents()`, `filterByConstraints()`
- `report.ts` — CSV export: `formatCsv()`, `formatNanoDispersionCsv()`, `formatContactAngleCsv()` (BOM-prefixed UTF-8)
- `validation.ts` — Input validators incl. `validateWettabilityThresholds()`
- `mixture.ts` — Solvent mixture calculations

### src/db/
Data access layer (SQLite via better-sqlite3)
- `schema.ts` — Table definitions: parts_groups, parts, solvents, nano_particles, settings
- `repository.ts` — Interface definitions (DTOs, method signatures)
- `sqlite-repository.ts` — Concrete implementations (4 repository classes)
- `seed-data.ts` — ~85 solvents + 7 polymer groups
- `seed-nano-particles.ts` — 18 nanoparticles

### src/main/
Electron main process (lifecycle, IPC orchestration)
- `main.ts` — App startup, DB init, migration, window creation
- `ipc-handlers.ts` — **45+ IPC handlers**: parts/solvents/nanoparticles CRUD, evaluation, nano dispersion, **contact angle estimation**, mixture, CSV export, settings
- `preload.ts` — Context-isolated bridge (40+ methods)

### src/renderer/
React UI (Vite-bundled, hot-reload in dev)
- `App.tsx` — Tab router (Report, DatabaseEditor, MixtureLab, NanoDispersion, **ContactAngle**, Settings)
- `components/ContactAngleView.tsx` — Contact angle estimation (group mode + screening mode)
- `components/WettabilityBadge.tsx` — Wettability level badge (blue→red, 6 levels)
- `components/NanoDispersionView.tsx` — Nanoparticle dispersion evaluation
- `components/SettingsView.tsx` — Risk + Dispersibility + **Wettability** threshold config
- `hooks/useContactAngle.ts` — Contact angle estimation hook

### tests/
- `tests/unit/` — Core logic (218 tests incl. contact-angle, wettability, validation, report)
- `tests/renderer/` — React component + hook tests (85 tests)
- `tests/integration/` — DB operations, seed data integrity
- `tests/e2e/` — Playwright E2E tests

## File Statistics

| Category | Files | Purpose |
|----------|-------|---------|
| **Core** | 10 | HSP, risk, dispersibility, wettability, contact-angle, solvent-finder, report, validation, mixture |
| **Database** | 5 | Schema, repositories, seed data |
| **Main Process** | 3 | Electron lifecycle, IPC, preload |
| **Renderer** | 20 | React components (13) + hooks (6) + entry |
| **Tests** | 34 | Unit (218) + Renderer (85) + Integration + E2E |
| **Config** | 8+ | TS, Vite, Tailwind, Electron build |

## Database Schema Summary

| Table | Purpose | Rows | Relationships |
|-------|---------|------|---------------|
| `parts_groups` | Polymer material groups | 7 | 1 → Many with parts |
| `parts` | Individual polymers | ~60 | Many ← 1 from parts_groups |
| `solvents` | Chemical solvents | ~85 | No foreign keys |
| `nano_particles` | Nanoparticle materials | 18 | No foreign keys |
| `settings` | Config (thresholds) | ~5 | Key-value store |

## IPC Contract

**45+ handlers** registered in `ipc-handlers.ts`:
- Parts CRUD: getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup, createPart, updatePart, deletePart
- Solvents CRUD: getAll, getById, search, create, update, delete
- NanoParticles CRUD: getAll, getById, getByCategory, search, create, update, delete
- Mixture: createMixture
- Evaluation: evaluate(groupId, solventId)
- NanoDispersion: evaluate, screenAll, screenFiltered
- **ContactAngle: evaluate, screenSolvents**
- **Settings: getThresholds, setThresholds, getDispersibilityThresholds, setDispersibilityThresholds, getWettabilityThresholds, setWettabilityThresholds**
- Export: saveCsv

## Type System Highlights

All types defined in `src/core/types.ts`:
- `HSPValues` { deltaD, deltaP, deltaH }
- `Part`, `PartsGroup`, `Solvent` — polymer/solvent types
- `NanoParticle` { category, coreMaterial, surfaceLigand, hsp, r0, particleSize }
- `RiskLevel` enum 1-5 (polymer: 溶解=危険)
- `DispersibilityLevel` enum 1-5 (nanoparticle: 分散=良好)
- `WettabilityLevel` enum 1-6 (contact angle: θ小=親水, θ大=疎水)
- `ContactAngleResult` { surfaceTensionLV, surfaceEnergySV, interfacialTension, cosTheta, contactAngle, wettability }
- `WettabilityThresholds` { superHydrophilicMax(10°), hydrophilicMax(30°), wettableMax(60°), moderateMax(90°), hydrophobicMax(150°) }

## Critical Paths

1. **App Startup:** main.ts → initDb() → initializeDatabase() → migrateDatabase() → seedDatabase() + seedNanoParticles()
2. **Polymer Evaluation:** ReportView → window.api.evaluate() → calculateRa/RED → classifyRisk
3. **Nano Screening:** NanoDispersionView → window.api.screenAllSolvents() → screenSolvents() → classifyDispersibility
4. **Contact Angle:** ContactAngleView → window.api.estimateContactAngle() → calculateSurfaceTension/InterfacialTension → Young's eq → classifyWettability
5. **Mixture Creation:** MixtureLab → calculateMixture() → window.api.createMixtureSolvent() → DB
6. **Data Export:** formatCsv() / formatNanoDispersionCsv() / formatContactAngleCsv() → window.api.saveCsv() → dialog

---

**Last Updated:** 2026-03-15 | **Status:** Current
