<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 46 | Token estimate: ~600 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for evaluating polymer-solvent compatibility using Hansen Solubility Parameters (HSP).

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — High-level system diagram, IPC boundaries, data flow pipeline, module organization, file structure tree

### Implementation Details
- **[frontend.md](./frontend.md)** — React component hierarchy, hooks, IPC interface, styling strategy, type definitions
- **[data.md](./data.md)** — SQLite schema, table relationships, seed data (85 solvents), repository pattern, query patterns
- **[dependencies.md](./dependencies.md)** — External packages, build tools, build scripts, Docker support, security config

## Key Insights

### Architecture
- **Electron Multi-Process:** Main process (business logic) ↔ Renderer process (React UI) via IPC
- **Pure Core:** `src/core/` contains no I/O (HSP calculations, risk classification, CSV export)
- **Repository Pattern:** `src/db/` abstracts SQLite via interfaces (PartsRepository, SolventRepository, SettingsRepository)
- **Type Safety:** 100% TypeScript across all layers with strict mode enabled

### Evaluation Pipeline
```
UI Selection → window.api.evaluate() → IPC "evaluate" handler
  → Load from DB → Calculate Ra & RED → Classify Risk → Return GroupEvaluationResult
  → Display in ResultsTable → Export to CSV
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
- `types.ts` — Domain interfaces (HSPValues, Part, PartsGroup, Solvent, RiskLevel)
- `hsp.ts` — Hansen distance: `calculateRa()`, `calculateRed()`
- `risk.ts` — Classification: `classifyRisk(red, thresholds)` → RiskLevel 1-5
- `report.ts` — CSV export: `formatCsv(result)` (BOM-prefixed UTF-8)

### src/db/
Data access layer (SQLite via better-sqlite3)
- `schema.ts` — Table definitions: parts_groups, parts, solvents, settings
- `repository.ts` — Interface definitions (DTOs, method signatures)
- `sqlite-repository.ts` — Concrete implementations (3 classes: Parts, Solvent, Settings repos)
- `seed-data.ts` — ~85 solvents + 7 polymer groups incl. adhesives (loaded on first launch)

### src/main/
Electron main process (lifecycle, IPC orchestration)
- `main.ts` — App startup, DB init, window creation, seed data load
- `ipc-handlers.ts` — 27+ IPC handlers: parts CRUD, evaluation, CSV export, settings
- `preload.ts` — Context-isolated bridge exposing `window.api` to renderer

### src/renderer/
React UI (Vite-bundled, hot-reload in dev)
- `App.tsx` — Tab router (Report, DatabaseEditor, Settings)
- `components/ReportView.tsx` — Evaluation workflow (select group + solvent, run, export)
- `components/ResultsTable.tsx` — Display results with RiskBadge coloring
- `components/DatabaseEditor.tsx` — CRUD UI for all entities
- `hooks/useEvaluation.ts`, `hooks/usePartsGroups.ts`, `hooks/useSolvents.ts` — Async logic

### tests/
- `tests/unit/` — Core calculations (hsp, risk, report, validation)
- `tests/integration/` — DB operations, seed data integrity
- `tests/renderer/` — React component + hook tests (13 files)
- `tests/e2e/` — Playwright E2E tests (evaluation, database-editor, settings)

## Development Commands

```bash
# Install dependencies (builds better-sqlite3 native module)
npm install

# Start dev: tsc (main) + electron + vite (hot reload)
npm run dev

# Build for production
npm run build

# Package Windows installer
npm run package

# Run tests
npm run test              # All tests
npm run test:unit        # Core logic only
npm run test:integration # Database only
npm run test:coverage    # With coverage report

# Docker (if configured)
npm run docker:dev
npm run docker:test:unit
```

## File Statistics

| Category | Count | Purpose |
|----------|-------|---------|
| **Core** | 5 files | HSP math, risk logic, report, validation |
| **Database** | 4 files | Schema, repositories, seed data |
| **Main Process** | 3 files | Electron lifecycle, IPC, preload |
| **Renderer** | 10 files | React components + hooks (incl. ErrorBoundary) |
| **Tests** | 4 dirs | Unit + integration + renderer + E2E (21 files, 2254 lines) |
| **Config** | 8+ files | TS, Vite, Tailwind, Electron build |

## Database Schema Summary

| Table | Purpose | Rows | Relationships |
|-------|---------|------|---------------|
| `parts_groups` | Polymer material groups | 7 | 1 → Many with parts |
| `parts` | Individual polymers | ~60 | Many ← 1 from parts_groups |
| `solvents` | Chemical solvents | ~85 | No foreign keys |
| `settings` | Config (risk thresholds) | ~4 | Key-value store |

**Seed Data:** Loaded once on first launch. Manual CRUD available via DatabaseEditor.

## IPC Contract

**27+ handlers** registered in `ipc-handlers.ts`:
- Parts CRUD: getAllGroups, getGroupById, createGroup, updateGroup, deleteGroup, createPart, updatePart, deletePart
- Solvents CRUD: getAll, getById, search, create, update, delete
- Evaluation: evaluate(groupId, solventId) → GroupEvaluationResult
- Settings: getThresholds, setThresholds
- Export: saveCsv(content) → { saved: boolean; filePath?: string }

## Type System Highlights

All types defined in `src/core/types.ts`:
- `HSPValues` { deltaD, deltaP, deltaH }
- `Part` { id, groupId, name, materialType, hsp, r0, notes }
- `PartsGroup` { id, name, description, parts[] }
- `Solvent` { id, name, nameEn, casNumber, hsp, molarVolume, molWeight, notes }
- `GroupEvaluationResult` { partsGroup, solvent, results[], evaluatedAt, thresholdsUsed }
- `RiskLevel` enum: Dangerous(1), Warning(2), Caution(3), Hold(4), Safe(5)

## Critical Paths

1. **App Startup:** main.ts → initDb() → initializeDatabase() → seedDatabase() [once]
2. **User Evaluation:** ReportView select + click → window.api.evaluate() → IPC handler → calculate → return result
3. **Data Persistence:** ReportView export → formatCsv() → window.api.saveCsv() → dialog → file write
4. **Settings Change:** SettingsView form → window.api.setThresholds() → settings table update

## Build Process

```
npm run build
├── build:main: tsc -p tsconfig.node.json
│   └── outputs: dist/main/main.js (+ preload.js)
└── build:renderer: vite build
    └── outputs: dist/renderer/ (index.html + assets/)

npm run package
└── electron-builder --win
    └── outputs: hansen-solubility-Setup-{version}.exe
```

## Known Constraints & Notes

- **Database:** SQLite with WAL mode (not ideal for network sharing, but perfect for single-user desktop)
- **Serialization:** Window.api methods serialize via postMessage (structured clone) — no circular refs
- **Synchronous I/O:** better-sqlite3 is blocking, but acceptable for desktop use cases
- **Tailwind Classes:** All styling via utility classes (no custom CSS)

## Maintenance Checklist

- [ ] `docs/CODEMAPS/` synced with latest code changes
- [ ] All file paths in codemaps verified to exist
- [ ] IPC contract matches between main.ts and preload.ts
- [ ] Database migrations documented (if added)
- [ ] Test coverage for core/hsp.ts, core/risk.ts maintained
- [ ] Dependencies security audit: `npm audit`

---

**Last Updated:** 2026-03-15 | **Version:** 1.1.0 | **Status:** Current

For detailed implementation, see individual codemaps. For questions about specific modules, consult the file headers which include JSDoc and TypeScript interfaces.
