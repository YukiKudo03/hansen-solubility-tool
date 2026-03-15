<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 30 src + 23 test | Token estimate: ~950 -->

# Hansen Solubility System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────┐          ┌────────────────────────┐   │
│  │  MAIN PROCESS        │  IPC     │  RENDERER PROCESS      │   │
│  │  (main.ts)           │◄────────►│  (React 19 App.tsx)    │   │
│  │                      │          │                        │   │
│  │ ┌──────────────────┐ │          │ ┌──────────────────┐  │   │
│  │ │ IPC Handlers     │ │          │ │ UI Components    │  │   │
│  │ │ (ipc-handlers)   │ │          │ │ - ReportView     │  │   │
│  │ │ 40+ handlers     │ │          │ │ - NanoDispersion │  │   │
│  │ └──────────────────┘ │          │ │ - DatabaseEditor │  │   │
│  │         ▼            │          │ │ - MixtureLab     │  │   │
│  │ ┌──────────────────┐ │          │ └──────────────────┘  │   │
│  │ │ Core Calculator  │ │          │        ▲              │   │
│  │ │ hsp.ts (shared)  │ │          │   Hooks              │   │
│  │ │ risk.ts          │ │          │ - usePartsGroups   │  │   │
│  │ │ dispersibility.ts│ │          │ - useSolvents      │  │   │
│  │ │ solvent-finder.ts│ │          │ - useNanoParticles │  │   │
│  │ │ report.ts        │ │          │ - useNanoDispersion│  │   │
│  │ └──────────────────┘ │          └────────────────────────┘   │
│  │         ▼            │                                        │
│  │ ┌──────────────────┐ │                                        │
│  │ │ Repository Layer │ │                                        │
│  │ │ Parts, Solvent,  │ │                                        │
│  │ │ NanoParticle,    │ │                                        │
│  │ │ Settings repos   │ │                                        │
│  │ └──────────────────┘ │                                        │
│  │         ▼            │                                        │
│  │ ┌──────────────────┐ │                                        │
│  │ │ SQLite Database  │ │                                        │
│  │ │ hansen.db (WAL)  │ │                                        │
│  │ │ 5 tables         │ │                                        │
│  │ └──────────────────┘ │                                        │
│  └──────────────────────┘                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Two Evaluation Pipelines

### Pipeline A: Polymer-Solvent Compatibility (既存)
```
ReportView → select PartsGroup + Solvent → evaluate()
  → For each Part: calculateRa() → calculateRed() → classifyRisk()
  → GroupEvaluationResult → ResultsTable + RiskBadge → CSV
```
**Interpretation:** RED小 = 溶解しやすい = **危険**

### Pipeline B: Nanoparticle Dispersion Screening (新規)
```
NanoDispersionView → select NanoParticle → screenAllSolvents()
  → For each Solvent: calculateRa() → calculateRed() → classifyDispersibility()
  → NanoDispersionEvaluationResult → sort by RED asc → DispersibilityBadge → CSV
  → Optional: filterByConstraints(boilingPoint, viscosity, surfaceTension)
```
**Interpretation:** RED小 = 分散しやすい = **良好**

### Shared Core
Both pipelines share `calculateRa()` and `calculateRed()` in `hsp.ts`. The only difference is the **classification layer** (risk.ts vs dispersibility.ts) and **UI presentation**.

## Component Hierarchy

```
App.tsx (tab router: report | database | mixture | nanoDispersion | settings)
├── ReportView (polymer evaluation)
│   ├── PartsGroupSelector
│   ├── SolventSelector
│   ├── ResultsTable → RiskBadge
│   └── CSV export via formatCsv()
├── NanoDispersionView (nanoparticle screening)  ← NEW
│   ├── Category filter → Particle selector
│   ├── Constraint filters (BP, viscosity, surface tension)
│   ├── Stats summary (total, dispersible count, best solvent)
│   ├── Results table → DispersibilityBadge
│   └── CSV export via formatNanoDispersionCsv()
├── DatabaseEditor (CRUD for all entities)
├── MixtureLab (mixed solvent creation)
├── SettingsView (threshold configuration)
└── ErrorBoundary (wraps all views)
```

## Module Boundaries

| Layer | Location | Purpose | Key Files |
|-------|----------|---------|-----------|
| **Domain** | `src/core/` | Pure TS calculation logic | `types.ts`, `hsp.ts`, `risk.ts`, `dispersibility.ts`, `solvent-finder.ts`, `report.ts`, `validation.ts`, `mixture.ts` |
| **Data Access** | `src/db/` | SQLite schema, repositories, seed data | `schema.ts`, `repository.ts`, `sqlite-repository.ts`, `seed-data.ts`, `seed-nano-particles.ts` |
| **Main Process** | `src/main/` | Electron lifecycle, IPC orchestration | `main.ts`, `ipc-handlers.ts`, `preload.ts` |
| **UI** | `src/renderer/` | React components & hooks | `App.tsx`, 10 components, 5 hooks |

## Dependency Flow

```
Renderer (React)
    ↓ (window.api via IPC, 30+ methods)
Main Process
    ├→ Repository (sqlite-repository.ts, 4 repo classes)
    │   ↓
    │   SQLite Database (5 tables)
    └→ Core (hsp.ts, risk.ts, dispersibility.ts, solvent-finder.ts, report.ts)
        └→ Types (types.ts)
```

## File Structure Tree

```
hansen-solubility/
├── src/
│   ├── core/                    # Pure domain logic (no I/O)
│   │   ├── types.ts             # All domain types & interfaces
│   │   ├── hsp.ts               # Hansen distance (shared)
│   │   ├── risk.ts              # Polymer risk classification
│   │   ├── dispersibility.ts    # ← NEW: Nanoparticle dispersibility classification
│   │   ├── solvent-finder.ts    # ← NEW: Solvent screening & constraint filters
│   │   ├── report.ts            # CSV export (polymer + nano)
│   │   ├── validation.ts        # Input validators (all entities)
│   │   └── mixture.ts           # Solvent mixture calculations
│   │
│   ├── db/                      # Data access layer
│   │   ├── schema.ts            # SQLite tables (5 tables)
│   │   ├── repository.ts        # Repository interfaces (4 repos)
│   │   ├── sqlite-repository.ts # SQLite implementations (4 classes)
│   │   ├── seed-data.ts         # ~85 solvents + 7 polymer groups
│   │   └── seed-nano-particles.ts # ← NEW: 18 nanoparticles
│   │
│   ├── main/                    # Electron main process
│   │   ├── main.ts              # App lifecycle + seed loading
│   │   ├── ipc-handlers.ts      # 40+ IPC handlers
│   │   └── preload.ts           # Context-isolated bridge (30+ methods)
│   │
│   ├── renderer/                # React UI
│   │   ├── main.tsx             # Entry point
│   │   ├── App.tsx              # Tab router (5 tabs)
│   │   ├── components/
│   │   │   ├── ReportView.tsx
│   │   │   ├── NanoDispersionView.tsx  # ← NEW
│   │   │   ├── DispersibilityBadge.tsx # ← NEW
│   │   │   ├── DatabaseEditor.tsx
│   │   │   ├── MixtureLab.tsx
│   │   │   ├── SettingsView.tsx
│   │   │   ├── PartsGroupSelector.tsx
│   │   │   ├── SolventSelector.tsx
│   │   │   ├── ResultsTable.tsx
│   │   │   ├── RiskBadge.tsx
│   │   │   └── ErrorBoundary.tsx
│   │   └── hooks/
│   │       ├── useNanoParticles.ts     # ← NEW
│   │       ├── useNanoDispersion.ts    # ← NEW
│   │       ├── useEvaluation.ts
│   │       ├── usePartsGroups.ts
│   │       └── useSolvents.ts
│   │
│   └── preload.d.ts             # window.api type definitions
│
└── tests/
    ├── unit/                    # 167 tests
    │   ├── dispersibility.test.ts   # ← NEW (14 tests)
    │   ├── solvent-finder.test.ts   # ← NEW (11 tests)
    │   ├── hsp.test.ts, risk.test.ts, report.test.ts
    │   ├── validation.test.ts       # Extended (+15 nano tests)
    │   └── mixture.test.ts
    ├── integration/             # DB operations
    ├── renderer/                # React component tests
    └── e2e/                     # Playwright E2E tests
```

## Technology Stack

| Component | Package | Version |
|-----------|---------|---------|
| Desktop Framework | electron | 41.0.2 |
| UI Library | react, react-dom | 19.2.4 |
| Language | typescript | 5.9.3 |
| Build Tool | vite | 5.4.21 |
| Database | better-sqlite3 | 12.8.0 |
| CSS Framework | tailwindcss | 3.4.19 |
| Test Framework | vitest | 2.1.9 |

---

**Next:** See `frontend.md` for component details, `data.md` for database schema, `dependencies.md` for external packages.
