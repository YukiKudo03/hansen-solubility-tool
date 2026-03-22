<!-- Generated: 2026-03-22 | Files scanned: 349 src | Token estimate: ~980 -->

# Hansen Solubility System Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     ELECTRON APPLICATION                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐          ┌────────────────────────┐   │
│  │  MAIN PROCESS        │  IPC     │  RENDERER PROCESS      │   │
│  │  (main.ts)           │◄────────►│  (React 19 App.tsx)    │   │
│  │  + electron-updater  │ 167 API  │  MD3 responsive        │   │
│  │                      │          │  Dark mode (class)     │   │
│  │ ┌──────────────────┐ │          │ ┌──────────────────┐   │   │
│  │ │ IPC Handlers     │ │          │ │ 91 Feature Views │   │   │
│  │ │ 167 handlers     │ │          │ │ + DB/Mix/History │   │   │
│  │ │ + CSV import     │ │          │ │ + Settings       │   │   │
│  │ └──────────────────┘ │          │ └──────────────────┘   │   │
│  │         ▼            │          │        ▲               │   │
│  │ ┌──────────────────┐ │          │   69 Hooks             │   │
│  │ │Core (117 modules)│ │          │   40 Badges            │   │
│  │ │ 70+ evaluators   │ │          │   i18n (ja/en)         │   │
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

## Evaluation Pipelines (70+ total across 8 categories)

### Category 1: 評価 (31 pipelines)
```
Core evaluators:
  溶解性評価         ReportView → evaluate() → Ra/RED → classifyRisk
  接触角推定         ContactAngleView → estimateContactAngle() → θ → classifyWettability
  膨潤度予測         SwellingView → evaluateSwelling() → classifySwelling
  耐薬品性予測       ChemResistanceView → classifyChemResistance (RED大=耐性良 ※逆)
  接着性予測         AdhesionView → evaluateAdhesion() → 接着強度スコア

Extended evaluators (26):
  環境応力亀裂(ESC), ブレンド相溶性, リサイクル相溶性, 添加剤移行,
  フレーバースカルピング, 包装材溶出, リポソーム透過性,
  インク-基材密着, 多層コーティング密着, 粘着テープ剥離強度, 構造接着設計,
  ガス透過性, 膜分離選択性, 吸入薬適合性, タンパク質凝集, 残留溶媒,
  コーティング欠陥, レジスト現像, 結晶溶解温度, ハイドロゲル膨潤,
  ゴム配合, 繊維染色性, 多形リスク, 印刷電子濡れ性, 封止材適合, バイオ燃料適合
```

### Category 2: 選定 (24 pipelines)
```
Core selectors:
  ナノ粒子分散       NanoDispersionView → screenAll() → classifyDispersibility
  分散剤選定         DispersantSelectionView → dual-HSP anchor+solvation → classifyAffinity
  可塑剤選定         PlasticizerView → screenPlasticizers() → classifyCompatibility
  キャリア選定       CarrierSelectionView → screenCarriers() → classifyCompatibility

Extended selectors (20):
  共結晶スクリーニング, 3D印刷平滑化, 誘電体膜品質, 賦形剤適合性,
  相溶化剤選定, 香料カプセル化, 経皮吸収促進剤, 顔料分散,
  CNT/グラフェン分散, MXene分散, NP薬物ローディング, CO2吸収材,
  水素貯蔵材料, UVフィルター適合, バイオ製剤バッファー, 天然色素抽出,
  精油抽出, 土壌汚染抽出, 硬化剤選定, QDリガンド交換, PCMカプセル化
```

### Category 3: 最適化 (17 pipelines)
```
Core optimizers:
  ブレンド最適化     BlendOptimizerView → optimizeBlend() → grid search → Ra最小化
  薬物溶解性         DrugSolubilityView → screenDrugSolvents() → classifyDrugSolubility
  比較レポート       ComparisonView → buildComparisonMatrix() → RED一括比較
  HSP球算出          SphereFittingView → fitOptimalSphere() → 最適HSP球
  グリーン溶媒       GreenSolventView → scoreGreenSolvent() → 環境スコア
  多目的選定         MultiObjectiveView → paretoOptimization() → Pareto最適

Extended optimizers (11):
  超臨界CO2, 洗浄剤配合, ペロブスカイト溶媒, 有機半導体膜, UV硬化インク,
  多成分最適化, LiB電解液, 溶媒代替, エマルション安定性, 防落書き, プライマーレス接着
```

### Category 4: 分析 (16 pipelines)
```
Core analytics:
  3D可視化           HSPVisualizationView → Plotly.js → δD-δP-δH散布+HSP球
  Teasプロット       TeasPlotView → computeTeasMetrics() → 毒性/爆発/美観/安全
  Bagleyプロット     BagleyPlotView → computeBagley() → 膜形成能評価
  2D射影             Projection2DView → project2D() → δD-δP平面散布図
  族寄与法           GroupContributionView → estimateHSPbyGroups() → 官能基HSP推定

Extended analytics (11):
  コポリマーHSP推定, 表面処理効果, 温度HSP補正, 圧力HSP補正,
  逆HSP推定, HSP不確かさ, 表面HSP決定, IL/DES HSP,
  HSP推算(QSPR), MD結果インポート, 族寄与法(拡張)
```

### Category 5-6: データ & 設定
```
データ (3):          データベース編集, 混合溶媒, 履歴
設定 (1):            設定
共通機能:            BookmarkButton → 評価条件のプリセット保存・復元
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
| **Domain** | `src/core/` | 117 | 15,400 | 70+ evaluators, 10 classifiers, utilities |
| **Data** | `src/db/` | 12 | 2,100 | Schema(9 tables), 8 repos, 7 seed files |
| **Main** | `src/main/` | 3 | 2,700 | Electron, 167 IPC, auto-updater |
| **UI** | `src/renderer/` | 214 | 17,700 | 142 components, 69 hooks, i18n |
| **Tests** | `tests/` | 222 | — | 2170 unit/renderer + 25 E2E specs |

---

**Last Updated:** 2026-03-22

**Next:** See `backend.md` for IPC/handlers, `frontend.md` for components, `data.md` for schema.
