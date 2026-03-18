<!-- Generated: 2026-03-18 | Files scanned: 102 src | Token estimate: ~900 -->

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
│  │ │ IPC Handlers     │ │          │ │ 12 Feature Views │   │   │
│  │ │ 80+ handlers     │ │          │ │ + DB/Mix/History │   │   │
│  │ │ + CSV import     │ │          │ │ + Settings       │   │   │
│  │ └──────────────────┘ │          │ └──────────────────┘   │   │
│  │         ▼            │          │        ▲               │   │
│  │ ┌──────────────────┐ │          │   19 Hooks             │   │
│  │ │ Core (31 modules)│ │          │   8 Badges             │   │
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

## Evaluation Pipelines (9) + Utilities (4)

### Group 1: Core Classifiers
```
A) Polymer Risk:        ReportView → evaluate() → Ra/RED → classifyRisk(RED小=危険)
B) Nano Dispersion:     NanoDispersionView → screenAll() → classifyDispersibility(RED小=良好)
C) Contact Angle:       ContactAngleView → estimateContactAngle() → Young's eq → θ → classifyWettability
```

### Group 2: Engineering
```
D) Blend Optimization:  BlendOptimizerView → optimizeBlend() → grid search → Ra最小化
E) Swelling:            SwellingView → evaluateSwelling() → classifySwelling(RED小=膨潤大)
F) Drug Solubility:     DrugSolubilityView → screenDrugSolvents() → classifyDrugSolubility
```

### Group 3: Advanced
```
G) Chemical Resistance: ChemResistanceView → evaluate() → classifyChemResistance(RED大=耐性良 ※逆)
H) Plasticizer:         PlasticizerView → screenPlasticizers() → classifyCompatibility
I) Carrier Selection:   CarrierSelectionView → screenCarriers() → classifyCompatibility
```

### Group 4: Analytics & Visualization
```
J) Comparison Report:   ComparisonView → buildComparisonMatrix() → 材料×溶媒のRED一括比較
K) HSP 3D Viz:          HSPVisualizationView → Plotly.js → δD-δP-δH散布+HSP球
L) Evaluation History:  EvaluationHistoryView → 自動保存された過去の結果を参照
M) Bookmarks:           BookmarkButton → 評価条件のプリセット保存・復元
```

### Shared Core
All RED-based pipelines share `hsp.ts:calculateRa()/calculateRed()`.
Contact angle uses Nakamoto-Yamamoto + Owens-Wendt (alternative).
Temperature correction via Barton法 (`temperature-hsp.ts`).

## Advanced Computation Modules

```
temperature-hsp.ts      Barton法 — HSPの温度補正
thermal-expansion-data.ts 27溶媒の体積膨張係数
evaporation.ts          Antoine式+Raoult則 — 蒸発シミュレーション
group-contribution.ts   Van Krevelen法 — 官能基→HSP推定
contact-angle-methods.ts Owens-Wendt法 — 代替接触角推定
solubility-estimation.ts Greenhalgh式 — 溶解度mg/mL推定
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
| **Domain** | `src/core/` | 31 | 3,350 | Pure calculations, classifiers, utilities |
| **Data** | `src/db/` | 11 | 1,660 | Schema(8 tables), 7 repos, 6 seed files |
| **Main** | `src/main/` | 3 | 940 | Electron, 80+ IPC, auto-updater |
| **UI** | `src/renderer/` | 55 | 5,180 | 32 components, 19 hooks, i18n |
| **Tests** | `tests/` | 95 | — | 928 unit + 98 E2E |

---

**Next:** See `frontend.md` for component details, `data.md` for database schema.
