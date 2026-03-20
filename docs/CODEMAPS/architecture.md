<!-- Generated: 2026-03-21 | Files scanned: 131 src | Token estimate: ~980 -->

# Hansen Solubility System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐          ┌────────────────────────┐   │
│  │  MAIN PROCESS        │  IPC     │  RENDERER PROCESS      │   │
│  │  (main.ts)           │◄────────►│  (React 19 App.tsx)    │   │
│  │  + electron-updater  │ 80+ API  │  MD3 responsive        │   │
│  │                      │          │  Dark mode (class)     │   │
│  │ ┌──────────────────┐ │          │ ┌──────────────────┐   │   │
│  │ │ IPC Handlers     │ │          │ │ 20 Feature Views │   │   │
│  │ │ 100+ handlers    │ │          │ │ + DB/Mix/History │   │   │
│  │ │ + CSV import     │ │          │ │ + Settings       │   │   │
│  │ └──────────────────┘ │          │ └──────────────────┘   │   │
│  │         ▼            │          │        ▲               │   │
│  │ ┌──────────────────┐ │          │   20 Hooks             │   │
│  │ │ Core (39 modules)│ │          │   9 Badges             │   │
│  │ │ 18 evaluators    │ │          │   i18n (ja/en)         │   │
│  │ │ Pure functions   │ │          │   i18n (ja/en)         │   │
│  │ └──────────────────┘ │          └────────────────────────┘   │
│  │         ▼            │                                       │
│  │ ┌──────────────────┐ │                                       │
│  │ │ 8 Repositories   │ │                                       │
│  │ │ + Bookmark, Hist │ │                                       │
│  │ └──────────────────┘ │                                       │
│  │         ▼            │                                       │
│  │ ┌──────────────────┐ │                                       │
│  │ │ SQLite (WAL)     │ │                                       │
│  │ │ 9 tables         │ │                                       │
│  │ └──────────────────┘ │                                       │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Evaluation Pipelines (18 total)

### Group A: Core Classifiers (10)
```
A) Polymer Risk:        ReportView → evaluate() → Ra/RED → classifyRisk(RED小=危険)
B) Nano Dispersion:     NanoDispersionView → screenAll() → classifyDispersibility(RED小=良好)
C) Contact Angle:       ContactAngleView → estimateContactAngle() → Young's eq → θ → classifyWettability
D) Blend Optimization:  BlendOptimizerView → optimizeBlend() → grid search → Ra最小化
E) Swelling:            SwellingView → evaluateSwelling() → classifySwelling(RED小=膨潤大)
F) Drug Solubility:     DrugSolubilityView → screenDrugSolvents() → classifyDrugSolubility
G) Chemical Resistance: ChemResistanceView → evaluate() → classifyChemResistance(RED大=耐性良 ※逆)
H) Plasticizer:         PlasticizerView → screenPlasticizers() → classifyCompatibility
I) Carrier Selection:   CarrierSelectionView → screenCarriers() → classifyCompatibility
J) Dispersant Selection: DispersantSelectionView → screenDispersants() → dual-HSP anchor+solvation → classifyAffinity
```

### Group B: Advanced Evaluators (8)
```
K) Adhesion:            AdhesionView → evaluateAdhesion() → 接着強度スコア
L) TEAS Plot:           TeasPlotView → computeTeasMetrics() → 毒性/爆発/美観/安全分析
M) Bagley Plot:         BagleyPlotView → computeBagley() → 膜形成能評価
N) 2D Projection:       Projection2DView → project2D() → δD-δP平面上の散布図
O) Sphere Fitting:      SphereFittingView → fitOptimalSphere() → 最適HSP球算出
P) Green Solvent:       GreenSolventView → scoreGreenSolvent() → 環境友好性スコア
Q) Multi-Objective:     MultiObjectiveView → paretoOptimization() → Pareto最適複合選定
R) Group Contribution:  GroupContributionView → estimateHSPbyGroups() → 官能基HSP推定
```

### Group C: Analytics & Utilities (3)
```
Comparison Report:      ComparisonView → buildComparisonMatrix() → 材料×溶媒のRED一括比較
HSP 3D Visualization:   HSPVisualizationView → Plotly.js → δD-δP-δH散布+HSP球
Evaluation History:     EvaluationHistoryView → 自動保存された過去の結果を参照
Bookmarks:              BookmarkButton → 評価条件のプリセット保存・復元
```

### Shared Core
All RED-based pipelines share `hsp.ts:calculateRa()/calculateRed()`.
Contact angle uses Nakamoto-Yamamoto + Owens-Wendt (alternative).
Temperature correction via Barton法 (`temperature-hsp.ts`).

## Advanced Computation Modules

```
Core Calculations:
  temperature-hsp.ts      Barton法 — HSPの温度補正
  thermal-expansion-data.ts 27溶媒の体積膨張係数
  evaporation.ts          Antoine式+Raoult則 — 蒸発シミュレーション
  contact-angle-methods.ts Owens-Wendt法 — 代替接触角推定
  solubility-estimation.ts Greenhalgh式 — 溶解度mg/mL推定

Advanced Analysis:
  dispersant-selection.ts Dual-HSP分散剤スクリーニング（anchor+solvation）
  group-contribution.ts   Van Krevelen法 — 官能基→HSP推定 (+201行)
  adhesion.ts             接着強度計算エンジン
  teas-plot.ts            TEAS分析メトリクス
  bagley-plot.ts          Bagleyプロット計算
  projection-2d.ts        2D射影変換
  sphere-fitting.ts       最適球当てはめ
  green-solvent.ts        環境スコアリング
  multi-objective.ts      Pareto最適化

Utilities:
  csv-import.ts           CSVパース・バリデーション
  ghs-safety.ts           GHS分類・SVHC判定
  comparison.ts           バッチ評価マトリクス
  hsp-visualization.ts    3Dプロットデータ生成
  theme.ts                MD3 light/dark カラートークン
  pdf-report.ts           PDFレポートデータ生成
```

## Module Boundaries

| Layer | Location | Files | Lines | Purpose |
|-------|----------|-------|-------|---------|
| **Domain** | `src/core/` | 39 | 4,900 | 18 evaluators, 10 classifiers, utilities |
| **Data** | `src/db/` | 12 | 1,780 | Schema(9 tables), 8 repos, 7 seed files |
| **Main** | `src/main/` | 3 | 1,100 | Electron, 110+ IPC, auto-updater |
| **UI** | `src/renderer/` | 65 | 7,000 | 42 components, 20 hooks, i18n |
| **Tests** | `tests/` | 133 | — | 1100+ unit/renderer + 25 E2E specs |

---

**Last Updated:** 2026-03-21

**Next:** See `backend.md` for IPC/handlers, `frontend.md` for components, `data.md` for schema.
