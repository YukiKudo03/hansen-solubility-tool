<!-- Generated: 2026-03-18 | Files scanned: 55 renderer | Token estimate: ~950 -->

# Frontend Component Architecture

## MD3 Responsive Navigation (3-tier)

```
Screen Width    Navigation Pattern       Component
≥840px          Navigation Drawer        NavigationDrawer.tsx (240px sidebar)
600-839px       Navigation Rail          NavigationRail.tsx (80px icon rail + popover)
<600px          Bottom Navigation        BottomNavigation.tsx (bottom bar + popup)
```

**Breakpoint detection:** `useMediaQuery()` hook → returns `'desktop' | 'tablet' | 'mobile'`

## 5 Category Navigation (15 items grouped)

| Category | Icon | Items |
|----------|------|-------|
| 評価 | 📊 | 溶解性評価, 接触角推定, 膨潤度予測, 耐薬品性予測 |
| 選定 | 🔍 | ナノ粒子分散, 可塑剤選定, キャリア選定 |
| 最適化 | ⚡ | ブレンド最適化, 薬物溶解性, 比較レポート, 3D可視化 |
| データ | 💾 | データベース編集, 混合溶媒, 履歴 |
| 設定 | ⚙️ | 設定 |

Defined in: `src/renderer/navigation.ts` (Tab type, NavCategory, NAV_CATEGORIES)

## Component Hierarchy

```
App.tsx (MD3 responsive + useTheme() dark mode)
├── header (bg-md3-surface-container-low)
├── NavigationDrawer / NavigationRail (desktop/tablet)
│   └── 5 categories → expandable sub-items → onSelect(tab)
├── main (flex-1 overflow-y-auto)
│   ├── ReportView (A) → PartsGroupSelector + SolventSelector → ResultsTable + RiskBadge
│   ├── ContactAngleView (C) → 2 modes (group/screening) → WettabilityBadge + warnings
│   ├── SwellingView (E) → Group + Solvent + elastomer warning → SwellingBadge
│   ├── ChemicalResistanceView (G) → Group + Solvent → ChemicalResistanceBadge
│   ├── NanoDispersionView (B) → Category + Particle → DispersibilityBadge
│   ├── PlasticizerView (H) → Group + Part → PlasticizerBadge
│   ├── CarrierSelectionView (I) → Drug + CarrierGroup → CarrierBadge
│   ├── BlendOptimizerView (D) → Target HSP (+ 材料参照) + checkboxes → Ranking
│   ├── DrugSolubilityView (F) → Drug + Solvent/screening → DrugSolubilityBadge
│   ├── ComparisonView (J) → 複数材料 × 複数溶媒 → ヒートマップテーブル
│   ├── HSPVisualizationView (K) → Plotly.js 3D scatter + HSP球
│   ├── EvaluationHistoryView (L) → 自動保存履歴 + フィルタ + 削除
│   ├── DatabaseEditor, MixtureLab, SettingsView (+ テーマ切替)
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

## Badges (8 components, MD3 Tonal style)

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

## Hooks (19)

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
| useEvaluation | Polymer evaluation |
| useNanoParticles | Nanoparticle data (category filter) |
| useNanoDispersion | Dispersion screening |
| useContactAngle | Contact angle estimation |
| useBlendOptimizer | Blend optimization |
| useSwelling | Swelling prediction |
| useDrugSolubility | Drug solubility |
| useChemicalResistance | Chemical resistance |
| usePlasticizer | Plasticizer screening |
| useCarrierSelection | Carrier selection |

## Dark Mode & Theming

- `tailwind.config.ts`: `darkMode: 'class'`
- `src/core/theme.ts`: MD3 light/dark カラートークン (16色)
- `src/renderer/hooks/useTheme.ts`: CSS変数生成 + localStorage永続化
- 設定画面: ライト / ダーク / システム の3モード切替

## i18n (src/i18n/)

- `i18next` + `react-i18next`
- 60+翻訳キー (ja/en)
- localStorage で言語設定永続化

## IPC Interface (window.api) — 80+ Methods

```
Parts CRUD (8), Solvents CRUD+Plasticizers (8), NanoParticles CRUD (7), Drugs CRUD (7)
Pipeline A-I evaluation/screening (14), Settings get/set (18)
Bookmarks (3), History (5), CSV Import (3), Export saveCsv (1)
```

---

**Related:** See `architecture.md` for pipeline details, `data.md` for database schema.
