<!-- Generated: 2026-03-24 | Files scanned: 361 src + 227 tests | Token estimate: ~980 -->

# Hansen Solubility Project — Codemap Index

A production-grade Electron desktop application for HSP-based material compatibility evaluation. **90+ evaluation pipelines** across 6 categories + comparison report + 3D visualization + advanced analytics + bookmarks + evaluation history.

## Quick Navigation

### System Design
- **[architecture.md](./architecture.md)** — System diagram, pipelines, module boundaries

### Implementation Details
- **[backend.md](./backend.md)** — IPC handlers (190+), repository pattern, validation
- **[frontend.md](./frontend.md)** — MD3 responsive layout, 96 tabs, 79 hooks, dark mode
- **[data.md](./data.md)** — SQLite schema (9 tables), repositories (8), seed data
- **[dependencies.md](./dependencies.md)** — External packages, build tools

## Key Insights

### Architecture
- **Electron Multi-Process:** Main (business logic + IPC) ↔ Renderer (React UI)
- **Pure Core:** `src/core/` contains no I/O — 117 modules
- **Repository Pattern:** `src/db/` — 8 repos (Parts, Solvent, NanoParticle, Drug, Dispersant, Settings, Bookmark, History)
- **i18n:** i18next (ja/en), **Dark Mode:** Tailwind `darkMode: 'class'`
- **Auto-Update:** electron-updater via GitHub Releases
- **Cross-Platform:** Win (NSIS) / macOS (dmg) / Linux (AppImage)

### Evaluation Pipelines (90+ across 6 categories)

```
評価 (33 pipelines):
  溶解性評価, 接触角推定, 膨潤度予測, 耐薬品性予測, 接着性予測,
  環境応力亀裂(ESC), ブレンド相溶性, リサイクル相溶性,
  添加剤移行, フレーバースカルピング, 包装材溶出,
  リポソーム透過性, インク-基材密着, 多層コーティング密着,
  粘着テープ剥離強度, 構造接着設計, ガス透過性, 膜分離選択性,
  吸入薬適合性, タンパク質凝集, 残留溶媒, コーティング欠陥,
  レジスト現像, 結晶溶解温度, ハイドロゲル膨潤, ゴム配合,
  繊維染色性, 多形リスク, 印刷電子濡れ性, 封止材適合,
  バイオ燃料適合, 表面処理効果定量, PSA剥離強度

選定 (26 pipelines):
  ナノ粒子分散, 分散剤選定, 可塑剤選定, キャリア選定,
  共結晶スクリーニング, 3D印刷平滑化, 誘電体膜品質, 賦形剤適合性,
  相溶化剤選定, 香料カプセル化, 経皮吸収促進剤,
  顔料分散, CNT/グラフェン分散, MXene分散, NP薬物ローディング,
  CO2吸収材, 水素貯蔵材料, UVフィルター適合, バイオ製剤バッファー,
  天然色素抽出, 精油抽出, 土壌汚染抽出, 硬化剤選定,
  QDリガンド交換, PCMカプセル化, 日焼け止めUVフィルター

最適化 (17 pipelines):
  ブレンド最適化, 超臨界CO2, 洗浄剤配合, 薬物溶解性,
  比較レポート, HSP球算出, グリーン溶媒, 多目的選定,
  ペロブスカイト溶媒, 有機半導体膜, UV硬化インク,
  多成分最適化, LiB電解液, 溶媒代替, エマルション安定性,
  防落書き, プライマーレス接着

分析 (16 pipelines):
  3D可視化, Teasプロット, Bagleyプロット, 2D射影, 族寄与法,
  コポリマーHSP推定, 表面処理効果, 温度HSP補正, 圧力HSP補正,
  逆HSP推定, HSP不確かさ, 表面HSP決定, IL/DES HSP,
  HSP推算(QSPR), MD結果インポート, 族寄与法(拡張)

データ (3): データベース編集, 混合溶媒, 履歴
設定 (1): 設定
```

### Tech Stack
- **Framework:** Electron 41 + React 19 + Vite 5
- **Language:** TypeScript 5.9 (strict)
- **Database:** SQLite (better-sqlite3 12.8), WAL mode
- **Styling:** Tailwind CSS 3.4, MD3 design tokens, dark mode
- **3D Plot:** Plotly.js (plotly.js-basic-dist-min)
- **PDF:** jspdf 4.2
- **i18n:** i18next + react-i18next
- **Testing:** Vitest 2.1 (2604 unit, pool:forks) + Playwright 1.58 (295 E2E, 30 specs)

## Module Tour

### src/core/ (117 files, ~15,400 lines)
Pure domain logic (testable, no side effects)

**計算エンジン 基本 (10):**
- `hsp.ts` — `calculateRa()`, `calculateRed()` (全パイプライン共通)
- `contact-angle.ts` — Nakamoto-Yamamoto式
- `contact-angle-methods.ts` — Owens-Wendt法（代替手法）
- `temperature-hsp.ts` — Barton法の温度補正
- `thermal-expansion-data.ts` — 27溶媒の体積膨張係数
- `blend-optimizer.ts` — グリッドサーチ最適化
- `evaporation.ts` — Antoine式+Raoult則の蒸発シミュレーション
- `mixture.ts` — 溶媒混合HSP計算
- `comparison.ts` — バッチ評価マトリクス
- `hsp-visualization.ts` — 3Dプロットデータ生成

**拡張分析エンジン (10):**
- `dispersant-selection.ts` — Dual-HSP分散剤スクリーニング（anchor+solvation評価）
- `group-contribution.ts` — Van Krevelen-Hoftyzer法HSP推定
- `solubility-estimation.ts` — Greenhalgh-Williams式溶解度推定
- `adhesion.ts` — 接着強度評価エンジン
- `teas-plot.ts` — TEAS分析（毒性・爆発・美観・安全）
- `bagley-plot.ts` — 膜形成能評価プロット
- `projection-2d.ts` — δD-δP平面上の2D投影計算
- `sphere-fitting.ts` — HSP最適球当てはめアルゴリズム
- `green-solvent.ts` — グリーン溶媒スコアリング
- `multi-objective.ts` — Pareto最適化フロント計算

**90+パイプライン計算モジュール:**
- 評価系33種 (ESC, ブレンド相溶性, 添加剤移行, ガス透過性, 膜分離, etc.)
- 選定系26種 (共結晶, 顔料分散, CNT/グラフェン, MXene, QDリガンド, etc.)
- 最適化系17種 (超臨界CO2, ペロブスカイト, LiB電解液, etc.)
- 分析系16種 (コポリマーHSP, 圧力補正, 逆HSP推定, IL/DES, ML予測, etc.)

**分類器 (9種):**
- `risk.ts`, `dispersibility.ts`, `wettability.ts`, `swelling.ts`
- `drug-solubility.ts`, `chemical-resistance.ts`, `plasticizer.ts`, `carrier-selection.ts`
- `solvent-finder.ts` — スクリーニングユーティリティ

**その他:**
- `types.ts` — 全型定義 (500+ lines)
- `validation.ts`, `report.ts` (CSV formatters), `accuracy-warnings.ts`
- `bookmark.ts`, `evaluation-history.ts`, `csv-import.ts`
- `ghs-safety.ts`, `theme.ts`, `pdf-report.ts`

### src/db/ (12 files, ~1780 lines)
- `schema.ts` — 9 tables + 2 indexes
- `repository.ts` — 8 repository interfaces + DTOs
- `sqlite-repository.ts` — 8 SQLite implementations
- `bookmark-repository.ts`, `history-repository.ts` — 新機能用repos
- 7 seed files: solvents(135), nano-particles(18), drugs(16), coatings(12), plasticizers(10), carriers(11), dispersants(~10)

### src/main/ (3 files, ~2,700 lines)
- `main.ts` — App startup, DB init, auto-updater
- `ipc-handlers.ts` — **190+ IPC handlers** (CRUD + 90+評価 + ブックマーク + 履歴 + インポート)
- `preload.ts` — Context-isolated bridge (10,757 lines)

### src/renderer/ (226 files, ~18,500 lines)
- `App.tsx` — MD3 responsive layout + `useTheme()` + VIEW_MAP (96 entries)
- `navigation.ts` — 6カテゴリ・96タブ (90+評価パイプライン)
- `components/` — 142 components (93 Views, 45+ Badges, 3 Nav, SortTableHeader, BookmarkButton, etc.)
- `hooks/` — 79 hooks (useCsvExport, useSortableTable, useBookmarks, useTheme, useDispersantSelection, etc.)

### src/i18n/ (2 files)
- `translations.ts` — ja/en 60+キー
- `index.ts` — i18next初期化

### tests/ (227 files, 2604 unit/renderer + 295 E2E)

## Database Schema (9 tables)

| Table | Rows | Purpose |
|-------|------|---------|
| `parts_groups` | ~10 | Material groups |
| `parts` | ~83 | Polymers + coatings + carriers |
| `solvents` | ~95 | Solvents + plasticizers (tagged) |
| `nano_particles` | 18 | Nanoparticle materials |
| `drugs` | 16 | Pharmaceutical APIs |
| `dispersants` | ~10 | Surfactant dispersants (dual-HSP) |
| `settings` | ~10 | Config (key-value) |
| `bookmarks` | dynamic | 評価条件のブックマーク |
| `evaluation_history` | dynamic (≤1000) | 評価結果の自動保存 |

## File Statistics

| Category | Files | Lines | Key Contents |
|----------|-------|-------|-------------|
| **Core** | 117 | 15,400 | 90+評価エンジン, 10分類器, ユーティリティ |
| **Database** | 12 | 2,100 | Schema, 8 repos, 7 seed files |
| **Main** | 3 | 2,700 | Electron, IPC (190+), preload |
| **Renderer** | 226 | 18,500 | 142 components, 79 hooks, i18n |
| **Tests** | 227 | — | 2604 unit/renderer + 295 E2E (30 specs) |
| **Total** | 588 | 39,500+ | — |

---

**Last Updated:** 2026-03-24 | **Status:** 90+ evaluation pipelines complete, core coverage 98.88%, all 2604 tests passing
