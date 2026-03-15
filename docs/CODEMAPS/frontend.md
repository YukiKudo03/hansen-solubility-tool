<!-- Generated: 2026-03-15 | Updated: 2026-03-15 | Files scanned: 40 | Token estimate: ~950 -->

# Frontend Component Architecture

## MD3 Responsive Navigation (3-tier)

```
Screen Width    Navigation Pattern       Component
≥840px          Navigation Drawer        NavigationDrawer.tsx (240px sidebar)
600-839px       Navigation Rail          NavigationRail.tsx (80px icon rail + popover)
<600px          Bottom Navigation        BottomNavigation.tsx (bottom bar + popup)
```

**Breakpoint detection:** `useMediaQuery()` hook → returns `'desktop' | 'tablet' | 'mobile'`

## 5 Category Navigation (12 items grouped)

| Category | Icon | Items |
|----------|------|-------|
| 評価 | 📊 | 溶解性評価, 接触角推定, 膨潤度予測, 耐薬品性予測 |
| 選定 | 🔍 | ナノ粒子分散, 可塑剤選定, キャリア選定 |
| 最適化 | ⚡ | ブレンド最適化, 薬物溶解性 |
| データ | 💾 | データベース編集, 混合溶媒 |
| 設定 | ⚙️ | 設定 |

Defined in: `src/renderer/navigation.ts` (Tab type, NavCategory, NAV_CATEGORIES)

## Component Hierarchy

```
App.tsx (MD3 responsive layout)
├── header (bg-md3-surface-container-low)
├── NavigationDrawer / NavigationRail (desktop/tablet)
│   └── 5 categories → expandable sub-items → onSelect(tab)
├── main (flex-1 overflow-y-auto)
│   ├── ReportView (A) → PartsGroupSelector + SolventSelector → ResultsTable + RiskBadge
│   ├── ContactAngleView (C) → 2 modes (group/screening) → WettabilityBadge
│   ├── SwellingView (E) → Group + Solvent + elastomer warning → SwellingBadge
│   ├── ChemicalResistanceView (G) → Group + Solvent → ChemicalResistanceBadge
│   ├── NanoDispersionView (B) → Category + Particle → DispersibilityBadge
│   ├── PlasticizerView (H) → Group + Part → PlasticizerBadge
│   ├── CarrierSelectionView (I) → Drug + CarrierGroup → CarrierBadge
│   ├── BlendOptimizerView (D) → Target HSP + Solvent checkboxes → Ranking table
│   ├── DrugSolubilityView (F) → Drug + Solvent/screening → DrugSolubilityBadge
│   ├── DatabaseEditor, MixtureLab, SettingsView
│   └── ErrorBoundary
└── BottomNavigation (mobile only)
```

## MD3 Design Tokens (tailwind.config.ts)

- **Colors:** 23 tokens (`md3-primary`, `md3-surface`, `md3-secondary-container`, etc.)
- **Border Radius:** `rounded-md3-sm`(8px), `rounded-md3-md`(12px), `rounded-md3-lg`(16px), `rounded-md3-xl`(28px)
- **Typography:** 11 scales (`md3-title-lg`, `md3-body-md`, `md3-label-sm`, etc.)

## Badges (8 components, MD3 Tonal style)

All badges use `rounded-md3-sm text-md3-label-md` (MD3 unified).

| Badge | Levels | Direction | L1 Color | L5 Color |
|-------|--------|-----------|----------|----------|
| RiskBadge | 1-5 | L1=worst | red | green |
| DispersibilityBadge | 1-5 | L1=best | green | red |
| WettabilityBadge | 1-6 | L1=hydrophilic | blue | red |
| SwellingBadge | 1-5 | L1=worst | red | green |
| DrugSolubilityBadge | 1-5 | L1=best | green | red |
| ChemicalResistanceBadge | 1-5 | **L1=worst** | **red** | **green** |
| PlasticizerBadge | 1-5 | L1=best | green | red |
| CarrierBadge | 1-5 | L1=best | green | red |

## Hooks (14)

| Hook | Purpose |
|------|---------|
| **useMediaQuery** | Screen size detection (mobile/tablet/desktop) |
| usePartsGroups | Parts group data |
| useSolvents | Solvent data |
| useEvaluation | Polymer evaluation |
| useNanoParticles | Nanoparticle data |
| useNanoDispersion | Dispersion screening |
| useContactAngle | Contact angle estimation |
| useBlendOptimizer | Blend optimization |
| useSwelling | Swelling prediction |
| useDrugs | Drug data |
| useDrugSolubility | Drug solubility |
| useChemicalResistance | Chemical resistance |
| usePlasticizer | Plasticizer screening |
| useCarrierSelection | Carrier selection |

## Window Size

- Default: **960×680** (Full HD 2/3以下, 面積1/3以下)
- Minimum: **700×500**

## IPC Interface (window.api) — 70+ Methods

```
Parts CRUD (8), Solvents CRUD+getPlasticizers (8), NanoParticles CRUD (7), Drugs CRUD (7)
Pipeline A-I evaluation/screening (14), Settings get/set (18), Export saveCsv (1)
```

---

**Related:** See `architecture.md` for pipeline details, `data.md` for database schema.
