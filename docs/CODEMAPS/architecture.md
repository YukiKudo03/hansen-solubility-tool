<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 25 src + 21 test | Token estimate: ~900 -->

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
│  │ └──────────────────┘ │          │ │ - DatabaseEditor │  │   │
│  │         ▼            │          │ │ - SettingsView   │  │   │
│  │ ┌──────────────────┐ │          │ └──────────────────┘  │   │
│  │ │ Core Calculator  │ │          │        ▲              │   │
│  │ │ hsp.ts, risk.ts  │ │          │   Hooks              │   │
│  │ │ report.ts        │ │          │ - usePartsGroups   │  │   │
│  │ └──────────────────┘ │          │ - useSolvents      │  │   │
│  │         ▼            │          │ - useEvaluation    │  │   │
│  │ ┌──────────────────┐ │          └────────────────────────┘   │
│  │ │ Repository Layer │ │                                        │
│  │ │ (sqlite-repo)    │ │                                        │
│  │ └──────────────────┘ │                                        │
│  │         ▼            │                                        │
│  │ ┌──────────────────┐ │                                        │
│  │ │ SQLite Database  │ │                                        │
│  │ │ hansen.db        │ │                                        │
│  │ │ (WAL mode)       │ │                                        │
│  │ └──────────────────┘ │                                        │
│  │                      │                                        │
│  └──────────────────────┘                                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Process Boundaries

### Main Process
**File:** `src/main/main.ts`
- Initializes Electron window (1200x800, min 900x600)
- Creates & initializes SQLite database
- Seeds data if empty
- Registers IPC handlers via `ipc-handlers.ts`
- Loads Vite dev server (dev) or built HTML (prod)

**Key exports:**
- None (main entry point)

### Renderer Process (React)
**File:** `src/renderer/main.tsx` → `App.tsx`
- React 19 app with tab-based navigation
- Three main views: Report, DatabaseEditor, Settings
- Communicates with main via `window.api` (preload bridge)

**Key component hierarchy:**
```
App.tsx (tab router: report | database | mixture | settings)
├── ReportView
│   ├── PartsGroupSelector
│   ├── SolventSelector
│   ├── ResultsTable
│   └── RiskBadge
├── DatabaseEditor
├── MixtureLab (混合溶媒作成・物性予測・DB登録)
├── SettingsView
└── ErrorBoundary (wraps all views)
```

### Preload Bridge
**File:** `src/main/preload.ts`
- Exposes safe IPC API to renderer via `window.api`
- Methods: evaluate, getAllGroups, getSolvents, createPart, createMixtureSolvent, etc.

## Data Flow: Evaluation Pipeline

```
User Action: Select Parts Group + Solvent → Click "評価実行"
                          ▼
                 ReportView.tsx
                          ▼
                 window.api.evaluate()
                          ▼
                 IPC: "evaluate" handler
                          ▼
        ipc-handlers.ts registerIpcHandlers()
                          ▼
    1. Load PartsGroup & Solvent from DB (repository layer)
    2. For each Part in group:
       - calculateRa(part.hsp, solvent.hsp)  [hsp.ts]
       - calculateRed(ra, r0)                 [hsp.ts]
       - classifyRisk(red, thresholds)       [risk.ts]
    3. Build GroupEvaluationResult
                          ▼
        Return to renderer, display in ResultsTable
                          ▼
     User exports: formatCsv() → IPC csv:save → dialog
```

## Module Boundaries

| Layer | Location | Purpose | Key Files |
|-------|----------|---------|-----------|
| **Domain** | `src/core/` | Pure TS calculation logic | `types.ts`, `hsp.ts`, `risk.ts`, `report.ts`, `validation.ts`, `mixture.ts` |
| **Data Access** | `src/db/` | SQLite schema, repositories, seed data | `schema.ts`, `repository.ts`, `sqlite-repository.ts`, `seed-data.ts` |
| **Main Process** | `src/main/` | Electron lifecycle, IPC orchestration | `main.ts`, `ipc-handlers.ts`, `preload.ts` |
| **UI** | `src/renderer/` | React components & hooks | `App.tsx`, `components/`, `hooks/` |

## Dependency Flow

```
Renderer (React)
    ↓ (window.api via IPC)
Main Process
    ├→ Repository (sqlite-repository.ts)
    │   ↓
    │   SQLite Database
    └→ Core (hsp.ts, risk.ts, report.ts)
        └→ Types (types.ts)
```

## File Structure Tree

```
hansen-solubility/
├── src/
│   ├── core/              # Pure domain logic (no I/O)
│   │   ├── types.ts       # Domain types & interfaces
│   │   ├── hsp.ts         # Hansen distance calculation
│   │   ├── risk.ts        # Risk level classification
│   │   ├── report.ts      # CSV export formatting
│   │   ├── validation.ts  # Input validators
│   │   └── mixture.ts     # Solvent mixture calculations
│   │
│   ├── db/                # Data access layer
│   │   ├── schema.ts      # SQLite table definitions
│   │   ├── repository.ts  # Repository interfaces (DTOs)
│   │   ├── sqlite-repository.ts  # SQLite implementation
│   │   └── seed-data.ts   # ~85 solvents + 7 polymer groups (incl. adhesives)
│   │
│   ├── main/              # Electron main process
│   │   ├── main.ts        # App lifecycle
│   │   ├── ipc-handlers.ts # IPC business logic
│   │   └── preload.ts     # Context-isolated bridge
│   │
│   └── renderer/          # React UI
│       ├── main.tsx       # Entry point
│       ├── App.tsx        # Tab router
│       ├── components/
│       │   ├── ReportView.tsx
│       │   ├── DatabaseEditor.tsx
│       │   ├── MixtureLab.tsx
│       │   ├── SettingsView.tsx
│       │   ├── PartsGroupSelector.tsx
│       │   ├── SolventSelector.tsx
│       │   ├── ResultsTable.tsx
│       │   ├── RiskBadge.tsx
│       │   └── ErrorBoundary.tsx
│       └── hooks/
│           ├── useEvaluation.ts
│           ├── usePartsGroups.ts
│           └── useSolvents.ts
│
└── tests/
    ├── unit/              # Core logic tests (hsp, risk, report, validation, mixture)
    ├── integration/       # DB + IPC tests
    ├── renderer/          # React component + hook tests
    └── e2e/               # Playwright E2E tests
```

## Build & Execution

- **Dev:** `npm run dev` → runs `dev:main` + `dev:renderer` (tsc + electron + vite)
- **Build:** `npm run build` → tsc (main) + vite build (renderer)
- **Package:** `npm run package` → electron-builder (Windows .exe)

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

**Next:** See `frontend.md` for component hierarchy, `data.md` for database schema, `dependencies.md` for external packages.
