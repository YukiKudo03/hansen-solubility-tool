<!-- Last Updated: 2026-03-30 | UI: 142 components (93 Views + 49 supporting), 79 hooks, MD3 responsive, dark mode class-based -->

# Frontend Component Architecture

## MD3 Responsive Navigation (3-tier)

```
Screen Width    Navigation Pattern       Component
≥840px          Navigation Drawer        NavigationDrawer.tsx (240px sidebar)
600-839px       Navigation Rail          NavigationRail.tsx (80px icon rail + popover)
<600px          Bottom Navigation        BottomNavigation.tsx (bottom bar + popup)
```

**Breakpoint detection:** `useMediaQuery()` hook → returns `'desktop' | 'tablet' | 'mobile'`

## 6 Category Navigation (96 feature items)

| Category | Items | Views |
|----------|-------|-------|
| 評価 | 33 | Solubility, ContactAngle, Swelling, ChemicalResistance, Adhesion, ESC, PolymerBlend, Recycling, AdditiveMigration, FlavorScalping, FoodPackaging, Liposome, InkSubstrate, MultilayerCoating, PsaPeel, StructuralAdhesive, GasPermeability, MembraneSeparation, InhalationDrug, ProteinAggregation, ResidualSolvent, CoatingDefect, Photoresist, CrystallineDissolution, HydrogelSwelling, RubberCompounding, FiberDyeability, PolymorphRisk, PrintedElectronics, UnderfillEncapsulant, BiofuelCompatibility, SurfaceTreatmentQuantification, PSAPeelStrength |
| 選定 | 26 | NanoDispersion, DispersantSelection, Plasticizer, CarrierSelection, Cocrystal, Printing3d, DielectricFilm, Excipient, Compatibilizer, Fragrance, Transdermal, PigmentDispersion, CntGraphene, Mxene, NpDrugLoading, Co2Absorbent, HydrogenStorage, SunscreenUv, BiologicBuffer, NaturalDye, EssentialOil, SoilRemediation, Thermoset, QuantumDot, PcmEncapsulation, CleaningFormulation |
| 最適化 | 17 | BlendOptimizer, DrugSolubility, Comparison, SphereFitting, GreenSolvent, MultiObjective, SupercriticalCo2, PerovskiteSolvent, OrganicSemiconductor, UvCurableInk, Multicomponent, LiBattery, SolventSubstitution, CosmeticEmulsion, AntiGraffiti, PrimerlessAdhesion, (additional) |
| 分析 | 16 | HSPVisualization, TeasPlot, BagleyPlot, Projection2D, GroupContribution, CopolymerHsp, SurfaceTreatment, TemperatureHsp, PressureHsp, InverseHsp, HspUncertainty, SurfaceHsp, IonicLiquid, MlHspPrediction, MdHspImport, GroupContributionUpdates |
| データ | 3 | DatabaseEditor, MixtureLab, EvaluationHistory |
| 設定 | 1 | Settings |

Defined in: `src/renderer/navigation.ts` (Tab type, NavCategory, 6 categories, VIEW_MAP)

## Component Hierarchy

```
App.tsx (MD3 responsive + useTheme() dark mode)
├── header (bg-md3-surface-container-low)
├── NavigationDrawer / NavigationRail (desktop/tablet)
│   └── 6 categories → expandable sub-items → onSelect(tab)
├── main (flex-1 overflow-y-auto) — 93 Feature Views total
│   ├─ 評価Views (33):
│   │  ├── ReportView → PartsGroupSelector + SolventSelector → ResultsTable + RiskBadge
│   │  ├── ContactAngleView → 2 modes (group/screening) → WettabilityBadge + warnings
│   │  ├── SwellingView → Group + Solvent + elastomer warning → SwellingBadge
│   │  ├── ChemicalResistanceView → Group + Solvent → ChemicalResistanceBadge
│   │  ├── AdhesionView → 接着強度評価
│   │  └── 28 extended: EscPipelineView, PolymerBlendView, RecyclingView,
│   │       AdditiveMigrationView, FlavorScalpingView, FoodPackagingView,
│   │       LiposomeView, InkSubstrateView, MultilayerCoatingView,
│   │       PsaPeelView, StructuralAdhesiveView, GasPermeabilityView,
│   │       MembraneSeparationView, InhalationDrugView, ProteinAggregationView,
│   │       ResidualSolventView, CoatingDefectView, PhotoresistView,
│   │       CrystallineDissolutionView, HydrogelSwellingView, RubberCompoundingView,
│   │       FiberDyeabilityView, PolymorphRiskView, PrintedElectronicsView,
│   │       UnderfillEncapsulantView, BiofuelCompatibilityView,
│   │       SurfaceTreatmentQuantificationView, PSAPeelStrengthView
│   ├─ 選定Views (26):
│   │  ├── NanoDispersionView → Category + Particle → DispersibilityBadge
│   │  ├── DispersantSelectionView → Particle + Solvent → DispersantBadge (dual-HSP)
│   │  ├── PlasticizerView → Group + Part → PlasticizerBadge
│   │  ├── CarrierSelectionView → Drug + CarrierGroup → CarrierBadge
│   │  └── 22 extended: CocrystalView, Printing3dView, DielectricFilmView,
│   │       ExcipientView, CompatibilizerView, FragranceView, TransdermalView,
│   │       PigmentDispersionView, CntGrapheneView, MxeneView, NpDrugLoadingView,
│   │       Co2AbsorbentView, HydrogenStorageView, SunscreenUvView, BiologicBufferView,
│   │       NaturalDyeView, EssentialOilView, SoilRemediationView, ThermosetView,
│   │       QuantumDotView, PcmEncapsulationView, CleaningFormulationView
│   ├─ 最適化Views (17):
│   │  ├── BlendOptimizerView → Target HSP + checkboxes → Ranking
│   │  ├── DrugSolubilityView → Drug + Solvent/screening → DrugSolubilityBadge
│   │  ├── ComparisonView → 複数材料 × 複数溶媒 → ヒートマップ
│   │  ├── SphereFittingView, GreenSolventView, MultiObjectiveView
│   │  └── 11 extended: SupercriticalCo2View, CleaningFormulationView,
│   │       PerovskiteView, OrganicSemiconductorView, UvCurableInkView,
│   │       MulticomponentView, LiBatteryView, SolventSubstitutionView,
│   │       CosmeticEmulsionView, AntiGraffitiView, PrimerlessAdhesionView
│   ├─ 分析Views (16):
│   │  ├── HSPVisualizationView → Plotly.js 3D scatter + HSP球
│   │  ├── TeasPlotView, BagleyPlotView, Projection2DView, GroupContributionView
│   │  └── 11 extended: CopolymerHspView, SurfaceTreatmentView,
│   │       TemperatureHspView, PressureHspView, InverseHspView,
│   │       HspUncertaintyView, SurfaceHspView, IonicLiquidView,
│   │       MlHspPredictionView, MdHspImportView, GroupContributionUpdatesView
│   ├─ データViews (3):
│   │  ├── DatabaseEditor → CRUD UI
│   │  ├── MixtureLab → 溶媒混合計算
│   │  └── EvaluationHistoryView → 自動保存履歴 + フィルタ + 削除
│   ├── SettingsView (+ テーマ切替)
│   └── ErrorBoundary
├── BottomNavigation (mobile only)
└── BookmarkButton (各評価View内に配置)
```

## Shared UI Components

| Component | Purpose |
|-----------|---------|
| `SortTableHeader` | ジェネリック型ソートヘッダー (aria-sort + keyboard) |
| `BookmarkButton` | ☆保存ダイアログ付きブックマークボタン |
| `PartsGroupSelector` | グループ選択 (htmlFor/id紐付き) |
| `SolventSelector` | 検索ドロップダウン (キーボードナビ + ARIA) |
| `ResultsTable` | 汎用結果テーブル |
| `ErrorBoundary` | React エラーバウンダリ |

## Badges (45+ components, MD3 Tonal style)

All badges use `rounded-md3-sm text-md3-label-md`.

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
| DispersantBadge | 1-5 | L1=best | green | red |
| + 36 specialized badges | varies | varies | varies | varies |

## Hooks (79)

| Hook | Purpose |
|------|---------|
| **useMediaQuery** | Screen size detection (mobile/tablet/desktop) |
| **useTheme** | Dark mode管理 (light/dark/system, localStorage永続化) |
| **useCsvExport** | CSV出力の共通パターン (エラーハンドリング含む) |
| **useSortableTable** | ソートキー/方向/トグルの共通管理 |
| **useBookmarks** | ブックマーク CRUD + reload |
| **useEvaluationHistory** | 履歴フェッチ + フィルタ |
| usePartsGroups | Parts group data |
| useSolvents | Solvent data + search |
| useDrugs | Drug data |
| useNanoParticles | Nanoparticle data (category filter) |
| useEvaluation | Polymer evaluation |
| + 68 feature-specific hooks | 1 hook per evaluation view |

### Hook Pattern
```typescript
export function useFeatureName() {
  const [result, setResult] = useState<ResultType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const evaluate = useCallback(async (params) => {
    setLoading(true); setError(null);
    try { setResult(await window.api.methodName(params)); }
    catch (e) { setError(e instanceof Error ? e.message : 'エラー'); }
    finally { setLoading(false); }
  }, []);
  return { result, loading, error, evaluate };
}
```

## Dark Mode & Theming

- `tailwind.config.ts`: `darkMode: 'class'`
- `src/core/theme.ts`: MD3 light/dark カラートークン (16色)
- `src/renderer/hooks/useTheme.ts`: CSS変数生成 + localStorage永続化
- 設定画面: ライト / ダーク / システム の3モード切替

## i18n (src/i18n/)

- `i18next` + `react-i18next`
- 60+翻訳キー (ja/en)
- localStorage で言語設定永続化

## State Management

**No external state library** — pure React patterns:
- `useState` for component state
- `useCallback` / `useMemo` for memoization
- Custom hooks for business logic encapsulation
- Direct `window.api.*` calls (Electron IPC bridge)

## IPC Interface (window.api) — 167+ Methods

```
Parts CRUD (8), Solvents CRUD+Plasticizers (8), NanoParticles CRUD (7), Drugs CRUD (7), Dispersants CRUD (5)
Core pipeline evaluation/screening (30), Extended pipeline handlers (60+)
Settings get/set (22), Bookmarks (3), History (5), CSV Import/Export (3)
Advanced analytics (12+)
Total: ~167 IPC methods, all validated
```

---

**Related:** See `architecture.md` for system overview, `backend.md` for IPC handlers, `data.md` for schema.

**Last Updated:** 2026-03-30
