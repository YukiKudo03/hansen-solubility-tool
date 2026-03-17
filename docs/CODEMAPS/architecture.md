<!-- Generated: 2026-03-15 | Updated: 2026-03-18 | Files scanned: 68 src | Token estimate: ~980 -->

# Hansen Solubility System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐          ┌────────────────────────┐   │
│  │  MAIN PROCESS        │  IPC     │  RENDERER PROCESS      │   │
│  │  (main.ts)           │◄────────►│  (React 19 App.tsx)    │   │
│  │                      │ 70+ API  │  MD3 responsive (960×680)│   │
│  │ ┌──────────────────┐ │          │ ┌──────────────────┐   │   │
│  │ │ IPC Handlers     │ │          │ │ 9 Feature Views  │   │   │
│  │ │ 70+ handlers     │ │          │ │ + DB/Mix/Settings│   │   │
│  │ └──────────────────┘ │          │ └──────────────────┘   │   │
│  │         ▼            │          │        ▲               │   │
│  │ ┌──────────────────┐ │          │   14 Hooks             │   │
│  │ │ Core (17 modules)│ │          │   7 Badges             │   │
│  │ │ Pure functions   │ │          └────────────────────────┘   │
│  │ └──────────────────┘ │                                       │
│  │         ▼            │                                       │
│  │ ┌──────────────────┐ │                                       │
│  │ │ 5 Repositories   │ │                                       │
│  │ │ Parts, Solvent,  │ │                                       │
│  │ │ NanoParticle,    │ │                                       │
│  │ │ Drug, Settings   │ │                                       │
│  │ └──────────────────┘ │                                       │
│  │         ▼            │                                       │
│  │ ┌──────────────────┐ │                                       │
│  │ │ SQLite (WAL)     │ │                                       │
│  │ │ 6 tables         │ │                                       │
│  │ └──────────────────┘ │                                       │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Nine Evaluation Pipelines

### Group 1: Original (Ra/RED classifiers)
```
A) Polymer Risk:        ReportView → evaluate(groupId, solventId) → Ra/RED → classifyRisk → RiskLevel(RED小=危険)
B) Nano Dispersion:     NanoDispersionView → screenAll(particleId) → Ra/RED → classifyDispersibility(RED小=良好)
C) Contact Angle:       ContactAngleView → estimateContactAngle() → γ_SV/γ_LV/γ_SL → Young's eq → θ → classifyWettability
```

### Group 2: Phase 1 (Engineering applications)
```
D) Blend Optimization:  BlendOptimizerView → optimizeBlend(target, solvents, step, topN) → grid search → Ra最小化
E) Swelling:            SwellingView → evaluateSwelling(groupId, solventId) → Ra/RED → classifySwelling(RED小=膨潤大)
F) Drug Solubility:     DrugSolubilityView → screenDrugSolvents(drugId) → Ra/RED → classifyDrugSolubility(RED小=溶解性良)
```

### Group 3: Phase 2 (Advanced applications)
```
G) Chemical Resistance: ChemResistanceView → evaluate(groupId, solventId) → Ra/RED → classifyChemResistance(RED大=耐性良 ※逆向き)
H) Plasticizer:         PlasticizerView → screenPlasticizers(partId, groupId) → Ra/RED → classifyCompatibility(RED小=相溶性良)
I) Carrier Selection:   CarrierSelectionView → screenCarriers(drugId, groupId) → Ra/RED → classifyCompatibility(carrier.r0使用)
```

### Shared Core
All pipelines share `calculateRa()`/`calculateRed()` from `hsp.ts` except Pipeline C (uses Nakamoto-Yamamoto) and D (uses grid search + blendHSP).

## Entity Mapping (Phase 2: No New Tables)

| Feature | Material Entity | Comparison Entity | Notes |
|---------|----------------|-------------------|-------|
| Chemical Resistance | Part (「コーティング材料」group) | Solvent | RED逆向き |
| Plasticizer | Part (any) | Solvent ([可塑剤] tagged) | notes LIKE filter |
| Carrier Selection | Drug | Part (「DDSキャリア」group) | carrier.r0 used |

## Component Hierarchy

```
App.tsx (MD3 responsive: Drawer ≥840px / Rail 600-839px / BottomNav <600px)
├── NavigationDrawer (5 categories: 評価/選定/最適化/データ/設定)
├── NavigationRail (icon + popover)
├── BottomNavigation (bottom bar + popup)
├── 9 Feature Views (A-I) + DatabaseEditor + MixtureLab + SettingsView
└── ErrorBoundary
```

## Module Boundaries

| Layer | Location | Files | Purpose |
|-------|----------|-------|---------|
| **Domain** | `src/core/` | 17 | Pure calculations, classification, CSV, validation, accuracy warnings |
| **Data Access** | `src/db/` | 9 | Schema, 5 repos, 6 seed files |
| **Main Process** | `src/main/` | 3 | Electron lifecycle, 70+ IPC handlers, preload |
| **UI** | `src/renderer/` | 40 | 27 components (9 Views, 8 Badges, 3 Nav, 4 Selectors, 3 Shared), 14 hooks, navigation.ts |

## File Structure

```
src/
├── core/                          # Pure domain logic (17 files)
│   ├── types.ts                   # All types (9 level enums, 20+ interfaces)
│   ├── hsp.ts                     # calculateRa/RED (shared)
│   ├── risk.ts                    # Pipeline A
│   ├── dispersibility.ts          # Pipeline B
│   ├── wettability.ts             # Pipeline C (classification)
│   ├── contact-angle.ts           # Pipeline C (calculation)
│   ├── blend-optimizer.ts         # Pipeline D (grid search)
│   ├── swelling.ts                # Pipeline E
│   ├── drug-solubility.ts         # Pipeline F
│   ├── chemical-resistance.ts     # Pipeline G (RED逆向き)
│   ├── plasticizer.ts             # Pipeline H
│   ├── carrier-selection.ts       # Pipeline I
│   ├── solvent-finder.ts          # Screening utilities
│   ├── report.ts                  # 9 CSV formatters
│   ├── validation.ts              # 12+ validators
│   ├── mixture.ts                 # Mixture calculations
│   └── accuracy-warnings.ts      # Literature-based accuracy warnings (UI layer)
├── db/                            # Data access (9 files)
│   ├── schema.ts                  # 6 tables
│   ├── repository.ts              # 5 interfaces + DTOs
│   ├── sqlite-repository.ts       # 5 implementations
│   ├── seed-data.ts               # 85 solvents + 7 groups
│   ├── seed-nano-particles.ts     # 18 nanoparticles
│   ├── seed-drugs.ts              # 15 drugs
│   ├── seed-coatings.ts           # 12 coatings (PartsGroup)
│   ├── seed-plasticizers.ts       # 10 plasticizers (Solvent)
│   └── seed-carriers.ts           # 11 DDS carriers (PartsGroup)
├── main/                          # Electron main (3 files)
│   ├── main.ts, ipc-handlers.ts, preload.ts
├── renderer/                      # React UI (37 files)
│   ├── components/ (24)           # 9 Views + 7 Badges + 4 Selectors + 3 Shared + ErrorBoundary
│   └── hooks/ (13)                # Feature hooks
└── preload.d.ts                   # window.api types (70+ methods)
```

---

**Next:** See `frontend.md` for component details, `data.md` for database schema.
