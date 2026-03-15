<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 37 src + 34 test | Token estimate: ~950 -->

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
│  │ │ 45+ handlers     │ │          │ │ - NanoDispersion │  │   │
│  │ └──────────────────┘ │          │ │ - ContactAngle   │  │   │
│  │         ▼            │          │ │ - DatabaseEditor │  │   │
│  │ ┌──────────────────┐ │          │ │ - MixtureLab     │  │   │
│  │ │ Core Calculator  │ │          │ └──────────────────┘  │   │
│  │ │ hsp.ts (shared)  │ │          │        ▲              │   │
│  │ │ risk.ts          │ │          │   Hooks              │   │
│  │ │ dispersibility.ts│ │          │ - usePartsGroups   │  │   │
│  │ │ wettability.ts   │ │          │ - useSolvents      │  │   │
│  │ │ contact-angle.ts │ │          │ - useNanoParticles │  │   │
│  │ │ solvent-finder.ts│ │          │ - useNanoDispersion│  │   │
│  │ │ report.ts        │ │          │ - useContactAngle  │  │   │
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

## Three Evaluation Pipelines

### Pipeline A: Polymer-Solvent Compatibility
```
ReportView → select PartsGroup + Solvent → evaluate()
  → For each Part: calculateRa() → calculateRed() → classifyRisk()
  → GroupEvaluationResult → ResultsTable + RiskBadge → CSV
```
**Interpretation:** RED小 = 溶解しやすい = **危険**

### Pipeline B: Nanoparticle Dispersion Screening
```
NanoDispersionView → select NanoParticle → screenAllSolvents()
  → For each Solvent: calculateRa() → calculateRed() → classifyDispersibility()
  → NanoDispersionEvaluationResult → sort by RED asc → DispersibilityBadge → CSV
  → Optional: filterByConstraints(boilingPoint, viscosity, surfaceTension)
```
**Interpretation:** RED小 = 分散しやすい = **良好**

### Pipeline C: Contact Angle Estimation
```
ContactAngleView → select PartsGroup + Solvent → estimateContactAngle()
  → For each Part: calculateSurfaceTension() → calculateInterfacialTension()
  → Young's equation: cos(θ) = (γ_SV − γ_SL) / γ_LV → classifyWettability()
  → GroupContactAngleResult → sort by θ asc → WettabilityBadge → CSV

ContactAngleView (screening mode) → select Part → screenContactAngle()
  → For each Solvent: estimateContactAngle() → sort by θ asc
```
**Theory:** Nakamoto-Yamamoto式 (Langmuir 2023)
- γ = 0.0947·δD² + 0.0315·δP² + 0.0238·δH²
**Interpretation:** θ小 = 濡れやすい = **親水**, θ大 = **疎水**

### Shared Core
All pipelines share HSP values from `types.ts`. Pipeline A/B share `calculateRa()`/`calculateRed()`. Pipeline C uses its own `calculateSurfaceTension()`/`calculateInterfacialTension()` via Nakamoto-Yamamoto coefficients.

## Component Hierarchy

```
App.tsx (tab router: report | database | mixture | nanoDispersion | contactAngle | settings)
├── ReportView (polymer evaluation)
│   ├── PartsGroupSelector, SolventSelector
│   ├── ResultsTable → RiskBadge
│   └── CSV export via formatCsv()
├── NanoDispersionView (nanoparticle screening)
│   ├── Category filter → Particle selector
│   ├── Constraint filters, Stats summary
│   ├── Results table → DispersibilityBadge
│   └── CSV export via formatNanoDispersionCsv()
├── ContactAngleView (contact angle estimation)
│   ├── Mode toggle: グループ評価 | 溶媒スクリーニング
│   ├── PartsGroupSelector, SolventSelector or Part selector
│   ├── Stats summary (θ_min, hydrophilic count)
│   ├── Sortable results table → WettabilityBadge
│   └── CSV export via formatContactAngleCsv()
├── DatabaseEditor (CRUD for all entities)
├── MixtureLab (mixed solvent creation)
├── SettingsView (risk + dispersibility + wettability thresholds)
└── ErrorBoundary (wraps all views)
```

## Module Boundaries

| Layer | Location | Purpose | Key Files |
|-------|----------|---------|-----------|
| **Domain** | `src/core/` | Pure TS calculation logic | `types.ts`, `hsp.ts`, `risk.ts`, `dispersibility.ts`, `wettability.ts`, `contact-angle.ts`, `solvent-finder.ts`, `report.ts`, `validation.ts`, `mixture.ts` |
| **Data Access** | `src/db/` | SQLite schema, repositories, seed data | `schema.ts`, `repository.ts`, `sqlite-repository.ts`, `seed-data.ts`, `seed-nano-particles.ts` |
| **Main Process** | `src/main/` | Electron lifecycle, IPC orchestration | `main.ts`, `ipc-handlers.ts`, `preload.ts` |
| **UI** | `src/renderer/` | React components & hooks | `App.tsx`, 13 components, 6 hooks |

## Dependency Flow

```
Renderer (React)
    ↓ (window.api via IPC, 40+ methods)
Main Process
    ├→ Repository (sqlite-repository.ts, 4 repo classes)
    │   ↓
    │   SQLite Database (5 tables)
    └→ Core (hsp.ts, risk.ts, dispersibility.ts, wettability.ts, contact-angle.ts, ...)
        └→ Types (types.ts)
```

## File Structure Tree

```
src/
├── core/                    # Pure domain logic (no I/O)
│   ├── types.ts             # All domain types & interfaces
│   ├── hsp.ts               # Hansen distance (shared by Pipeline A/B)
│   ├── risk.ts              # Polymer risk classification
│   ├── dispersibility.ts    # Nanoparticle dispersibility classification
│   ├── wettability.ts       # Contact angle wettability classification (6-level)
│   ├── contact-angle.ts     # Nakamoto-Yamamoto surface tension + Young's equation
│   ├── solvent-finder.ts    # Solvent screening & constraint filters
│   ├── report.ts            # CSV export (polymer + nano + contact angle)
│   ├── validation.ts        # Input validators (all entities + wettability thresholds)
│   └── mixture.ts           # Solvent mixture calculations
│
├── db/                      # Data access layer
│   ├── schema.ts            # SQLite tables (5 tables)
│   ├── repository.ts        # Repository interfaces (4 repos)
│   ├── sqlite-repository.ts # SQLite implementations (4 classes)
│   ├── seed-data.ts         # ~85 solvents + 7 polymer groups
│   └── seed-nano-particles.ts # 18 nanoparticles
│
├── main/                    # Electron main process
│   ├── main.ts              # App lifecycle + seed loading
│   ├── ipc-handlers.ts      # 45+ IPC handlers
│   └── preload.ts           # Context-isolated bridge (40+ methods)
│
├── renderer/                # React UI
│   ├── main.tsx             # Entry point
│   ├── App.tsx              # Tab router (6 tabs)
│   ├── components/
│   │   ├── ReportView.tsx
│   │   ├── NanoDispersionView.tsx
│   │   ├── ContactAngleView.tsx
│   │   ├── DatabaseEditor.tsx
│   │   ├── MixtureLab.tsx
│   │   ├── SettingsView.tsx
│   │   ├── PartsGroupSelector.tsx
│   │   ├── SolventSelector.tsx
│   │   ├── ResultsTable.tsx
│   │   ├── RiskBadge.tsx
│   │   ├── DispersibilityBadge.tsx
│   │   ├── WettabilityBadge.tsx
│   │   └── ErrorBoundary.tsx
│   └── hooks/
│       ├── useContactAngle.ts
│       ├── useNanoParticles.ts
│       ├── useNanoDispersion.ts
│       ├── useEvaluation.ts
│       ├── usePartsGroups.ts
│       └── useSolvents.ts
│
└── preload.d.ts             # window.api type definitions

tests/
├── unit/                    # 218 tests
├── integration/             # DB operations
├── renderer/                # 85 React component + hook tests
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
