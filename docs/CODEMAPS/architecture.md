<!-- Generated: 2026-03-20 | Files scanned: 125 src | Token estimate: ~950 -->

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
│  │ ┌──────────────────┐ │          │   19 Hooks             │   │
│  │ │ Core (38 modules)│ │          │   8 Badges             │   │
│  │ │ 17 evaluators    │ │          │   i18n (ja/en)         │   │
│  │ │ Pure functions   │ │          │   i18n (ja/en)         │   │
│  │ └──────────────────┘ │          └────────────────────────┘   │
│  │         ▼            │                                       │
│  │ ┌──────────────────┐ │                                       │
│  │ │ 7 Repositories   │ │                                       │
│  │ │ + Bookmark, Hist │ │                                       │
│  │ └──────────────────┘ │                                       │
│  │         ▼            │                                       │
│  │ ┌──────────────────┐ │                                       │
│  │ │ SQLite (WAL)     │ │                                       │
│  │ │ 8 tables         │ │                                       │
│  │ └──────────────────┘ │                                       │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Evaluation Pipelines (17 total)

### Group A: Core Classifiers (9)
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
```

### Group B: Advanced Evaluators (8)
```
J) Adhesion:            AdhesionView → evaluateAdhesion() → 接着強度スコア
K) TEAS Plot:           TeasPlotView → computeTeasMetrics() → 毒性/爆発/美観/安全分析
L) Bagley Plot:         BagleyPlotView → computeBagley() → 膜形成能評価
M) 2D Projection:       Projection2DView → project2D() → δD-δP平面上の散布図
N) Sphere Fitting:      SphereFittingView → fitOptimalSphere() → 最適HSP球算出
O) Green Solvent:       GreenSolventView → scoreGreenSolvent() → 環境友好性スコア
P) Multi-Objective:     MultiObjectiveView → paretoOptimization() → Pareto最適複合選定
Q) Group Contribution:  GroupContributionView → estimateHSPbyGroups() → 官能基HSP推定
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

Advanced Analysis (新規):
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
| **Domain** | `src/core/` | 38 | 4,700 | 17 evaluators, 9 classifiers, utilities |
| **Data** | `src/db/` | 11 | 1,680 | Schema(8 tables), 7 repos, 6 seed files |
| **Main** | `src/main/` | 3 | 1,075 | Electron, 100+ IPC, auto-updater |
| **UI** | `src/renderer/` | 62 | 6,770 | 40 components, 19 hooks, i18n |
| **Tests** | `tests/` | 79 | — | 975 unit + 98 E2E |

---

**Last Updated:** 2026-03-20

**Next:** See `frontend.md` for component details, `data.md` for database schema.
